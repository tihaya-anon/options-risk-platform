import { blackScholesModel } from "../lib/bs";
import type { EnrichedOptionQuote, OptionSnapshotFile } from "../types";

const OPTION_CONTRACT_MULTIPLIER = 100;

export interface ImportedPosition {
  symbol: string;
  quantity: number;
}

export interface ParsedPositions {
  positions: ImportedPosition[];
  errors: string[];
}

export interface PortfolioExposure {
  netDelta: number;
  netGamma: number;
  netVega: number;
  netTheta: number;
  marketValue: number;
  unmatchedSymbols: string[];
}

export interface ScenarioPoint {
  spot: number;
  spotChangePct: number;
  portfolioValue: number;
  portfolioPnl: number;
}

export interface VolScenarioPoint {
  volShift: number;
  portfolioValue: number;
  portfolioPnl: number;
}

export interface GroupedExposure {
  bucket: string;
  quantity: number;
  marketValue: number;
  netDelta: number;
  netGamma: number;
  netVega: number;
  netTheta: number;
}

export type GroupByMode =
  | "symbol"
  | "expiry"
  | "optionType"
  | "symbolExpiry"
  | "full";

export function parsePositionsInput(input: string): ParsedPositions {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const positions: ImportedPosition[] = [];
  const errors: string[] = [];

  for (const [index, line] of lines.entries()) {
    const [symbolPart, quantityPart] = line.split(",").map((part) => part.trim());
    if (!symbolPart || !quantityPart) {
      errors.push(`Line ${index + 1}: expected symbol,quantity`);
      continue;
    }
    const quantity = Number(quantityPart);
    if (!Number.isFinite(quantity)) {
      errors.push(`Line ${index + 1}: invalid quantity "${quantityPart}"`);
      continue;
    }
    positions.push({ symbol: symbolPart, quantity });
  }

  return { positions, errors };
}

export function aggregatePortfolioExposure(
  snapshot: OptionSnapshotFile,
  quotes: EnrichedOptionQuote[],
  positions: ImportedPosition[]
): PortfolioExposure {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const unmatchedSymbols: string[] = [];

  let netDelta = 0;
  let netGamma = 0;
  let netVega = 0;
  let netTheta = 0;
  let marketValue = 0;

  for (const position of positions) {
    if (position.symbol === snapshot.underlying.symbol) {
      netDelta += position.quantity;
      marketValue += position.quantity * snapshot.underlying.spot;
      continue;
    }

    const quote = quoteMap.get(position.symbol);
    if (!quote) {
      unmatchedSymbols.push(position.symbol);
      continue;
    }

    const contractScale = position.quantity * OPTION_CONTRACT_MULTIPLIER;
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

export function calculatePortfolioScenario(
  snapshot: OptionSnapshotFile,
  quotes: EnrichedOptionQuote[],
  positions: ImportedPosition[]
): ScenarioPoint[] {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const baselineExposure = aggregatePortfolioExposure(snapshot, quotes, positions);
  const baselineValue = baselineExposure.marketValue;
  const spotShocks = [-0.2, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15, 0.2];

  return spotShocks.map((shock) => {
    const shockedSpot = snapshot.underlying.spot * (1 + shock);
    let portfolioValue = 0;

    for (const position of positions) {
      if (position.symbol === snapshot.underlying.symbol) {
        portfolioValue += position.quantity * shockedSpot;
        continue;
      }

      const quote = quoteMap.get(position.symbol);
      if (!quote || quote.impliedVol === null) {
        continue;
      }

      const price = blackScholesModel.price(
        shockedSpot,
        quote.strike,
        snapshot.riskFreeRate,
        quote.timeToExpiryYears,
        quote.impliedVol,
        quote.optionType
      );
      portfolioValue += position.quantity * OPTION_CONTRACT_MULTIPLIER * price;
    }

    return {
      spot: shockedSpot,
      spotChangePct: shock,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

export function calculatePortfolioVolScenario(
  snapshot: OptionSnapshotFile,
  quotes: EnrichedOptionQuote[],
  positions: ImportedPosition[]
): VolScenarioPoint[] {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const baselineExposure = aggregatePortfolioExposure(snapshot, quotes, positions);
  const baselineValue = baselineExposure.marketValue;
  const volShifts = [-0.1, -0.05, -0.02, 0, 0.02, 0.05, 0.1];

  return volShifts.map((volShift) => {
    let portfolioValue = 0;

    for (const position of positions) {
      if (position.symbol === snapshot.underlying.symbol) {
        portfolioValue += position.quantity * snapshot.underlying.spot;
        continue;
      }

      const quote = quoteMap.get(position.symbol);
      if (!quote || quote.impliedVol === null) {
        continue;
      }

      const shockedVol = Math.max(quote.impliedVol + volShift, 0.0001);
      const shockedPrice = blackScholesModel.price(
        snapshot.underlying.spot,
        quote.strike,
        snapshot.riskFreeRate,
        quote.timeToExpiryYears,
        shockedVol,
        quote.optionType
      );

      portfolioValue += position.quantity * OPTION_CONTRACT_MULTIPLIER * shockedPrice;
    }

    return {
      volShift,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

function buildBucketName(
  snapshot: OptionSnapshotFile,
  quote: EnrichedOptionQuote | undefined,
  position: ImportedPosition,
  groupByMode: GroupByMode
): string {
  if (position.symbol === snapshot.underlying.symbol) {
    return groupByMode === "symbol"
      ? snapshot.underlying.symbol
      : `${snapshot.underlying.symbol} | underlying`;
  }
  if (!quote) {
    return `${position.symbol} | unmatched`;
  }

  switch (groupByMode) {
    case "symbol":
      return quote.underlying;
    case "expiry":
      return quote.expiry;
    case "optionType":
      return quote.optionType;
    case "symbolExpiry":
      return `${quote.underlying} | ${quote.expiry}`;
    case "full":
    default:
      return `${quote.underlying} | ${quote.expiry} | ${quote.optionType}`;
  }
}

export function calculateGroupedExposures(
  snapshot: OptionSnapshotFile,
  quotes: EnrichedOptionQuote[],
  positions: ImportedPosition[],
  groupByMode: GroupByMode
): GroupedExposure[] {
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol, quote]));
  const bucketMap = new Map<string, GroupedExposure>();

  for (const position of positions) {
    const quote = quoteMap.get(position.symbol);
    const bucket = buildBucketName(snapshot, quote, position, groupByMode);
    const existing =
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

    existing.quantity += position.quantity;

    if (position.symbol === snapshot.underlying.symbol) {
      existing.marketValue += position.quantity * snapshot.underlying.spot;
      existing.netDelta += position.quantity;
      bucketMap.set(bucket, existing);
      continue;
    }

    if (!quote) {
      bucketMap.set(bucket, existing);
      continue;
    }

    const contractScale = position.quantity * OPTION_CONTRACT_MULTIPLIER;
    existing.marketValue += quote.mid * contractScale;
    existing.netDelta += (quote.delta ?? 0) * contractScale;
    existing.netGamma += (quote.gamma ?? 0) * contractScale;
    existing.netVega += (quote.vega ?? 0) * contractScale;
    existing.netTheta += (quote.theta ?? 0) * contractScale;

    bucketMap.set(bucket, existing);
  }

  return [...bucketMap.values()].sort(
    (left, right) => Math.abs(right.netVega) - Math.abs(left.netVega)
  );
}
