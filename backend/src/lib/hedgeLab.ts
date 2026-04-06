import type {
  ExposureSummary,
  HedgeLabRequest,
  HedgeProposal,
  HedgeProposalResponse,
  HedgeType,
  HedgeUniverse,
  StrategyCompareRequest,
  StrategyComparison,
} from "../types.js";
import { summarizeBookExposure } from "./bookWorkbench.js";

const FUTURES_MULTIPLIER = 50;
const DEFAULT_TARGET = "neutralize-delta";

function cloneExposure(exposure: ExposureSummary): ExposureSummary {
  return { ...exposure };
}

function buildNoHedgeProposal(exposure: ExposureSummary): HedgeProposal {
  return {
    id: "baseline",
    hedgeType: "none",
    label: "No hedge",
    summary: "Keep the current book unchanged as the baseline reference.",
    residualExposure: cloneExposure(exposure),
    estimatedCost: 0,
    hedgeRatio: 0,
    instrument: null,
    notes: ["Useful as the control case for hedge comparisons."],
    rationale: {
      why: ["Preserves the current payoff profile and avoids adding execution risk."],
      tradeOffs: ["Leaves all existing directional and convexity risks untouched."],
      residualRisks: ["Current book drawdown, gap risk, and volatility sensitivity remain unchanged."],
    },
  };
}

function buildFuturesOverlayProposal(
  exposure: ExposureSummary,
  target: string,
): HedgeProposal {
  const hedgeContracts = exposure.delta === 0 ? 0 : -exposure.delta / FUTURES_MULTIPLIER;
  const residualExposure = cloneExposure(exposure);
  residualExposure.delta = target === "reduce-beta" ? exposure.delta * 0.35 : 0;
  residualExposure.beta =
    target === "reduce-beta" ? residualExposure.beta * 0.05 : residualExposure.beta * 0.15;

  return {
    id: "futures-overlay",
    hedgeType: "futuresOverlay",
    label: "Futures overlay",
    summary:
      target === "reduce-beta"
        ? "Use a linear futures overlay to compress most market beta efficiently."
        : "Use a linear futures overlay to neutralize most directional exposure.",
    instrument: "FUT:SPY",
    hedgeRatio: hedgeContracts,
    estimatedCost: Math.abs(hedgeContracts) * 12.5,
    residualExposure,
    notes: [
      "Efficient for linear beta reduction.",
      "Preserves little upside convexity; still leaves volatility and gap risk largely unchanged.",
    ],
    rationale: {
      why: [
        "Fastest way to neutralize linear delta and beta with low implementation friction.",
        "Most capital-efficient overlay when the primary concern is market direction.",
      ],
      tradeOffs: [
        "Reduces upside participation almost as much as downside sensitivity.",
        "Adds little protection against volatility expansion or discontinuous gap moves.",
      ],
      residualRisks: [
        "Gamma, vega, and event-driven gap risk remain in the book.",
        "Basis risk can remain if the hedge future and portfolio exposures are not perfectly aligned.",
      ],
    },
  };
}

function buildProtectivePutProposal(
  exposure: ExposureSummary,
  target: string,
): HedgeProposal {
  const residualExposure = cloneExposure(exposure);
  residualExposure.delta = target === "tail-protection" ? exposure.delta * 0.6 : exposure.delta * 0.45;
  residualExposure.beta = target === "tail-protection" ? exposure.beta * 0.7 : exposure.beta * 0.55;
  residualExposure.vega =
    Math.abs(exposure.vega) + Math.max(Math.abs(exposure.delta) * 0.08, target === "tail-protection" ? 35 : 15);
  residualExposure.theta = exposure.theta - Math.max(Math.abs(exposure.delta) * 0.03, target === "tail-protection" ? 16 : 8);

  return {
    id: "protective-put",
    hedgeType: "protectivePut",
    label: "Protective put",
    summary:
      target === "tail-protection"
        ? "Buy downside convexity to improve crash protection while keeping upside open."
        : "Buy downside convexity to reduce drawdown while retaining more upside participation.",
    instrument: "ATM / slight OTM put",
    hedgeRatio: Math.max(Math.abs(exposure.delta) / 100, 1),
    estimatedCost: Math.max(exposure.grossExposure * 0.012, 250),
    residualExposure,
    notes: [
      "More expensive than futures but provides asymmetric downside protection.",
      "Introduces long vega and negative carry through theta.",
    ],
    rationale: {
      why: [
        "Best fit when downside convexity matters more than perfect delta neutrality.",
        "Keeps more upside than a linear futures overlay while improving left-tail protection.",
      ],
      tradeOffs: [
        "Premium cost creates negative carry and larger theta bleed.",
        "Near-term protection quality depends on strike selection and expiry coverage.",
      ],
      residualRisks: [
        "The book can still lose money in moderate selloffs before the put becomes strongly convex.",
        "Upside is retained, but net delta and beta are only partially reduced.",
      ],
    },
  };
}

