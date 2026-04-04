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
