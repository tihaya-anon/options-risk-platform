import http from "node:http";
import { loadConfig } from "./config.js";
import { buildRiskMap, parseBook } from "./lib/bookWorkbench.js";
import { enrichSnapshot } from "./lib/enrichSnapshot.js";
import { compareStrategies, createHedgeProposals } from "./lib/hedgeLab.js";
import { analyzePortfolio } from "./lib/portfolioAnalysis.js";
import { getProvider, listProviders } from "./providers/providerRegistry.js";
import type {
  AnalysisRequest,
  BookParseRequest,
  HedgeLabRequest,
  RiskMapRequest,
  StrategyCompareRequest,
} from "./types.js";

const config = loadConfig();

function sendJson(
  res: any,
  statusCode: number,
  payload: unknown
) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: any): Promise<unknown> {
  const chunks: any[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req: any, res: any) => {
  if (!req.url || !req.method) {
    sendJson(res, 400, { error: "Invalid request" });
    return;
  }

  if (req.method === "OPTIONS") {
    sendJson(res, 200, { ok: true });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true, provider: config.provider });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/config") {
      const providerMetadata = listProviders().map((provider) => provider.metadata);
      sendJson(res, 200, {
        provider: config.provider,
        defaultSymbol: config.defaultSymbol,
        llmAdvisorMode: config.llmAdvisorMode,
        providers: providerMetadata.map((provider) => provider.id),
        advisorModes: ["rules", "llm"],
        providerMetadata,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/snapshot") {
      const symbol = url.searchParams.get("symbol") ?? config.defaultSymbol;
      const providerName = url.searchParams.get("provider") ?? config.provider;
      const provider = getProvider(providerName);
      const rawSnapshot = await provider.getSnapshot({
        symbol,
        riskFreeRate: config.riskFreeRate,
      });
      sendJson(res, 200, enrichSnapshot(rawSnapshot));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/portfolio/analyze") {
      const payload = (await readJsonBody(req)) as AnalysisRequest;
      if (!payload.snapshot) {
        sendJson(res, 400, { error: "Missing snapshot payload" });
        return;
      }
      sendJson(res, 200, analyzePortfolio(payload));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/book/parse") {
      const payload = (await readJsonBody(req)) as BookParseRequest;
      if (!payload.positionsInput) {
        sendJson(res, 400, { error: "Missing positionsInput payload" });
        return;
      }
      sendJson(res, 200, parseBook(payload));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/risk-map") {
      const payload = (await readJsonBody(req)) as RiskMapRequest;
      if (!payload.book) {
        sendJson(res, 400, { error: "Missing book payload" });
        return;
      }
      sendJson(res, 200, buildRiskMap(payload.book));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/hedge-lab/proposals") {
      const payload = (await readJsonBody(req)) as HedgeLabRequest;
      if (!payload.book) {
        sendJson(res, 400, { error: "Missing book payload" });
        return;
      }
      sendJson(res, 200, createHedgeProposals(payload));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/strategy-compare") {
      const payload = (await readJsonBody(req)) as StrategyCompareRequest;
      if (!payload.baselineExposure || !payload.proposals) {
        sendJson(res, 400, { error: "Missing strategy comparison payload" });
        return;
      }
      sendJson(res, 200, compareStrategies(payload));
      return;
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

server.listen(config.port, () => {
  console.log(
    `Options risk backend listening on http://0.0.0.0:${config.port} using provider ${config.provider}`
  );
});
