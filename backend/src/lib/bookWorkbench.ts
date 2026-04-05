import type {
  BookParseRequest,
  BookSnapshot,
  EnrichedSnapshotFile,
  ExposureSummary,
  GroupedExposure,
  Position,
  RiskItem,
  RiskMap,
} from "../types.js";

const OPTION_CONTRACT_MULTIPLIER = 100;
const DEFAULT_FUTURE_MULTIPLIER = 50;

function parseOptionContractSymbol(symbol: string) {
  const match = symbol.match(/^([A-Z]+)(\d{6})([CP])(\d{8})$/);
  if (!match) return null;

  const [, underlying, yymmdd, optionFlag, strikeDigits] = match;
  const year = Number(`20${yymmdd.slice(0, 2)}`);
  const month = yymmdd.slice(2, 4);
  const day = yymmdd.slice(4, 6);
  const strikeValue = Number(strikeDigits);
  const strike =
    strikeValue >= 10000 ? strikeValue / 1000 : strikeValue;

  return {
    underlying,
    expiry: `${year}-${month}-${day}`,
    optionType: optionFlag === "C" ? "call" : "put",
    strike,
  } as const;
}

function buildUnmatchedPosition(symbol: string, quantity: number): Position {
  if (symbol.startsWith("FUT:")) {
    const underlying = symbol.slice(4).toUpperCase();
    return {
      instrumentType: "future",
      symbol,
      underlying,
      quantity,
      multiplier: DEFAULT_FUTURE_MULTIPLIER,
      markPrice: 0,
      beta: 1,
      delta: quantity * DEFAULT_FUTURE_MULTIPLIER,
      gamma: 0,
      vega: 0,
      theta: 0,
    };
  }

  const parsedOption = parseOptionContractSymbol(symbol);
  if (parsedOption) {
    return {
      instrumentType: "option",
      symbol,
      underlying: parsedOption.underlying,
      quantity,
      multiplier: OPTION_CONTRACT_MULTIPLIER,
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
    instrumentType: "equity",
    symbol,
    underlying: symbol,
    quantity,
    multiplier: 1,
    markPrice: 0,
    delta: quantity,
    gamma: 0,
    vega: 0,
    theta: 0,
    beta: 1,
  };
}

function buildPositionFromSnapshot(
  symbol: string,
  quantity: number,
  snapshot: EnrichedSnapshotFile,
): Position {
  if (symbol === snapshot.underlying.symbol) {
    return {
      instrumentType: "equity",
      symbol,
      underlying: symbol,
      quantity,
      multiplier: 1,
      markPrice: snapshot.underlying.spot,
      currency: snapshot.underlying.currency,
      delta: quantity,
      gamma: 0,
      vega: 0,
      theta: 0,
      beta: 1,
    };
  }

  const quote = snapshot.quotes.find((item) => item.symbol === symbol);
  if (quote) {
    return {
      instrumentType: "option",
      symbol,
      underlying: quote.underlying,
      quantity,
      multiplier: OPTION_CONTRACT_MULTIPLIER,
      markPrice: quote.mid,
      expiry: quote.expiry,
      strike: quote.strike,
      optionType: quote.optionType,
      currency: snapshot.underlying.currency,
      delta: (quote.delta ?? 0) * quantity * OPTION_CONTRACT_MULTIPLIER,
      gamma: (quote.gamma ?? 0) * quantity * OPTION_CONTRACT_MULTIPLIER,
      vega: (quote.vega ?? 0) * quantity * OPTION_CONTRACT_MULTIPLIER,
      theta: (quote.theta ?? 0) * quantity * OPTION_CONTRACT_MULTIPLIER,
      beta:
        ((quote.delta ?? 0) * snapshot.underlying.spot * OPTION_CONTRACT_MULTIPLIER) /
        Math.max(Math.abs(quote.mid * OPTION_CONTRACT_MULTIPLIER), 1),
    };
  }

  return buildUnmatchedPosition(symbol, quantity);
}

export function parseBook(request: BookParseRequest): BookSnapshot {
  const lines = request.positionsInput
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const positions: Position[] = [];
  const parsingErrors: string[] = [];

  for (const [index, line] of lines.entries()) {
    const [symbolPart, quantityPart] = line.split(",").map((part) => part.trim());
    if (!symbolPart || !quantityPart) {
      parsingErrors.push(`Line ${index + 1}: expected symbol,quantity`);
      continue;
    }

    const quantity = Number(quantityPart);
    if (!Number.isFinite(quantity)) {
      parsingErrors.push(`Line ${index + 1}: invalid quantity "${quantityPart}"`);
      continue;
    }

    const symbol = symbolPart.toUpperCase();
    const position = request.snapshot
      ? buildPositionFromSnapshot(symbol, quantity, request.snapshot)
      : buildUnmatchedPosition(symbol, quantity);

    if (!request.snapshot && position.markPrice === 0) {
      position.underlying = position.underlying ?? request.defaultSymbol ?? symbol;
    }

    positions.push(position);
  }

  return {
    asOf: request.snapshot?.generatedAt ?? new Date().toISOString(),
    positions,
    parsingErrors,
  };
}

export function summarizeBookExposure(book: BookSnapshot): ExposureSummary {
  const marketValue = book.positions.reduce(
    (sum, position) => sum + position.quantity * position.multiplier * position.markPrice,
    0,
  );
  const grossExposure = book.positions.reduce(
    (sum, position) =>
      sum + Math.abs(position.quantity * position.multiplier * position.markPrice),
    0,
  );
  const netExposure = marketValue;
  const delta = book.positions.reduce((sum, position) => sum + (position.delta ?? 0), 0);
  const gamma = book.positions.reduce((sum, position) => sum + (position.gamma ?? 0), 0);
  const vega = book.positions.reduce((sum, position) => sum + (position.vega ?? 0), 0);
  const theta = book.positions.reduce((sum, position) => sum + (position.theta ?? 0), 0);

  const deltaNotional = book.positions.reduce((sum, position) => {
    const sensitivity = position.delta ?? 0;
    const referencePrice = Math.max(position.markPrice, 1);
    return sum + sensitivity * referencePrice;
  }, 0);

  return {
    marketValue,
    grossExposure,
    netExposure,
    delta,
    gamma,
    vega,
    theta,
    beta: grossExposure === 0 ? 0 : deltaNotional / grossExposure,
  };
}

function groupBookPositions(
  book: BookSnapshot,
  groupBy: "symbol" | "expiry",
): GroupedExposure[] {
  const buckets = new Map<string, GroupedExposure>();

  for (const position of book.positions) {
    const bucket =
      groupBy === "expiry"
        ? position.expiry ?? "No expiry"
        : position.underlying ?? position.symbol;

    const current = buckets.get(bucket) ?? {
      bucket,
      quantity: 0,
      marketValue: 0,
      netDelta: 0,
      netGamma: 0,
      netVega: 0,
      netTheta: 0,
    };

    current.quantity += position.quantity;
    current.marketValue += position.quantity * position.multiplier * position.markPrice;
    current.netDelta += position.delta ?? 0;
    current.netGamma += position.gamma ?? 0;
    current.netVega += position.vega ?? 0;
    current.netTheta += position.theta ?? 0;
    buckets.set(bucket, current);
  }

  return [...buckets.values()].sort(
    (left, right) => Math.abs(right.marketValue) - Math.abs(left.marketValue),
  );
}

function buildTopRisks(
  exposure: ExposureSummary,
  concentrationBySymbol: GroupedExposure[],
  concentrationByExpiry: GroupedExposure[],
): RiskItem[] {
  const items: RiskItem[] = [];

  if (Math.abs(exposure.beta) > 0.6) {
    items.push({
      category: "directional",
      severity: Math.abs(exposure.beta) > 1 ? "high" : "medium",
      summary: "Directional beta exposure is elevated.",
      details: `Current beta proxy is ${exposure.beta.toFixed(2)}.`,
    });
  }

  if (Math.abs(exposure.vega) > 500) {
    items.push({
      category: "volatility",
      severity: Math.abs(exposure.vega) > 1000 ? "high" : "medium",
      summary: "Net vega exposure is material.",
      details: `Aggregate vega is ${exposure.vega.toFixed(2)}.`,
    });
  }

  const topSymbol = concentrationBySymbol[0];
  if (topSymbol) {
    items.push({
      category: "concentration",
      severity: "medium",
      summary: `Largest symbol bucket is ${topSymbol.bucket}.`,
      details: `Bucket market value is ${topSymbol.marketValue.toFixed(2)}.`,
    });
  }

  const topExpiry = concentrationByExpiry[0];
  if (topExpiry && topExpiry.bucket !== "No expiry") {
    items.push({
      category: "expiry",
      severity: "low",
      summary: `Largest expiry bucket is ${topExpiry.bucket}.`,
      details: `Bucket vega is ${topExpiry.netVega.toFixed(2)}.`,
    });
  }

  if (items.length === 0) {
    items.push({
      category: "baseline",
      severity: "low",
      summary: "No large headline risk flags were detected in the current book.",
      details: null,
    });
  }

  return items;
}

export function buildRiskMap(book: BookSnapshot): RiskMap {
  const exposure = summarizeBookExposure(book);
  const concentrationBySymbol = groupBookPositions(book, "symbol");
  const concentrationByExpiry = groupBookPositions(book, "expiry");

  return {
    exposure,
    topRisks: buildTopRisks(exposure, concentrationBySymbol, concentrationByExpiry),
    concentrationBySymbol,
    concentrationByExpiry,
  };
}
