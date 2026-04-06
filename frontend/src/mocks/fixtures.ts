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
import type { BookSnapshot } from "../api/generated/model/bookSnapshot";
import type { RiskItem } from "../api/generated/model/riskItem";
import type { RiskMap } from "../api/generated/model/riskMap";
import { RiskItemSeverity } from "../api/generated/model/riskItemSeverity";
import {
  aggregatePortfolioExposure,
  calculateGroupedExposures,
  calculatePortfolioScenario,
  calculatePortfolioTimeScenario,
  calculatePortfolioVolScenario,
  parsePositionsInput,
} from "../ui/positions";

const DEFAULT_GENERATED_AT = "2026-04-05T08:00:00Z";
const DEFAULT_RISK_FREE_RATE = 0.015;
const MOCK_UNDERLYING_CONFIG: Record<
  string,
  {
    spot: number;
    currency: string;
    contractMultiplier: number;
    expiries: string[];
    strikes: number[];
    putSkew: number;
  }
> = {
  "510050": {
    spot: 2.926,
    currency: "CNY",
    contractMultiplier: 10000,
    expiries: ["2026-04-22", "2026-05-27", "2026-06-24"],
    strikes: [2.65, 2.7, 2.75, 2.8, 2.85, 2.9, 2.95],
    putSkew: 0.02,
  },
  "510300": {
    spot: 4.454,
    currency: "CNY",
    contractMultiplier: 10000,
    expiries: ["2026-04-22", "2026-05-27", "2026-06-24"],
    strikes: [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7],
    putSkew: 0.018,
  },
  "510500": {
    spot: 7.603,
    currency: "CNY",
    contractMultiplier: 10000,
    expiries: ["2026-04-22", "2026-05-27", "2026-06-24"],
    strikes: [7.0, 7.2, 7.4, 7.6, 7.8, 8.0, 8.2],
    putSkew: 0.022,
  },
};

function formatOptionSymbol(
  underlying: string,
  expiry: string,
  optionType: OptionRight,
  strike: number
) {
  if (/^\d+$/.test(underlying)) {
    const yymm = expiry.slice(2, 7).replace("-", "");
    const right = optionType === "call" ? "C" : "P";
    const encodedStrike = Math.round(strike * 1000).toString().padStart(5, "0");
    return `${underlying}${right}${yymm}M${encodedStrike}`;
  }
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
  riskFreeRate: number,
  contractMultiplier: number,
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
    contractMultiplier,
    bid: Math.max(mid - spread / 2, 0.01),
    ask: Math.max(mid + spread / 2, 0.02),
    last: mid,
    volume: Math.round(200 + Math.abs(strike - spot) * 6),
    openInterest: Math.round(900 + Math.abs(strike - spot) * 20),
  };
}

export function buildMockSnapshot(symbol: string, provider: string): EnrichedSnapshotFile {
  const normalizedSymbol = symbol.toUpperCase();
  const config = MOCK_UNDERLYING_CONFIG[normalizedSymbol] ?? MOCK_UNDERLYING_CONFIG["510050"];
  const spot = config.spot;
  const expiries = config.expiries;
  const strikes = config.strikes;

  const quotes: OptionQuote[] = [];
  for (const expiry of expiries) {
    for (const strike of strikes) {
      const moneyness = Math.abs(strike - spot) / spot;
      const volBase = 0.16 + moneyness * 0.3;
      quotes.push(
        buildOptionQuote(
          normalizedSymbol,
          spot,
          expiry,
          strike,
          "call",
          volBase,
          DEFAULT_RISK_FREE_RATE,
          config.contractMultiplier,
        )
      );
      quotes.push(
        buildOptionQuote(
          normalizedSymbol,
          spot,
          expiry,
          strike,
          "put",
          volBase + config.putSkew,
          DEFAULT_RISK_FREE_RATE,
          config.contractMultiplier,
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
      currency: config.currency,
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

export function buildMockBook(input: {
  positionsInput: string;
  defaultSymbol?: string;
  snapshot?: EnrichedSnapshotFile;
}): BookSnapshot {
  const parsed = parsePositionsInput(input.positionsInput);
  const positions = parsed.positions.map((position) => {
    const symbol = position.symbol.toUpperCase();

    if (input.snapshot && symbol === input.snapshot.underlying.symbol) {
      return {
        instrumentType: "equity" as const,
        symbol,
        underlying: symbol,
        quantity: position.quantity,
        multiplier: 1,
        markPrice: input.snapshot.underlying.spot,
        currency: input.snapshot.underlying.currency,
        delta: position.quantity,
        gamma: 0,
        vega: 0,
        theta: 0,
        beta: 1,
      };
    }

    const quote = input.snapshot?.quotes.find((item) => item.symbol === symbol);
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
        currency: input.snapshot?.underlying.currency,
        delta: (quote.delta ?? 0) * position.quantity * (quote.contractMultiplier ?? 100),
        gamma: (quote.gamma ?? 0) * position.quantity * (quote.contractMultiplier ?? 100),
        vega: (quote.vega ?? 0) * position.quantity * (quote.contractMultiplier ?? 100),
        theta: (quote.theta ?? 0) * position.quantity * (quote.contractMultiplier ?? 100),
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
    asOf: input.snapshot?.generatedAt ?? DEFAULT_GENERATED_AT,
    positions,
    parsingErrors: parsed.errors,
  };
}

export function buildMockRiskMap(book: BookSnapshot): RiskMap {
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
    book.positions.find((position) => position.instrumentType === "equity")?.markPrice ?? 3;
  exposure.beta =
    exposure.grossExposure === 0 ? 0 : (exposure.delta * referenceSpot) / exposure.grossExposure;

  const symbolBuckets = Array.from(
    new Set(book.positions.map((position) => position.underlying ?? position.symbol)),
  );

  const concentrationBySymbol = symbolBuckets.map((bucket) =>
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
  ).sort((left, right) => Math.abs(right.marketValue) - Math.abs(left.marketValue));

  const expiryBuckets = Array.from(
    new Set(book.positions.map((position) => position.expiry ?? "No expiry")),
  );

  const concentrationByExpiry = expiryBuckets.map((bucket) =>
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
  ).sort((left, right) => Math.abs(right.marketValue) - Math.abs(left.marketValue));

  const topRisks: RiskItem[] = [
    {
      category: "directional",
      severity:
        Math.abs(exposure.beta) > 1
          ? RiskItemSeverity.high
          : RiskItemSeverity.medium,
      summary: "Directional beta exposure is elevated.",
      details: `Current beta proxy is ${exposure.beta.toFixed(2)}.`,
    },
    {
      category: "concentration",
      severity: RiskItemSeverity.medium,
      summary: `Largest symbol bucket is ${concentrationBySymbol[0]?.bucket ?? "None"}.`,
      details: concentrationBySymbol[0]
        ? `Bucket market value is ${concentrationBySymbol[0].marketValue.toFixed(2)}.`
        : null,
    },
  ];

  return {
    exposure,
    topRisks,
    concentrationBySymbol,
    concentrationByExpiry,
  };
}
