import { blackScholesModel } from "../lib/bs";
import { enrichSnapshot } from "../lib/enrich";
import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
  OptionQuote,
  OptionRight,
  OptionSnapshotFile,
} from "../types";
import {
  aggregatePortfolioExposure,
  calculateGroupedExposures,
  calculatePortfolioScenario,
  calculatePortfolioTimeScenario,
  calculatePortfolioVolScenario,
  parsePositionsInput,
} from "../ui/positions";

const DEFAULT_GENERATED_AT = "2026-04-05T08:00:00Z";
const DEFAULT_RISK_FREE_RATE = 0.045;
const DEFAULT_SPOT = 538.2;

function formatOptionSymbol(
  underlying: string,
  expiry: string,
  optionType: OptionRight,
  strike: number
) {
  const compactExpiry = expiry.slice(2).replace(/-/g, "");
  const right = optionType === "call" ? "C" : "P";
  const encodedStrike = Math.round(strike * 1000).toString().padStart(8, "0");
  return `${underlying.toUpperCase()}${compactExpiry}${right}${encodedStrike}`;
}

function buildOptionQuote(
  underlying: string,
  spot: number,
  expiry: string,
  strike: number,
  optionType: OptionRight,
  volatility: number,
  riskFreeRate: number
): OptionQuote {
  const generatedAt = DEFAULT_GENERATED_AT;
  const expiryDate = new Date(`${expiry}T20:00:00Z`);
  const now = new Date(generatedAt);
  const timeToExpiryYears = Math.max(
    (expiryDate.getTime() - now.getTime()) / (365 * 24 * 60 * 60 * 1000),
    1 / 365
  );
  const mid = blackScholesModel.price(
    spot,
    strike,
    riskFreeRate,
    timeToExpiryYears,
    volatility,
    optionType
  );
  const spread = Math.max(mid * 0.03, 0.05);

  return {
    symbol: formatOptionSymbol(underlying, expiry, optionType, strike),
    underlying,
    optionType,
    strike,
    expiry,
    bid: Math.max(mid - spread / 2, 0.01),
    ask: Math.max(mid + spread / 2, 0.02),
    last: mid,
    volume: Math.round(200 + Math.abs(strike - spot) * 6),
    openInterest: Math.round(900 + Math.abs(strike - spot) * 20),
  };
}

export function buildMockSnapshot(symbol: string, provider: string): EnrichedSnapshotFile {
  const normalizedSymbol = symbol.toUpperCase();
  const spot = normalizedSymbol === "QQQ" ? 471.3 : DEFAULT_SPOT;
  const expiries = ["2026-04-17", "2026-05-15", "2026-06-19"];
  const strikes =
    normalizedSymbol === "QQQ"
      ? [430, 450, 470, 490, 510]
      : [500, 525, 540, 560, 580];

  const quotes: OptionQuote[] = [];
  for (const expiry of expiries) {
    for (const strike of strikes) {
      const moneyness = Math.abs(strike - spot) / spot;
      const volBase = 0.19 + moneyness * 0.35;
      quotes.push(
        buildOptionQuote(
          normalizedSymbol,
          spot,
          expiry,
          strike,
          "call",
          volBase,
          DEFAULT_RISK_FREE_RATE
        )
      );
      quotes.push(
        buildOptionQuote(
          normalizedSymbol,
          spot,
          expiry,
          strike,
          "put",
          volBase + 0.025,
          DEFAULT_RISK_FREE_RATE
        )
      );
    }
  }

  const snapshot: OptionSnapshotFile = {
    source: provider === "yahooSynthetic" ? "Yahoo spot + synthetic chain" : "Mock provider",
    generatedAt: DEFAULT_GENERATED_AT,
    riskFreeRate: DEFAULT_RISK_FREE_RATE,
    underlying: {
      symbol: normalizedSymbol,
      spot,
      currency: "USD",
      timestamp: DEFAULT_GENERATED_AT,
    },
    quotes,
  };

  return {
    ...snapshot,
    quotes: enrichSnapshot(snapshot),
  };
}

export function analyzeMockPortfolio(input: {
  snapshot: EnrichedSnapshotFile;
  positionsInput: string;
  groupByMode: GroupByMode;
  advisorMode: string;
}): AnalysisResponse {
  const parsedPositions = parsePositionsInput(input.positionsInput);
  const exposure = aggregatePortfolioExposure(
    input.snapshot,
    input.snapshot.quotes,
    parsedPositions.positions
  );
  const groupedExposures = calculateGroupedExposures(
    input.snapshot,
    input.snapshot.quotes,
    parsedPositions.positions,
    input.groupByMode
  );

  const suggestions = [];
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
      risk: "No extreme headline risk detected in the mock portfolio.",
      action: "Use grouped exposure and scenarios to inspect concentration by expiry and option side.",
      source: input.advisorMode === "llm" ? "llm-placeholder" : "rules",
    });
  }

  return {
    parsedPositions,
    exposure,
    spotScenarios: calculatePortfolioScenario(
      input.snapshot,
      input.snapshot.quotes,
      parsedPositions.positions
    ),
    volScenarios: calculatePortfolioVolScenario(
      input.snapshot,
      input.snapshot.quotes,
      parsedPositions.positions
    ),
    timeScenarios: calculatePortfolioTimeScenario(
      input.snapshot,
      input.snapshot.quotes,
      parsedPositions.positions
    ),
    groupedExposures,
    advisor: {
      source: input.advisorMode === "llm" ? "llm-placeholder" : "rules",
      suggestions,
    },
  };
}
