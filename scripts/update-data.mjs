import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outputPath = path.resolve(process.cwd(), "public/data/latest.json");

function nextMonthlyExpiries(baseDate = new Date()) {
  const expiries = [];
  const startMonth = baseDate.getUTCMonth();
  const startYear = baseDate.getUTCFullYear();

  for (let offset = 0; offset < 2; offset += 1) {
    const date = new Date(Date.UTC(startYear, startMonth + offset + 1, 0));
    const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    let fridays = [];
    for (let d = new Date(first); d <= date; d.setUTCDate(d.getUTCDate() + 1)) {
      if (d.getUTCDay() === 5) {
        fridays.push(new Date(d));
      }
    }
    expiries.push(fridays[2] ?? fridays[fridays.length - 1]);
  }
  return expiries.map((d) => d.toISOString().slice(0, 10));
}

function makeSyntheticChain(spot, generatedAt) {
  const expiries = nextMonthlyExpiries(new Date(generatedAt));
  const strikes = [-15, 0, 15].map((offset) => Math.round((spot + offset) / 5) * 5);
  const quotes = [];

  for (const [expiryIndex, expiry] of expiries.entries()) {
    for (const strike of strikes) {
      const moneyness = (spot - strike) / 100;
      const timePremium = expiryIndex === 0 ? 1 : 1.35;

      const callMid = Math.max(spot - strike, 0) + (6 + 20 * Math.exp(-Math.abs(moneyness) * 6)) * timePremium;
      const putMid = Math.max(strike - spot, 0) + (5.5 + 18 * Math.exp(-Math.abs(moneyness) * 6)) * timePremium;

      for (const optionType of ["call", "put"]) {
        const mid = optionType === "call" ? callMid : putMid;
        const spread = mid < 3 ? 0.15 : 0.45;
        quotes.push({
          symbol: `SPY${expiry.replaceAll("-", "")}${optionType === "call" ? "C" : "P"}${String(strike).padStart(8, "0")}`,
          underlying: "SPY",
          optionType,
          strike,
          expiry,
          bid: Number((mid - spread / 2).toFixed(2)),
          ask: Number((mid + spread / 2).toFixed(2)),
          last: Number(mid.toFixed(2)),
          volume: Math.round(800 + Math.random() * 1800),
          openInterest: Math.round(2500 + Math.random() * 14000)
        });
      }
    }
  }
  return quotes;
}

async function fetchYahooSpot(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`;
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  if (!response.ok) {
    throw new Error(`Yahoo spot fetch failed with ${response.status}`);
  }
  const data = await response.json();
  const close = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (typeof close !== "number") {
    throw new Error("Yahoo spot fetch missing regularMarketPrice");
  }
  return close;
}

async function main() {
  const generatedAt = new Date().toISOString();
  const symbol = process.env.UNDERLYING_SYMBOL ?? "SPY";
  let spot = 524.36;
  let source = "synthetic-fallback";

  try {
    spot = await fetchYahooSpot(symbol);
    source = "yahoo-chart-spot+synthetic-chain";
  } catch (error) {
    console.warn(`Falling back to seeded spot because live fetch failed: ${error.message}`);
  }

  const snapshot = {
    source,
    generatedAt,
    riskFreeRate: Number(process.env.RISK_FREE_RATE ?? 0.045),
    underlying: {
      symbol,
      spot: Number(spot.toFixed(2)),
      currency: "USD",
      timestamp: generatedAt
    },
    quotes: makeSyntheticChain(spot, generatedAt)
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
  console.log(`Wrote snapshot to ${outputPath}`);
}

await main();