function buildCollarProposal(
  exposure: ExposureSummary,
  target: string,
): HedgeProposal {
  const residualExposure = cloneExposure(exposure);
  residualExposure.delta =
    target === "reduce-beta" ? exposure.delta * 0.28 : exposure.delta * 0.22;
  residualExposure.beta =
    target === "tail-protection" ? exposure.beta * 0.42 : exposure.beta * 0.3;
  residualExposure.vega = exposure.vega * 0.35;
  residualExposure.theta = exposure.theta - Math.max(Math.abs(exposure.delta) * 0.01, 4);

  return {
    id: "collar",
    hedgeType: "collar",
    label: "Cost-controlled collar",
    summary:
      "Pair a protective put with a covered upside call sale to lower hedge carry while capping some upside.",
    instrument: "OTM put + OTM call",
    hedgeRatio: Math.max(Math.abs(exposure.delta) / 100, 1),
    estimatedCost: Math.max(exposure.grossExposure * 0.0035, 75),
    residualExposure,
    notes: [
      "Cheaper than outright puts by financing part of the premium with call overwrite.",
      "Improves downside protection but gives up part of upside retention.",
    ],
    rationale: {
      why: [
        "Useful when the desk wants drawdown protection but cannot afford persistent long-put carry.",
        "Balances lower carry with better downside shape than a pure futures overlay.",
      ],
      tradeOffs: [
        "Surrenders upside beyond the short call strike.",
        "Protection is less flexible than a standalone put because both wings constrain the payoff.",
      ],
      residualRisks: [
        "Residual downside remains below the put strike and above any unhedged notional.",
        "The short call can underperform sharply in strong upside rallies.",
      ],
    },
  };
}

function resolveAllowedHedgeTypes(request: HedgeLabRequest): HedgeType[] {
  const explicit = request.allowedHedgeTypes;
  if (explicit?.length) {
    return explicit;
  }

  const hedgeUniverse: HedgeUniverse = request.hedgeUniverse ?? "futuresAndOptions";
  switch (hedgeUniverse) {
    case "futuresOnly":
      return ["none", "futuresOverlay"];
    case "optionsOnly":
      return ["none", "protectivePut", "collar"];
    case "futuresAndOptions":
    default:
      return ["none", "futuresOverlay", "protectivePut", "collar"];
  }
}

export function createHedgeProposals(request: HedgeLabRequest): HedgeProposalResponse {
  const baselineExposure = summarizeBookExposure(request.book);
  const allowed = resolveAllowedHedgeTypes(request);
  const target = request.target ?? DEFAULT_TARGET;
  const proposals: HedgeProposal[] = [];

  if (allowed.includes("none")) {
    proposals.push(buildNoHedgeProposal(baselineExposure));
  }
  if (allowed.includes("futuresOverlay")) {
    proposals.push(buildFuturesOverlayProposal(baselineExposure, target));
  }
  if (allowed.includes("protectivePut")) {
    proposals.push(buildProtectivePutProposal(baselineExposure, target));
  }
  if (allowed.includes("collar")) {
    proposals.push(buildCollarProposal(baselineExposure, target));
  }

  if (target === "tail-protection") {
    proposals.sort((left, right) => {
      if (left.hedgeType === "protectivePut") return -1;
      if (right.hedgeType === "protectivePut") return 1;
      if (left.hedgeType === "collar") return -1;
      if (right.hedgeType === "collar") return 1;
      return 0;
    });
  }

  if (target === "reduce-beta") {
    proposals.sort((left, right) => {
      if (left.hedgeType === "futuresOverlay") return -1;
      if (right.hedgeType === "futuresOverlay") return 1;
      return 0;
    });
  }

  return {
    baselineExposure,
    proposals,
  };
}

export function compareStrategies(request: StrategyCompareRequest): StrategyComparison {
  return {
    baselineExposure: request.baselineExposure,
    rows: request.proposals.map((proposal) => ({
      proposalId: proposal.id,
      label: proposal.label,
      estimatedCost: proposal.estimatedCost ?? 0,
      residualExposure: proposal.residualExposure,
      upsideRetention:
        proposal.hedgeType === "futuresOverlay"
          ? 0.35
          : proposal.hedgeType === "protectivePut"
            ? 0.8
            : proposal.hedgeType === "collar"
              ? 0.62
            : 1,
      downsideProtection:
        proposal.hedgeType === "futuresOverlay"
          ? 0.6
          : proposal.hedgeType === "protectivePut"
            ? 0.85
            : proposal.hedgeType === "collar"
              ? 0.72
            : 0,
      carryTheta:
        proposal.hedgeType === "futuresOverlay"
          ? 0
          : proposal.hedgeType === "protectivePut"
            ? -(proposal.estimatedCost ?? 0) * 0.08
            : proposal.hedgeType === "collar"
              ? -(proposal.estimatedCost ?? 0) * 0.03
            : 0,
      explanation: {
        upsideRetention:
          proposal.hedgeType === "futuresOverlay"
            ? "Linear futures hedges suppress both upside and downside participation."
            : proposal.hedgeType === "protectivePut"
              ? "Most upside remains because the hedge only activates meaningfully in selloffs."
              : proposal.hedgeType === "collar"
                ? "Upside is retained until the short call strike, then partially capped."
                : "Full upside is retained because no new hedge is applied.",
        downsideProtection:
          proposal.hedgeType === "futuresOverlay"
            ? "Downside is reduced through delta offset, but no extra convexity is added."
            : proposal.hedgeType === "protectivePut"
              ? "The long put adds convexity and improves left-tail protection in sharp drawdowns."
              : proposal.hedgeType === "collar"
                ? "The put leg cushions downside while the call sale helps finance the hedge."
                : "No additional downside protection beyond the current book.",
        carryTheta:
          proposal.hedgeType === "futuresOverlay"
            ? "Carry is close to neutral aside from roll and basis costs."
            : proposal.hedgeType === "protectivePut"
              ? "Long premium introduces the heaviest theta bleed among the standard hedges."
              : proposal.hedgeType === "collar"
                ? "Selling the call offsets part of the put premium, so carry drag is lower."
                : "No incremental hedge carry is introduced.",
        residualExposure: `Residual delta ${proposal.residualExposure.delta.toFixed(2)}, beta ${proposal.residualExposure.beta.toFixed(2)}, vega ${proposal.residualExposure.vega.toFixed(2)}.`,
      },
    })),
  };
}
