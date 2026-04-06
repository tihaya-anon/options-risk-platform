import { enrichSnapshot } from "./enrich";
import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
  OptionSnapshotFile,
} from "../types";
import type { GetConfig200 } from "../api/generated/model/getConfig200";
import type { GetHealth200 } from "../api/generated/model/getHealth200";
import type { BookSnapshot } from "../api/generated/model/bookSnapshot";
import type { ExposureSummary } from "../api/generated/model/exposureSummary";
import type { HedgeProposal } from "../api/generated/model/hedgeProposal";
import type { HedgeProposalResponse } from "../api/generated/model/hedgeProposalResponse";
import type { HedgeUniverse } from "../api/generated/model/hedgeUniverse";
import type { RiskItem } from "../api/generated/model/riskItem";
import { RiskItemSeverity } from "../api/generated/model/riskItemSeverity";
import type { RiskMap } from "../api/generated/model/riskMap";
import type { StrategyComparison } from "../api/generated/model/strategyComparison";
import type { StrategyComparisonRow } from "../api/generated/model/strategyComparisonRow";
import {
  type GroupedExposure,
  parsePositionsInput,
} from "../ui/positions";
import { blackScholesModel } from "./bs";

const STATIC_MANIFEST_URL = "/data/latest/manifest.json";
const STATIC_FALLBACK_SNAPSHOT_URL = "/data/latest.json";
const DEFAULT_STATIC_PROVIDER = "staticDaily";
const DEFAULT_STATIC_SYMBOL = "SPY";

interface StaticManifest {
  asOf: string;
  provider?: string;
  defaultSymbol: string;
  symbols: Array<{
    symbol: string;
    path: string;
    generatedAt: string;
  }>;
}

export interface StaticDatasetInfo {
  mode: "static";
  asOf: string | null;
  defaultSymbol: string;
  symbols: string[];
}

interface StaticUniverseContext {
  snapshots: EnrichedSnapshotFile[];
  quoteMap: Map<string, EnrichedSnapshotFile["quotes"][number]>;
  underlyingMap: Map<string, EnrichedSnapshotFile["underlying"]>;
  primarySnapshot: EnrichedSnapshotFile;
}

function parseOptionContractSymbol(symbol: string) {
  const match = symbol.match(/^([A-Z]+)(\d{6})([CP])(\d{8})$/);
  if (!match) return null;

  const [, underlying, yymmdd, optionFlag, strikeDigits] = match;
  const year = Number(`20${yymmdd.slice(0, 2)}`);
  const month = yymmdd.slice(2, 4);
  const day = yymmdd.slice(4, 6);
  const strikeValue = Number(strikeDigits);

  return {
    underlying,
    expiry: `${year}-${month}-${day}`,
    optionType: optionFlag === "C" ? "call" : "put",
    strike: strikeValue >= 10000 ? strikeValue / 1000 : strikeValue,
  } as const;
}

async function tryFetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function isStaticDemoMode(apiBaseUrl: string): boolean {
  const normalized = apiBaseUrl.trim().toLowerCase();
  return normalized === "" || normalized === "static" || normalized === "static-daily";
}

export async function fetchStaticRuntimeConfig(): Promise<GetConfig200> {
  const manifest = await tryFetchJson<StaticManifest>(STATIC_MANIFEST_URL);

  return {
    provider: DEFAULT_STATIC_PROVIDER,
    defaultSymbol: manifest?.defaultSymbol ?? DEFAULT_STATIC_SYMBOL,
    llmAdvisorMode: "disabled",
    providers: [DEFAULT_STATIC_PROVIDER],
    advisorModes: ["rules"],
    providerMetadata: [
      {
        id: DEFAULT_STATIC_PROVIDER,
        label: "Static daily snapshot",
        requiresApiKey: false,
        supportsSnapshots: true,
        supportsOptionChain: true,
        supportsGreeks: true,
        supportsScenarios: true,
        notes:
          `Loads daily T-1 snapshots from GitHub Actions. Public source: ${
            manifest?.provider ?? "CN public market data"
          }. Universe: ${
            manifest?.symbols.map((item) => item.symbol).join(", ") ?? DEFAULT_STATIC_SYMBOL
          }. As of ${manifest?.asOf ?? "unknown"}.`,
      },
    ],
  };
}

