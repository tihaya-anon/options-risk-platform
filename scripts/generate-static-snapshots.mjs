import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "frontend", "public", "data", "latest");
const fallbackSnapshotPath = path.join(repoRoot, "frontend", "public", "data", "latest.json");

const DEFAULT_RISK_FREE_RATE = 0.015;
const DEFAULT_MAX_EXPIRATIONS = 3;
const DEFAULT_UNIVERSE = ["510050", "510300", "510500"];
const SINA_BATCH_SIZE = 40;
const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  accept: "application/json,text/plain,*/*",
};
const SINA_HEADERS = {
  ...REQUEST_HEADERS,
  referer: "https://stock.finance.sina.com.cn/",
};

const UNDERLYING_CONFIG = {
  "510050": {
    label: "华夏上证50ETF期权",
    spotUrl: "http://yunhq.sse.com.cn:32041/v1/sh1/list/self/510050",
  },
  "510300": {
    label: "华泰柏瑞沪深300ETF期权",
    spotUrl: "http://yunhq.sse.com.cn:32041/v1/sh1/list/self/510300",
  },
  "510500": {
    label: "南方中证500ETF期权",
    spotUrl: "http://yunhq.sse.com.cn:32041/v1/sh1/list/self/510500",
  },
  "588000": {
    label: "华夏科创50ETF期权",
    spotUrl: "http://yunhq.sse.com.cn:32041/v1/sh1/list/self/588000",
  },
  "588080": {
    label: "易方达科创50ETF期权",
    spotUrl: "http://yunhq.sse.com.cn:32041/v1/sh1/list/self/588080",
  },
};

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
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((symbol, index, all) => all.indexOf(symbol) === index)
    .filter((symbol) => symbol in UNDERLYING_CONFIG);
}

function resolveMaxExpirations() {
  const raw =
    getArgumentValue("--max-expirations") ??
    process.env.STATIC_MAX_EXPIRATIONS ??
    String(DEFAULT_MAX_EXPIRATIONS);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : DEFAULT_MAX_EXPIRATIONS;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithRetry(url, options = {}, maxAttempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed ${response.status} for ${url}`);
      }
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(400 * attempt);
      }
    }
  }

  throw lastError ?? new Error(`Request failed for ${url}`);
}

async function fetchTextWithRetry(url, options = {}, maxAttempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Request failed ${response.status} for ${url}`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(400 * attempt);
      }
    }
  }

  throw lastError ?? new Error(`Request failed for ${url}`);
}

function formatDate(dateLike) {
  const value = String(dateLike);
  if (value.length !== 8) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function formatTimestamp(datePart, timePart) {
  const date = formatDate(datePart);
  const raw = String(timePart).padStart(6, "0");
  return `${date}T${raw.slice(0, 2)}:${raw.slice(2, 4)}:${raw.slice(4, 6)}+08:00`;
}

async function fetchUnderlyingSpot(symbol) {
  const config = UNDERLYING_CONFIG[symbol];
  const payload = await fetchJsonWithRetry(config.spotUrl, {
    headers: REQUEST_HEADERS,
  });
  const raw = payload?.list?.[0];

  if (!raw) {
    throw new Error(`Missing underlying spot for ${symbol}`);
  }

  return {
    symbol,
    name: raw[1] ?? config.label,
    spot: Number(raw[2]),
    currency: "CNY",
    timestamp: formatTimestamp(payload.date, payload.time),
  };
}

async function fetchCurrentDayContracts() {
  const url = "http://query.sse.com.cn/commonQuery.do";
  const params = new URLSearchParams({
    isPagination: "false",
    expireDate: "",
    securityId: "",
    sqlId: "SSE_ZQPZ_YSP_GGQQZSXT_XXPL_DRHY_SEARCH_L",
  });
  const payload = await fetchJsonWithRetry(`${url}?${params.toString()}`, {
    headers: {
      ...REQUEST_HEADERS,
      referer: "http://www.sse.com.cn/",
    },
  });

  return Array.isArray(payload?.result) ? payload.result : [];
}

function selectContractsForUnderlying(contracts, symbol, maxExpirations) {
  const filtered = contracts.filter((item) => String(item.SECURITYNAMEBYID).includes(`(${symbol})`));
  const expiryOrder = [...new Set(filtered.map((item) => String(item.EXPIRE_DATE)))].sort();
  const selectedExpiries = new Set(expiryOrder.slice(0, maxExpirations));

  return filtered
    .filter((item) => selectedExpiries.has(String(item.EXPIRE_DATE)))
    .sort((left, right) => {
      const expiryCompare = String(left.EXPIRE_DATE).localeCompare(String(right.EXPIRE_DATE));
      if (expiryCompare !== 0) return expiryCompare;
      const strikeCompare = Number(left.EXERCISE_PRICE) - Number(right.EXERCISE_PRICE);
      if (strikeCompare !== 0) return strikeCompare;
      return String(left.CALL_OR_PUT).localeCompare(String(right.CALL_OR_PUT));
    });
}

function chunk(list, size) {
  const chunks = [];
  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }
  return chunks;
}

