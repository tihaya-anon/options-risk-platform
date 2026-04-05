import { impliedVolatility, optionGreeks } from "./blackScholes.mjs";

function timeToExpiryYears(expiry, generatedAt) {
  const expiryDate = new Date(`${expiry}T20:00:00Z`);
  const now = new Date(generatedAt);
  const milliseconds = expiryDate.getTime() - now.getTime();
  return Math.max(milliseconds / (365 * 24 * 60 * 60 * 1000), 1 / 365);
}

export function enrichSnapshot(snapshot) {
  return {
    ...snapshot,
    quotes: snapshot.quotes.map((quote) => {
      const mid = (quote.bid + quote.ask) / 2;
      const t = timeToExpiryYears(quote.expiry, snapshot.generatedAt);
      const volatility = impliedVolatility(
        mid,
        snapshot.underlying.spot,
        quote.strike,
        snapshot.riskFreeRate,
        t,
        quote.optionType
      );
      const greeks =
        volatility === null
          ? { price: mid, delta: null, gamma: null, vega: null, theta: null }
          : optionGreeks(
              snapshot.underlying.spot,
              quote.strike,
              snapshot.riskFreeRate,
              t,
              volatility,
              quote.optionType
            );

      return {
        ...quote,
        mid,
        timeToExpiryYears: t,
        impliedVol: volatility,
        delta: greeks.delta,
        gamma: greeks.gamma,
        vega: greeks.vega,
        theta: greeks.theta,
      };
    }),
  };
}
