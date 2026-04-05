import http from "node:http";
import { loadConfig } from "./config.js";
import { enrichSnapshot } from "./lib/enrichSnapshot.js";
import { analyzePortfolio } from "./lib/portfolioAnalysis.js";
import { getProvider } from "./providers/providerRegistry.js";
import type { AnalysisRequest } from "./types.js";

const config = loadConfig();
const provider = getProvider(config.provider);

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
      sendJson(res, 200, { ok: true, provider: provider.name });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/config") {
      sendJson(res, 200, {
        provider: provider.name,
        defaultSymbol: config.defaultSymbol,
        llmAdvisorMode: config.llmAdvisorMode,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/snapshot") {
      const symbol = url.searchParams.get("symbol") ?? config.defaultSymbol;
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

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

server.listen(config.port, () => {
  console.log(
    `Options risk backend listening on http://0.0.0.0:${config.port} using provider ${provider.name}`
  );
});
