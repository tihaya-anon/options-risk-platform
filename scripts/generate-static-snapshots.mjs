import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "frontend", "public", "data", "latest");
const fallbackSnapshotPath = path.join(repoRoot, "frontend", "public", "data", "latest.json");
const YAHOO_OPTIONS_BASE = "https://query2.finance.yahoo.com/v7/finance/options/";
const DEFAULT_RISK_FREE_RATE = 0.045;
const DEFAULT_UNIVERSE = ["SPY", "QQQ", "IWM", "AAPL"];
const DEFAULT_MAX_EXPIRATIONS = 3;
const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  accept: "application/json,text/plain,*/*",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getArgumentValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
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

function resolveMaxExpirations() {
  const raw =
    getArgumentValue("--max-expirations") ??
    process.env.STATIC_MAX_EXPIRATIONS ??
    String(DEFAULT_MAX_EXPIRATIONS);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_MAX_EXPIRATIONS;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });
  if (!response.ok) {
    throw new Error(`Request failed ${response.status} for ${url}`);
  }
  return response.json();
}

function toIsoTimestamp(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString();
}

function formatExpiry(unixSeconds) {
  return new Date(unixSeconds * 1000).toISOString().slice(0, 10);
}

async function createYahooSession(maxAttempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch("https://fc.yahoo.com", { headers: REQUEST_HEADERS });
      const setCookie = response.headers.get("set-cookie");
      const cookie = setCookie?.split(";")[0];

      if (!cookie) {
        throw new Error("Unable to obtain Yahoo session cookie.");
      }

      const crumbResponse = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
        headers: {
          ...REQUEST_HEADERS,
          cookie,
        },
      });

      if (!crumbResponse.ok) {
        throw new Error(`Failed to retrieve Yahoo crumb: ${crumbResponse.status}`);
      }

      const crumb = (await crumbResponse.text()).trim();
      if (!crumb) {
        throw new Error("Yahoo crumb response was empty.");
      }

      return { cookie, crumb };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(500 * attempt);
      }
    }
  }

  throw lastError ?? new Error("Unable to create Yahoo session.");
}

async function fetchOptionIndex(symbol, session) {
  const url = `${YAHOO_OPTIONS_BASE}${encodeURIComponent(symbol)}?crumb=${encodeURIComponent(session.crumb)}`;
  const payload = await fetch(url, {
    headers: {
      ...REQUEST_HEADERS,
      cookie: session.cookie,
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed ${response.status} for ${url}`);
    }
    return response.json();
  });
  const result = payload?.optionChain?.result?.[0];

  if (!result) {
    throw new Error(`Missing options index for ${symbol}`);
  }

  return {
    quote: result.quote ?? null,
    expirationDates: result.expirationDates ?? [],
  };
}

function normalizeOptionQuote(rawQuote, optionType) {
  const expiry = formatExpiry(rawQuote.expiration);
  return {
    symbol: rawQuote.contractSymbol,
    underlying: rawQuote.symbol ?? rawQuote.contractSymbol.replace(/\d.*/, ""),
    optionType,
    strike: Number(rawQuote.strike),
    expiry,
    bid: Number(rawQuote.bid ?? rawQuote.lastPrice ?? 0),
    ask: Number(rawQuote.ask ?? rawQuote.lastPrice ?? 0),
    last: Number(rawQuote.lastPrice ?? 0),
    volume: Number(rawQuote.volume ?? 0),
    openInterest: Number(rawQuote.openInterest ?? 0),
  };
}

async function fetchOptionChainForExpiry(symbol, expiryTimestamp, session) {
  const url = `${YAHOO_OPTIONS_BASE}${encodeURIComponent(symbol)}?date=${expiryTimestamp}&crumb=${encodeURIComponent(session.crumb)}`;
  const payload = await fetch(url, {
    headers: {
      ...REQUEST_HEADERS,
      cookie: session.cookie,
    },
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Request failed ${response.status} for ${url}`);
    }
    return response.json();
  });
  const result = payload?.optionChain?.result?.[0];
  const options = result?.options?.[0];

  if (!options) {
    return [];
  }

  const calls = (options.calls ?? []).map((quote) => normalizeOptionQuote(quote, "call"));
  const puts = (options.puts ?? []).map((quote) => normalizeOptionQuote(quote, "put"));
  return [...calls, ...puts];
}

