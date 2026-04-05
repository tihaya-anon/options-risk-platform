import type { ProviderConfig, SnapshotFile, SnapshotProvider } from "../types.js";

function nextMonthlyExpiries(baseDate = new Date()): string[] {
  const expiries: Date[] = [];
  const startMonth = baseDate.getUTCMonth();
  const startYear = baseDate.getUTCFullYear();

  for (let offset = 0; offset < 2; offset += 1) {
    const date = new Date(Date.UTC(startYear, startMonth + offset + 1, 0));
    const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const fridays: Date[] = [];

    for (let d = new Date(first); d <= date; d.setUTCDate(d.getUTCDate() + 1)) {
      if (d.getUTCDay() === 5) fridays.push(new Date(d));
    }

    expiries.push(fridays[2] ?? fridays[fridays.length - 1]);
  }

  return expiries.map((date) => date.toISOString().slice(0, 10));
}

function buildSyntheticChain(symbol: string, spot: number, generatedAt: string) {
  const expiries = nextMonthlyExpiries(new Date(generatedAt));
  const strikes = [-15, 0, 15].map((offset) =>
    Math.round((spot + offset) / 5) * 5
  );
  const quotes = [];

  for (const [expiryIndex, expiry] of expiries.entries()) {
    for (const strike of strikes) {
      const moneyness = (spot - strike) / 100;
      const timePremium = expiryIndex === 0 ? 1 : 1.35;
      const callMid =
        Math.max(spot - strike, 0) +
        (6 + 20 * Math.exp(-Math.abs(moneyness) * 6)) * timePremium;
      const putMid =
        Math.max(strike - spot, 0) +
        (5.5 + 18 * Math.exp(-Math.abs(moneyness) * 6)) * timePremium;

      for (const optionType of ["call", "put"] as const) {
        const mid = optionType === "call" ? callMid : putMid;
        const spread = mid < 3 ? 0.15 : 0.45;
        quotes.push({
          symbol: `${symbol}${expiry.replaceAll("-", "")}${optionType === "call" ? "C" : "P"}${String(strike).padStart(8, "0")}`,
          underlying: symbol,
          optionType,
          strike,
          expiry,
          bid: Number((mid - spread / 2).toFixed(2)),
          ask: Number((mid + spread / 2).toFixed(2)),
          last: Number(mid.toFixed(2)),
          volume: 1000,
          openInterest: 5000,
        });
      }
    }
  }

  return quotes;
}

export const mockProvider: SnapshotProvider = {
  name: "mock",
  async getSnapshot(config: ProviderConfig): Promise<SnapshotFile> {
    const generatedAt = new Date().toISOString();
    const spot = 524.36;

    return {
      source: "mock-provider",
      generatedAt,
      riskFreeRate: config.riskFreeRate,
      underlying: {
        symbol: config.symbol,
        spot,
        currency: "USD",
        timestamp: generatedAt,
      },
      quotes: buildSyntheticChain(config.symbol, spot, generatedAt),
    };
  },
};
