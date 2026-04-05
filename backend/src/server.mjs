import http from "node:http";
import { loadConfig } from "./config.mjs";
import { enrichSnapshot } from "./lib/enrichSnapshot.mjs";
import { analyzePortfolio } from "./lib/portfolioAnalysis.mjs";
import { getProvider } from "./providers/providerRegistry.mjs";

const config = loadConfig();
const provider = getProvider(config.provider);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req, res) => {
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
      const payload = await readJsonBody(req);
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