async function buildSnapshotFromYahoo(symbol, maxExpirations, session) {
  const optionIndex = await fetchOptionIndex(symbol, session);
  const expirationDates = optionIndex.expirationDates.slice(0, maxExpirations);
  const chainBatches = await Promise.all(
    expirationDates.map((expiryTimestamp) =>
      fetchOptionChainForExpiry(symbol, expiryTimestamp, session),
    ),
  );
  const quotes = chainBatches.flat().filter((quote) => Number.isFinite(quote.strike));
  const regularMarketPrice = Number(optionIndex.quote?.regularMarketPrice ?? NaN);
  const regularMarketTime = optionIndex.quote?.regularMarketTime;

  if (!quotes.length || !Number.isFinite(regularMarketPrice)) {
    throw new Error(`No option quotes returned for ${symbol}`);
  }

  return {
    source: "yahoo-finance-public",
    generatedAt: toIsoTimestamp(regularMarketTime ?? Math.floor(Date.now() / 1000)),
    riskFreeRate: DEFAULT_RISK_FREE_RATE,
    underlying: {
      symbol,
      spot: regularMarketPrice,
      currency: optionIndex.quote?.currency ?? "USD",
      timestamp: toIsoTimestamp(regularMarketTime ?? Math.floor(Date.now() / 1000)),
    },
    quotes,
  };
}

async function readJsonIfExists(filepath) {
  try {
    const raw = await readFile(filepath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function main() {
  const universe = resolveUniverse();
  const maxExpirations = resolveMaxExpirations();
  let session = null;
  try {
    session = await createYahooSession();
  } catch (error) {
    console.warn("[static] Yahoo session bootstrap failed, falling back to cached snapshots.");
    console.warn(error instanceof Error ? error.message : String(error));
  }

  await mkdir(outputDir, { recursive: true });

  const manifest = {
    asOf: null,
    generatedAt: new Date().toISOString(),
    provider: "yahoo-finance-public",
    defaultSymbol: universe[0] ?? DEFAULT_UNIVERSE[0],
    symbols: [],
    failedSymbols: [],
  };

  for (const symbol of universe) {
    try {
      if (!session) {
        throw new Error("Yahoo session unavailable");
      }

      const snapshot = await buildSnapshotFromYahoo(symbol, maxExpirations, session);
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
        generatedAt: snapshot.generatedAt,
      });

      if (!manifest.asOf || snapshot.generatedAt < manifest.asOf) {
        manifest.asOf = snapshot.generatedAt;
      }

      if (symbol === manifest.defaultSymbol) {
        await writeFile(
          fallbackSnapshotPath,
          `${JSON.stringify(snapshot, null, 2)}\n`,
          "utf8",
        );
      }
      console.log(`[static] fetched ${symbol} with ${snapshot.quotes.length} quotes`);
    } catch (error) {
      console.warn(`[static] failed to fetch ${symbol}`);
      console.warn(error instanceof Error ? error.message : String(error));
      manifest.failedSymbols.push(symbol);

      const existingSnapshot = await readJsonIfExists(path.join(outputDir, `${symbol}.json`));
      if (existingSnapshot) {
        manifest.symbols.push({
          symbol,
          path: `/data/latest/${symbol}.json`,
          generatedAt: existingSnapshot.generatedAt ?? manifest.generatedAt,
        });
        if (!manifest.asOf || (existingSnapshot.generatedAt && existingSnapshot.generatedAt < manifest.asOf)) {
          manifest.asOf = existingSnapshot.generatedAt ?? manifest.asOf;
        }
      }
    }
  }

  if (!manifest.symbols.length) {
    throw new Error("No static snapshots were generated from public market data.");
  }

  await writeFile(
    path.join(outputDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error("[static] failed to generate Yahoo-based static snapshots");
  console.error(error);
  process.exitCode = 1;
});
