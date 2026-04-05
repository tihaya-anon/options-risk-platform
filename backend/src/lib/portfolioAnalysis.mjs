import { optionPrice } from "./blackScholes.mjs";

const OPTION_CONTRACT_MULTIPLIER = 100;

export function parsePositionsInput(input) {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const positions = [];
  const errors = [];

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

export function aggregatePortfolioExposure(snapshot, positions) {
  const quoteMap = new Map(snapshot.quotes.map((quote) => [quote.symbol, quote]));
  const unmatchedSymbols = [];
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

    const scale = position.quantity * OPTION_CONTRACT_MULTIPLIER;
    netDelta += (quote.delta ?? 0) * scale;
    netGamma += (quote.gamma ?? 0) * scale;
    netVega += (quote.vega ?? 0) * scale;
    netTheta += (quote.theta ?? 0) * scale;
    marketValue += quote.mid * scale;
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

export function calculateSpotScenario(snapshot, positions) {
  const quoteMap = new Map(snapshot.quotes.map((quote) => [quote.symbol, quote]));
  const baselineValue = aggregatePortfolioExposure(snapshot, positions).marketValue;
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
      if (!quote || quote.impliedVol === null) continue;
      const price = optionPrice(
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

export function calculateVolScenario(snapshot, positions) {
  const quoteMap = new Map(snapshot.quotes.map((quote) => [quote.symbol, quote]));
  const baselineValue = aggregatePortfolioExposure(snapshot, positions).marketValue;
  const volShifts = [-0.1, -0.05, -0.02, 0, 0.02, 0.05, 0.1];

  return volShifts.map((volShift) => {
    let portfolioValue = 0;
    for (const position of positions) {
      if (position.symbol === snapshot.underlying.symbol) {
        portfolioValue += position.quantity * snapshot.underlying.spot;
        continue;
      }
      const quote = quoteMap.get(position.symbol);
      if (!quote || quote.impliedVol === null) continue;
      const shockedVol = Math.max(quote.impliedVol + volShift, 0.0001);
      const price = optionPrice(
        snapshot.underlying.spot,
        quote.strike,
        snapshot.riskFreeRate,
        quote.timeToExpiryYears,
        shockedVol,
        quote.optionType
      );
      portfolioValue += position.quantity * OPTION_CONTRACT_MULTIPLIER * price;
    }
    return {
      volShift,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

export function calculateTimeScenario(snapshot, positions) {
  const quoteMap = new Map(snapshot.quotes.map((quote) => [quote.symbol, quote]));
  const baselineValue = aggregatePortfolioExposure(snapshot, positions).marketValue;
  const dayShifts = [0, 3, 7, 14, 21, 30];

  return dayShifts.map((daysForward) => {
    let portfolioValue = 0;
    for (const position of positions) {
      if (position.symbol === snapshot.underlying.symbol) {
        portfolioValue += position.quantity * snapshot.underlying.spot;
        continue;
      }
      const quote = quoteMap.get(position.symbol);
      if (!quote || quote.impliedVol === null) continue;
      const shockedTime = Math.max(quote.timeToExpiryYears - daysForward / 365, 1 / 3650);
      const price = optionPrice(
        snapshot.underlying.spot,
        quote.strike,
        snapshot.riskFreeRate,
        shockedTime,
        quote.impliedVol,
        quote.optionType
      );
      portfolioValue += position.quantity * OPTION_CONTRACT_MULTIPLIER * price;
    }
    return {
      daysForward,
      portfolioValue,
      portfolioPnl: portfolioValue - baselineValue,
    };
  });
}

function buildBucket(snapshot, quote, position, groupByMode) {
  if (position.symbol === snapshot.underlying.symbol) {
    return groupByMode === "symbol"
      ? snapshot.underlying.symbol
      : `${snapshot.underlying.symbol} | underlying`;
  }
  if (!quote) return `${position.symbol} | unmatched`;

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

export function calculateGroupedExposures(snapshot, positions, groupByMode) {
  const quoteMap = new Map(snapshot.quotes.map((quote) => [quote.symbol, quote]));
  const buckets = new Map();

  for (const position of positions) {
    const quote = quoteMap.get(position.symbol);
    const bucket = buildBucket(snapshot, quote, position, groupByMode);
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

    if (position.symbol === snapshot.underlying.symbol) {
      current.marketValue += position.quantity * snapshot.underlying.spot;
      current.netDelta += position.quantity;
      buckets.set(bucket, current);
      continue;
    }

    if (!quote) {
      buckets.set(bucket, current);
      continue;
    }

    const scale = position.quantity * OPTION_CONTRACT_MULTIPLIER;
    current.marketValue += quote.mid * scale;
    current.netDelta += (quote.delta ?? 0) * scale;
    current.netGamma += (quote.gamma ?? 0) * scale;
    current.netVega += (quote.vega ?? 0) * scale;
    current.netTheta += (quote.theta ?? 0) * scale;
    buckets.set(bucket, current);
  }

  return [...buckets.values()].sort(
    (left, right) => Math.abs(right.netVega) - Math.abs(left.netVega)
  );
}

export function buildRuleBasedAdvice(exposure, groupedExposures) {
  const suggestions = [];
  if (Math.abs(exposure.netDelta) > 150) {
    suggestions.push({
      risk: "Directional delta concentration",
      action:
        exposure.netDelta > 0
          ? "Consider reducing net long delta with short futures, short calls, or put hedges."
          : "Consider reducing net short delta with long futures or call structures.",
      source: "rules",
    });
  }
  if (Math.abs(exposure.netVega) > 800) {
    suggestions.push({
      risk: "Large net vega exposure",
      action:
        exposure.netVega > 0
          ? "Review long-vol concentration and scenario sensitivity to vol crush."
          : "Review short-vol tail risk and consider convex hedges.",
      source: "rules",
    });
  }
  const topBucket = groupedExposures[0];
  if (topBucket) {
    suggestions.push({
      risk: "Largest grouped bucket",
      action: `Inspect bucket ${topBucket.bucket} first; it currently dominates grouped exposure.`,
      source: "rules",
    });
  }

  return suggestions;
}

export function analyzePortfolio(payload) {
  const parsed = parsePositionsInput(payload.positionsInput ?? "");
  const exposure = aggregatePortfolioExposure(payload.snapshot, parsed.positions);
  const groupedExposures = calculateGroupedExposures(
    payload.snapshot,
    parsed.positions,
    payload.groupByMode ?? "full"
  );

  return {
    parsedPositions: parsed,
    exposure,
    spotScenarios: calculateSpotScenario(payload.snapshot, parsed.positions),
    volScenarios: calculateVolScenario(payload.snapshot, parsed.positions),
    timeScenarios: calculateTimeScenario(payload.snapshot, parsed.positions),
    groupedExposures,
    advisor: {
      source: "rules",
      suggestions: buildRuleBasedAdvice(exposure, groupedExposures),
    },
  };
}
