import type {
  ExposureSummary,
  HedgeLabRequest,
  HedgeProposal,
  HedgeProposalResponse,
  HedgeType,
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
  };
}

export function createHedgeProposals(request: HedgeLabRequest): HedgeProposalResponse {
  const baselineExposure = summarizeBookExposure(request.book);
  const allowed = request.allowedHedgeTypes ?? ["none", "futuresOverlay", "protectivePut"];
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

  if (target === "tail-protection") {
    proposals.sort((left, right) => {
      if (left.hedgeType === "protectivePut") return -1;
      if (right.hedgeType === "protectivePut") return 1;
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
            : 1,
      downsideProtection:
        proposal.hedgeType === "futuresOverlay"
          ? 0.6
          : proposal.hedgeType === "protectivePut"
            ? 0.85
            : 0,
      carryTheta:
        proposal.hedgeType === "futuresOverlay"
          ? 0
          : proposal.hedgeType === "protectivePut"
            ? -(proposal.estimatedCost ?? 0) * 0.08
            : 0,
    })),
  };
}