function parseSinaLine(line) {
  const match = line.match(/^var hq_str_CON_OP_(\d+)="(.*)"$/);
  if (!match) return null;
  const [, contractCode, payload] = match;
  return {
    contractCode,
    values: payload.split(","),
  };
}

async function fetchSinaQuotes(contractCodes) {
  const resultMap = new Map();
  const batches = chunk(contractCodes, SINA_BATCH_SIZE);

  for (const batch of batches) {
    const url = `https://hq.sinajs.cn/list=${batch.map((code) => `CON_OP_${code}`).join(",")}`;
    const text = await fetchTextWithRetry(url, { headers: SINA_HEADERS });
    const lines = text
      .split(";")
      .map((line) => line.trim())
      .filter(Boolean);

    for (const line of lines) {
      const parsed = parseSinaLine(line);
      if (parsed) {
        resultMap.set(parsed.contractCode, parsed.values);
      }
    }
  }

  return resultMap;
}

function normalizeOptionType(value) {
  if (String(value).includes("购") || String(value).includes("认购")) return "call";
  return "put";
}

function buildQuoteFromContract(contract, values) {
  const bid = Number(values[1] ?? 0);
  const last = Number(values[2] ?? 0);
  const ask = Number(values[3] ?? 0);
  const openInterest = Number(values[5] ?? 0);
  const volume = Number(values[41] ?? values[42] ?? 0);

  return {
    symbol: String(contract.CONTRACT_ID),
    underlying: String(contract.SECURITYNAMEBYID).match(/\((\d+)\)/)?.[1] ?? "",
    optionType: normalizeOptionType(contract.CALL_OR_PUT),
    strike: Number(contract.EXERCISE_PRICE),
    expiry: formatDate(contract.EXPIRE_DATE),
    contractMultiplier: Number(contract.CONTRACT_UNIT ?? 10000),
    bid,
    ask,
    last,
    volume,
    openInterest,
  };
}

async function buildSnapshotFromChina(symbol, contracts, maxExpirations) {
  const underlying = await fetchUnderlyingSpot(symbol);
  const selectedContracts = selectContractsForUnderlying(contracts, symbol, maxExpirations);

  if (!selectedContracts.length) {
    throw new Error(`No SSE option contracts found for ${symbol}`);
  }

  const contractCodes = selectedContracts.map((item) => String(item.SECURITY_ID));
  const quoteMap = await fetchSinaQuotes(contractCodes);
  const quotes = selectedContracts
    .map((contract) => {
      const values = quoteMap.get(String(contract.SECURITY_ID));
      if (!values || values.length < 43) {
        return null;
      }
      return buildQuoteFromContract(contract, values);
    })
    .filter(Boolean);

  if (!quotes.length) {
    throw new Error(`No Sina quotes returned for ${symbol}`);
  }

  return {
    source: "cn-public-sse-sina",
    generatedAt: underlying.timestamp,
    riskFreeRate: DEFAULT_RISK_FREE_RATE,
    underlying: {
      symbol,
      spot: underlying.spot,
      currency: underlying.currency,
      timestamp: underlying.timestamp,
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
  const contracts = await fetchCurrentDayContracts();

  await mkdir(outputDir, { recursive: true });

  const manifest = {
    asOf: null,
    generatedAt: new Date().toISOString(),
    provider: "cn-public-sse-sina",
    defaultSymbol: universe[0] ?? DEFAULT_UNIVERSE[0],
    symbols: [],
    failedSymbols: [],
  };

  for (const symbol of universe) {
    try {
      const snapshot = await buildSnapshotFromChina(symbol, contracts, maxExpirations);
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

      console.log(`[static] fetched ${symbol} with ${snapshot.quotes.length} option quotes`);
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
    throw new Error("No mainland static snapshots were generated.");
  }

  await writeFile(
    path.join(outputDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

main().catch((error) => {
  console.error("[static] failed to generate mainland static snapshots");
  console.error(error);
  process.exitCode = 1;
});