export async function fetchStaticHealth(): Promise<GetHealth200> {
  return {
    ok: true,
    provider: DEFAULT_STATIC_PROVIDER,
  };
}

export async function fetchStaticSnapshot(
  symbol: string,
): Promise<EnrichedSnapshotFile> {
  const manifest = await tryFetchJson<StaticManifest>(STATIC_MANIFEST_URL);
  const normalizedSymbol = symbol.trim().toUpperCase() || manifest?.defaultSymbol || DEFAULT_STATIC_SYMBOL;

  const manifestEntry = manifest?.symbols.find((item) => item.symbol === normalizedSymbol);
  const rawSnapshot =
    (manifestEntry && (await tryFetchJson<OptionSnapshotFile>(manifestEntry.path))) ||
    (await tryFetchJson<OptionSnapshotFile>(`/data/latest/${normalizedSymbol}.json`)) ||
    (await tryFetchJson<OptionSnapshotFile>(STATIC_FALLBACK_SNAPSHOT_URL));

  if (!rawSnapshot) {
    throw new Error("Static snapshot not found.");
  }

  return {
    ...rawSnapshot,
    quotes: enrichSnapshot(rawSnapshot),
  };
}

export async function fetchStaticDatasetInfo(): Promise<StaticDatasetInfo> {
  const manifest = await tryFetchJson<StaticManifest>(STATIC_MANIFEST_URL);
  return {
    mode: "static",
    asOf: manifest?.asOf ?? null,
    defaultSymbol: manifest?.defaultSymbol ?? DEFAULT_STATIC_SYMBOL,
    symbols: manifest?.symbols.map((item) => item.symbol) ?? [DEFAULT_STATIC_SYMBOL],
  };
}

export async function fetchStaticUniverseSnapshots(): Promise<EnrichedSnapshotFile[]> {
  const manifest = await tryFetchJson<StaticManifest>(STATIC_MANIFEST_URL);
  const symbolList = manifest?.symbols.map((item) => item.symbol) ?? [DEFAULT_STATIC_SYMBOL];

  const snapshots = await Promise.all(
    symbolList.map((symbol) => fetchStaticSnapshot(symbol)),
  );

  return snapshots.filter(Boolean);
}

function buildStaticUniverseContext(input: {
  snapshots: EnrichedSnapshotFile[];
  primarySymbol?: string;
}): StaticUniverseContext {
  const quoteMap = new Map<string, EnrichedSnapshotFile["quotes"][number]>();
  const underlyingMap = new Map<string, EnrichedSnapshotFile["underlying"]>();

  for (const snapshot of input.snapshots) {
    underlyingMap.set(snapshot.underlying.symbol, snapshot.underlying);
    for (const quote of snapshot.quotes) {
      quoteMap.set(quote.symbol, quote);
    }
  }

  const primarySnapshot =
    input.snapshots.find((snapshot) => snapshot.underlying.symbol === input.primarySymbol) ??
    input.snapshots[0];

  if (!primarySnapshot) {
    throw new Error("Static universe is empty.");
  }

  return {
    snapshots: input.snapshots,
    quoteMap,
    underlyingMap,
    primarySnapshot,
  };
}

