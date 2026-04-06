import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(
  repoRoot,
  "frontend",
  "public",
  "data",
  "latest",
);
const fallbackSnapshotPath = path.join(
  repoRoot,
  "frontend",
  "public",
  "data",
  "latest.json",
);

const DEFAULT_RISK_FREE_RATE = 0.045;
const DEFAULT_UNIVERSE = ["SPY", "QQQ", "IWM", "AAPL"];
const UNIVERSE_CONFIG = {
  SPY: {
    spot: 524.36,
    expiries: ["2026-04-17", "2026-05-15", "2026-06-19"],
    strikes: [500, 525, 540, 560, 580],
    skewShift: 0.025,
  },
  QQQ: {
    spot: 471.3,
    expiries: ["2026-04-17", "2026-05-15", "2026-06-19"],
    strikes: [430, 450, 470, 490, 510],
    skewShift: 0.022,
  },
  IWM: {
    spot: 212.48,
    expiries: ["2026-04-17", "2026-05-15", "2026-06-19"],
    strikes: [190, 200, 210, 220, 230],
    skewShift: 0.028,
  },
  AAPL: {
    spot: 198.74,
    expiries: ["2026-04-17", "2026-05-15", "2026-06-19"],
    strikes: [180, 190, 200, 210, 220],
    skewShift: 0.02,
  },
};

function getArgumentValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function resolveAsOfTimestamp() {
  const explicitDate = getArgumentValue("--as-of");
  if (explicitDate) {
    return `${explicitDate}T21:00:00.000Z`;
  }

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setUTCDate(now.getUTCDate() - 1);
  return `${formatIsoDate(yesterday)}T21:00:00.000Z`;
}

function resolveUniverse() {
  const explicitUniverse = getArgumentValue("--symbols");
  const csv = explicitUniverse ?? process.env.STATIC_UNIVERSE ?? DEFAULT_UNIVERSE.join(",");
  return csv
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean)
    .filter((symbol, index, all) => all.indexOf(symbol) === index);
}

function normalCdf(value) {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value) / Math.sqrt(2);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1 / (1 + p * abs);
  const erf =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-abs * abs);

  return 0.5 * (1 + sign * erf);
}

function blackScholesPrice(spot, strike, riskFreeRate, timeToExpiryYears, volatility, optionType) {
  if (timeToExpiryYears <= 0 || volatility <= 0) {
    return optionType === "call"
      ? Math.max(spot - strike, 0)
      : Math.max(strike - spot, 0);
  }

  const sqrtT = Math.sqrt(timeToExpiryYears);
  const d1 =
    (Math.log(spot / strike) + (riskFreeRate + 0.5 * volatility * volatility) * timeToExpiryYears) /
    (volatility * sqrtT);
  const d2 = d1 - volatility * sqrtT;

  if (optionType === "call") {
    return spot * normalCdf(d1) - strike * Math.exp(-riskFreeRate * timeToExpiryYears) * normalCdf(d2);
  }

  return strike * Math.exp(-riskFreeRate * timeToExpiryYears) * normalCdf(-d2) - spot * normalCdf(-d1);
}

function formatOptionSymbol(underlying, expiry, optionType, strike) {
  const compactExpiry = expiry.slice(2).replace(/-/g, "");
  const right = optionType === "call" ? "C" : "P";
  const encodedStrike = Math.round(strike * 1000).toString().padStart(8, "0");
  return `${underlying}${compactExpiry}${right}${encodedStrike}`;
}

function buildQuote({ underlying, spot, expiry, strike, optionType, volatility, generatedAt }) {
  const now = new Date(generatedAt);
  const expiryDate = new Date(`${expiry}T20:00:00.000Z`);
  const timeToExpiryYears = Math.max(
    (expiryDate.getTime() - now.getTime()) / (365 * 24 * 60 * 60 * 1000),
    1 / 365,
  );
  const mid = blackScholesPrice(
    spot,
    strike,
    DEFAULT_RISK_FREE_RATE,
    timeToExpiryYears,
    volatility,
    optionType,
  );
  const spread = Math.max(mid * 0.03, 0.05);
  const moneyness = Math.abs(strike - spot) / spot;

  return {
    symbol: formatOptionSymbol(underlying, expiry, optionType, strike),
    underlying,
    optionType,
    strike,
    expiry,
    bid: Number(Math.max(mid - spread / 2, 0.01).toFixed(2)),
    ask: Number(Math.max(mid + spread / 2, 0.02).toFixed(2)),
    last: Number(mid.toFixed(2)),
    volume: Math.round(250 + moneyness * 1600),
    openInterest: Math.round(1000 + moneyness * 4200 + (optionType === "put" ? 450 : 0)),
  };
}

function buildSnapshot(symbol, generatedAt) {
  const config = UNIVERSE_CONFIG[symbol];
  if (!config) {
    throw new Error(`Unsupported static symbol: ${symbol}`);
  }

  const quotes = [];
  for (const expiry of config.expiries) {
    for (const strike of config.strikes) {
      const moneyness = Math.abs(strike - config.spot) / config.spot;
      const baseVol = 0.18 + moneyness * 0.32;
      quotes.push(
        buildQuote({
          underlying: symbol,
          spot: config.spot,
          expiry,
          strike,
          optionType: "call",
          volatility: baseVol,
          generatedAt,
        }),
      );
      quotes.push(
        buildQuote({
          underlying: symbol,
          spot: config.spot,
          expiry,
          strike,
          optionType: "put",
          volatility: baseVol + config.skewShift,
          generatedAt,
        }),
      );
    }
  }

  return {
    source: "static-daily-demo",
    generatedAt,
    riskFreeRate: DEFAULT_RISK_FREE_RATE,
    underlying: {
      symbol,
      spot: config.spot,
      currency: "USD",
      timestamp: generatedAt,
    },
    quotes,
  };
}

async function main() {
  const generatedAt = resolveAsOfTimestamp();
  const universe = resolveUniverse();

  await mkdir(outputDir, { recursive: true });

  const manifest = {
    asOf: generatedAt,
    defaultSymbol: universe[0] ?? DEFAULT_UNIVERSE[0],
    symbols: [],
  };

  for (const symbol of universe) {
    const snapshot = buildSnapshot(symbol, generatedAt);
    const filename = `${symbol}.json`;
    const relativePath = `/data/latest/${filename}`;
    await writeFile(
      path.join(outputDir, filename),
      `${JSON.stringify(snapshot, null, 2)}\n`,
      "utf8",
    );
    manifest.symbols.push({
      symbol,
      path: relativePath,
      generatedAt,
    });

    if (symbol === manifest.defaultSymbol) {
      await writeFile(
        fallbackSnapshotPath,
        `${JSON.stringify(snapshot, null, 2)}\n`,
        "utf8",
      );
    }
  }

  await writeFile(
    path.join(outputDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error("[static] failed to generate snapshots");
  console.error(error);
  process.exitCode = 1;
});