function aggregateStaticPortfolioExposure(
  context: StaticUniverseContext,
  positions: ReturnType<typeof parsePositionsInput>["positions"],
) {
  const unmatchedSymbols: string[] = [];
  let netDelta = 0;
  let netGamma = 0;
  let netVega = 0;
  let netTheta = 0;
  let marketValue = 0;

  for (const position of positions) {
    const normalizedSymbol = position.symbol.toUpperCase();
    const underlying = context.underlyingMap.get(normalizedSymbol);
    if (underlying) {
      netDelta += position.quantity;
      marketValue += position.quantity * underlying.spot;
      continue;
    }

    const quote = context.quoteMap.get(normalizedSymbol);
    if (!quote) {
      unmatchedSymbols.push(position.symbol);
      continue;
    }

    const contractScale = position.quantity * 100;
    netDelta += (quote.delta ?? 0) * contractScale;
    netGamma += (quote.gamma ?? 0) * contractScale;
    netVega += (quote.vega ?? 0) * contractScale;
    netTheta += (quote.theta ?? 0) * contractScale;
    marketValue += quote.mid * contractScale;
  }

  return {
    netDelta,
    netGamma,
    netVega,
    netTheta,
    marketValue,
    unmatchedSymbols,
  };
}

function calculateStaticSpotScenarios(
  context: StaticUniverseContext,
  positions: ReturnType<typeof parsePositionsInput>["positions"],
) {
  const baselineExposure = aggregateStaticPortfolioExposure(context, positions);
  const baselineValue = baselineExposure.marketValue;
  const spotShocks = [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2];
  const anchorSpot = context.primarySnapshot.underlying.spot;

  return spotShocks.map((shock) => {
    let portfolioValue = 0;

    for (const position of positions) {
      const normalizedSymbol = position.symbol.toUpperCase();
      const underlying = context.underlyingMap.get(normalizedSymbol);
      if (underlying) {
        portfolioValue += position.quantity * underlying.spot * (1 + shock);
        continue;
      }

      const quote = context.quoteMap.get(normalizedSymbol);
      if (!quote || quote.impliedVol === null) {
        continue;
      }

      const quoteUnderlying = context.underlyingMap.get(quote.underlying);
      if (!quoteUnderlying) {
        continue;
      }

      const shockedSpot = quoteUnderlying.spot * (1 + shock);
      const price = blackScholesModel.price(
        shockedSpot,
        quote.strike,
        context.primarySnapshot.riskFreeRate,
        quote.timeToExpiryYears,
        quote.impliedVol,
        quote.optionType,
      );
      portfolioValue += position.quantity * 100 * price;
    }

    return {
      spot: anchorSpot * (1 + shock),
      spotChangePct: shock,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

function calculateStaticVolScenarios(
  context: StaticUniverseContext,
  positions: ReturnType<typeof parsePositionsInput>["positions"],
) {
  const baselineExposure = aggregateStaticPortfolioExposure(context, positions);
  const baselineValue = baselineExposure.marketValue;
  const volShifts = [-0.1, -0.05, -0.02, 0, 0.02, 0.05, 0.1];

  return volShifts.map((volShift) => {
    let portfolioValue = 0;

    for (const position of positions) {
      const normalizedSymbol = position.symbol.toUpperCase();
      const underlying = context.underlyingMap.get(normalizedSymbol);
      if (underlying) {
        portfolioValue += position.quantity * underlying.spot;
        continue;
      }

      const quote = context.quoteMap.get(normalizedSymbol);
      if (!quote || quote.impliedVol === null) {
        continue;
      }

      const quoteUnderlying = context.underlyingMap.get(quote.underlying);
      if (!quoteUnderlying) {
        continue;
      }

      const shockedVol = Math.max(quote.impliedVol + volShift, 0.0001);
      const price = blackScholesModel.price(
        quoteUnderlying.spot,
        quote.strike,
        context.primarySnapshot.riskFreeRate,
        quote.timeToExpiryYears,
        shockedVol,
        quote.optionType,
      );

      portfolioValue += position.quantity * 100 * price;
    }

    return {
      volShift,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

function calculateStaticTimeScenarios(
  context: StaticUniverseContext,
  positions: ReturnType<typeof parsePositionsInput>["positions"],
) {
  const baselineExposure = aggregateStaticPortfolioExposure(context, positions);
  const baselineValue = baselineExposure.marketValue;
  const dayShifts = [0, 3, 7, 14, 21, 30];

  return dayShifts.map((daysForward) => {
    let portfolioValue = 0;

    for (const position of positions) {
      const normalizedSymbol = position.symbol.toUpperCase();
      const underlying = context.underlyingMap.get(normalizedSymbol);
      if (underlying) {
        portfolioValue += position.quantity * underlying.spot;
        continue;
      }

      const quote = context.quoteMap.get(normalizedSymbol);
      if (!quote || quote.impliedVol === null) {
        continue;
      }

      const quoteUnderlying = context.underlyingMap.get(quote.underlying);
      if (!quoteUnderlying) {
        continue;
      }

      const shockedTime = Math.max(quote.timeToExpiryYears - daysForward / 365, 1 / 3650);
      const price = blackScholesModel.price(
        quoteUnderlying.spot,
        quote.strike,
        context.primarySnapshot.riskFreeRate,
        shockedTime,
        quote.impliedVol,
        quote.optionType,
      );

      portfolioValue += position.quantity * 100 * price;
    }

    return {
      daysForward,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

function calculateStaticGroupedExposures(
  context: StaticUniverseContext,
  positions: ReturnType<typeof parsePositionsInput>["positions"],
  groupByMode: GroupByMode,
) {
  const bucketMap = new Map<string, GroupedExposure>();

  for (const position of positions) {
    const normalizedSymbol = position.symbol.toUpperCase();
    const underlying = context.underlyingMap.get(normalizedSymbol);
    const quote = context.quoteMap.get(normalizedSymbol);

    let bucket = `${position.symbol} | unmatched`;
    if (underlying) {
      bucket =
        groupByMode === "symbol"
          ? underlying.symbol
          : `${underlying.symbol} | underlying`;
    } else if (quote) {
      switch (groupByMode) {
        case "symbol":
          bucket = quote.underlying;
          break;
        case "expiry":
          bucket = quote.expiry;
          break;
        case "optionType":
          bucket = quote.optionType;
          break;
        case "symbolExpiry":
          bucket = `${quote.underlying} | ${quote.expiry}`;
          break;
        case "full":
        default:
          bucket = `${quote.underlying} | ${quote.expiry} | ${quote.optionType}`;
          break;
      }
    }

    const exposure =
      bucketMap.get(bucket) ??
      {
        bucket,
        quantity: 0,
        marketValue: 0,
        netDelta: 0,
        netGamma: 0,
        netVega: 0,
        netTheta: 0,
      };

    exposure.quantity += position.quantity;

    if (underlying) {
      exposure.marketValue += position.quantity * underlying.spot;
      exposure.netDelta += position.quantity;
    } else if (quote) {
      const contractScale = position.quantity * 100;
      exposure.marketValue += quote.mid * contractScale;
      exposure.netDelta += (quote.delta ?? 0) * contractScale;
      exposure.netGamma += (quote.gamma ?? 0) * contractScale;
      exposure.netVega += (quote.vega ?? 0) * contractScale;
      exposure.netTheta += (quote.theta ?? 0) * contractScale;
    }

    bucketMap.set(bucket, exposure);
  }

  return [...bucketMap.values()].sort(
    (left, right) => Math.abs(right.netVega) - Math.abs(left.netVega),
  );
}

export function buildStaticAnalysis(input: {
  snapshot: EnrichedSnapshotFile;
  universeSnapshots?: EnrichedSnapshotFile[];
  positionsInput: string;
  groupByMode: GroupByMode;
  advisorMode: string;
}): AnalysisResponse {
  const context = buildStaticUniverseContext({
    snapshots: input.universeSnapshots?.length ? input.universeSnapshots : [input.snapshot],
    primarySymbol: input.snapshot.underlying.symbol,
  });
  const parsedPositions = parsePositionsInput(input.positionsInput);
  const exposure = aggregateStaticPortfolioExposure(context, parsedPositions.positions);
  const groupedExposures = calculateStaticGroupedExposures(
    context,
    parsedPositions.positions,
    input.groupByMode,
  ) as unknown as AnalysisResponse["groupedExposures"];

  const suggestions: AnalysisResponse["advisor"]["suggestions"] = [];
  if (Math.abs(exposure.netDelta) > 150) {
    suggestions.push({
      risk: "Directional exposure is concentrated.",
      action: "Review hedge overlays or trim net delta before large event risk.",
      source: input.advisorMode === "llm" ? "llm-placeholder" : "rules",
    });
  }
  if (Math.abs(exposure.netVega) > 80) {
    suggestions.push({
      risk: "Portfolio vega is elevated.",
      action: "Compare vol shock and term structure before adding more long premium.",
      source: input.advisorMode === "llm" ? "llm-placeholder" : "rules",
    });
  }
  if (suggestions.length === 0) {
    suggestions.push({
      risk: "No extreme headline risk detected in the current book.",
      action: "Use grouped exposure and scenarios to inspect concentration by expiry and option side.",
      source: input.advisorMode === "llm" ? "llm-placeholder" : "rules",
    });
  }

  return {
    parsedPositions,
    exposure,
    spotScenarios: calculateStaticSpotScenarios(context, parsedPositions.positions),
    volScenarios: calculateStaticVolScenarios(context, parsedPositions.positions),
    timeScenarios: calculateStaticTimeScenarios(context, parsedPositions.positions),
    groupedExposures,
    advisor: {
      source: input.advisorMode === "llm" ? "llm-placeholder" : "rules",
      suggestions,
    },
  };
}

export function buildStaticBook(input: {
  positionsInput: string;
  defaultSymbol?: string;
  snapshot?: EnrichedSnapshotFile | null;
  universeSnapshots?: EnrichedSnapshotFile[];
}): BookSnapshot {
  const context = buildStaticUniverseContext({
    snapshots:
      input.universeSnapshots?.length
        ? input.universeSnapshots
        : input.snapshot
          ? [input.snapshot]
          : [],
    primarySymbol: input.snapshot?.underlying.symbol ?? input.defaultSymbol,
  });
  const parsed = parsePositionsInput(input.positionsInput);
  const positions = parsed.positions.map((position) => {
    const symbol = position.symbol.toUpperCase();

    const underlying = context.underlyingMap.get(symbol);
    if (underlying) {
      return {
        instrumentType: "equity" as const,
        symbol,
        underlying: symbol,
        quantity: position.quantity,
        multiplier: 1,
        markPrice: underlying.spot,
        currency: underlying.currency,
        delta: position.quantity,
        gamma: 0,
        vega: 0,
        theta: 0,
        beta: 1,
      };
    }

    const quote = context.quoteMap.get(symbol);
    if (quote) {
      return {
        instrumentType: "option" as const,
        symbol,
        underlying: quote.underlying,
        quantity: position.quantity,
        multiplier: quote.contractMultiplier ?? 100,
        markPrice: quote.mid,
        expiry: quote.expiry,
        strike: quote.strike,
        optionType: quote.optionType,
        currency: context.underlyingMap.get(quote.underlying)?.currency,
        delta: (quote.delta ?? 0) * position.quantity * 100,
        gamma: (quote.gamma ?? 0) * position.quantity * 100,
        vega: (quote.vega ?? 0) * position.quantity * 100,
        theta: (quote.theta ?? 0) * position.quantity * 100,
        beta: quote.delta ?? 0,
      };
    }

    const parsedOption = parseOptionContractSymbol(symbol);
    if (parsedOption) {
      return {
        instrumentType: "option" as const,
        symbol,
        underlying: parsedOption.underlying,
        quantity: position.quantity,
        multiplier: 100,
        markPrice: 0,
        expiry: parsedOption.expiry,
        strike: parsedOption.strike,
        optionType: parsedOption.optionType,
        delta: 0,
        gamma: 0,
        vega: 0,
        theta: 0,
        beta: 0,
      };
    }

    return {
      instrumentType: "equity" as const,
      symbol,
      underlying: input.defaultSymbol ?? symbol,
      quantity: position.quantity,
      multiplier: 1,
      markPrice: 0,
      delta: position.quantity,
      gamma: 0,
      vega: 0,
      theta: 0,
      beta: 1,
    };
  });

  return {
    asOf: context.primarySnapshot.generatedAt,
    positions,
    parsingErrors: parsed.errors,
  };
}

function summarizeBookExposure(book: BookSnapshot): ExposureSummary {
  const exposure = book.positions.reduce(
    (acc, position) => {
      const marketValue = position.quantity * position.multiplier * position.markPrice;
      acc.marketValue += marketValue;
      acc.grossExposure += Math.abs(marketValue);
      acc.netExposure += marketValue;
      acc.delta += position.delta ?? 0;
      acc.gamma += position.gamma ?? 0;
      acc.vega += position.vega ?? 0;
      acc.theta += position.theta ?? 0;
      return acc;
    },
    {
      marketValue: 0,
      grossExposure: 0,
      netExposure: 0,
      delta: 0,
      gamma: 0,
      vega: 0,
      theta: 0,
      beta: 0,
    },
  );

  const referenceSpot =
    book.positions.find((position) => position.instrumentType === "equity")?.markPrice ?? 500;
  exposure.beta =
    exposure.grossExposure === 0 ? 0 : (exposure.delta * referenceSpot) / exposure.grossExposure;

  return exposure;
}

export function buildStaticRiskMap(book: BookSnapshot): RiskMap {
  const exposure = summarizeBookExposure(book);

  const symbolBuckets = Array.from(
    new Set(book.positions.map((position) => position.underlying ?? position.symbol)),
  );

  const concentrationBySymbol = symbolBuckets
    .map((bucket) =>
      book.positions
        .filter((position) => (position.underlying ?? position.symbol) === bucket)
        .reduce(
          (acc, position) => {
            acc.quantity += position.quantity;
            acc.marketValue += position.quantity * position.multiplier * position.markPrice;
            acc.netDelta += position.delta ?? 0;
            acc.netGamma += position.gamma ?? 0;
            acc.netVega += position.vega ?? 0;
            acc.netTheta += position.theta ?? 0;
            return acc;
          },
          {
            bucket,
            quantity: 0,
            marketValue: 0,
            netDelta: 0,
            netGamma: 0,
            netVega: 0,
            netTheta: 0,
          },
        ),
    )
    .sort((left, right) => Math.abs(right.marketValue) - Math.abs(left.marketValue));

  const expiryBuckets = Array.from(
    new Set(book.positions.map((position) => position.expiry ?? "No expiry")),
  );

  const concentrationByExpiry = expiryBuckets
    .map((bucket) =>
      book.positions
        .filter((position) => (position.expiry ?? "No expiry") === bucket)
        .reduce(
          (acc, position) => {
            acc.quantity += position.quantity;
            acc.marketValue += position.quantity * position.multiplier * position.markPrice;
            acc.netDelta += position.delta ?? 0;
            acc.netGamma += position.gamma ?? 0;
            acc.netVega += position.vega ?? 0;
            acc.netTheta += position.theta ?? 0;
            return acc;
          },
          {
            bucket,
            quantity: 0,
            marketValue: 0,
            netDelta: 0,
            netGamma: 0,
            netVega: 0,
            netTheta: 0,
          },
        ),
    )
    .sort((left, right) => Math.abs(right.marketValue) - Math.abs(left.marketValue));

  const topRisks: RiskItem[] = [];
  if (Math.abs(exposure.beta) > 0.6) {
    topRisks.push({
      category: "directional",
      severity: Math.abs(exposure.beta) > 1 ? RiskItemSeverity.high : RiskItemSeverity.medium,
      summary: "Directional beta exposure is elevated.",
      details: `Current beta proxy is ${exposure.beta.toFixed(2)}.`,
    });
  }
  if (Math.abs(exposure.vega) > 50) {
    topRisks.push({
      category: "volatility",
      severity: Math.abs(exposure.vega) > 100 ? RiskItemSeverity.high : RiskItemSeverity.medium,
      summary: "Net vega exposure is elevated.",
      details: `Current vega is ${exposure.vega.toFixed(2)}.`,
    });
  }
  if (concentrationBySymbol[0]) {
    topRisks.push({
      category: "concentration",
      severity: RiskItemSeverity.medium,
      summary: `The book is concentrated in ${concentrationBySymbol[0].bucket}.`,
      details: `${concentrationBySymbol[0].bucket} contributes the largest market value slice.`,
    });
  }
  if (concentrationByExpiry[0] && concentrationByExpiry[0].bucket !== "No expiry") {
    topRisks.push({
      category: "expiry",
      severity: RiskItemSeverity.low,
      summary: `Expiry concentration is elevated in ${concentrationByExpiry[0].bucket}.`,
      details: `${concentrationByExpiry[0].bucket} currently dominates expiry-level risk.`,
    });
  }

  return {
    exposure,
    topRisks,
    concentrationBySymbol,
    concentrationByExpiry,
  };
}

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

function buildFuturesOverlayProposal(exposure: ExposureSummary, target: string): HedgeProposal {
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
    hedgeRatio: exposure.delta === 0 ? 0 : -exposure.delta / 50,
    estimatedCost: Math.abs(exposure.delta === 0 ? 0 : -exposure.delta / 50) * 12.5,
    residualExposure,
    notes: ["Efficient for linear beta reduction."],
    rationale: {
      why: ["Fastest way to neutralize linear delta and beta with low implementation friction."],
      tradeOffs: ["Reduces upside participation almost as much as downside sensitivity."],
      residualRisks: ["Gamma, vega, and event-driven gap risk remain in the book."],
    },
  };
}

function buildProtectivePutProposal(exposure: ExposureSummary, target: string): HedgeProposal {
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
    notes: ["More expensive than futures but provides asymmetric downside protection."],
    rationale: {
      why: ["Best fit when downside convexity matters more than perfect delta neutrality."],
      tradeOffs: ["Premium cost creates negative carry and larger theta bleed."],
      residualRisks: ["Upside is retained, but net delta and beta are only partially reduced."],
    },
  };
}

function buildCollarProposal(exposure: ExposureSummary, target: string): HedgeProposal {
  const residualExposure = cloneExposure(exposure);
  residualExposure.delta = target === "reduce-beta" ? exposure.delta * 0.28 : exposure.delta * 0.22;
  residualExposure.beta = target === "tail-protection" ? exposure.beta * 0.42 : exposure.beta * 0.3;
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
    notes: ["Cheaper than outright puts by financing part of the premium with call overwrite."],
    rationale: {
      why: ["Balances lower carry with better downside shape than a pure futures overlay."],
      tradeOffs: ["Surrenders upside beyond the short call strike."],
      residualRisks: ["Residual downside remains below the put strike and above any unhedged notional."],
    },
  };
}

export function buildStaticHedgeLab(input: {
  book: BookSnapshot;
  target?: string;
  hedgeUniverse?: HedgeUniverse;
}): HedgeProposalResponse {
  const baselineExposure = summarizeBookExposure(input.book);
  const target = input.target ?? "neutralize-delta";
  const hedgeUniverse = input.hedgeUniverse ?? "futuresAndOptions";
  const proposals: HedgeProposal[] = [buildNoHedgeProposal(baselineExposure)];

  if (hedgeUniverse !== "optionsOnly") {
    proposals.push(buildFuturesOverlayProposal(baselineExposure, target));
  }
  if (hedgeUniverse !== "futuresOnly") {
    proposals.push(buildProtectivePutProposal(baselineExposure, target));
    proposals.push(buildCollarProposal(baselineExposure, target));
  }

  return {
    baselineExposure,
    proposals,
  };
}

export function buildStaticStrategyCompare(input: {
  baselineExposure: ExposureSummary;
  proposals: HedgeProposal[];
}): StrategyComparison {
  const rows: StrategyComparisonRow[] = input.proposals.map((proposal) => ({
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
  }));

  return {
    baselineExposure: input.baselineExposure,
    rows,
  };
}
