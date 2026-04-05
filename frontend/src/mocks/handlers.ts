import { analyzeMockPortfolio, buildMockSnapshot } from "./fixtures";
import {
  getAnalyzePortfolioMockHandler,
  getGetConfigMockHandler,
  getGetHealthMockHandler,
  getGetSnapshotMockHandler,
} from "../api/generated/default/default.msw";

function logHandledRequest(label: string, detail?: unknown) {
  if (import.meta.env.DEV) {
    console.info(`[msw] ${label}`, detail ?? "");
  }
}

export const handlers = [
  getGetHealthMockHandler(() => {
    logHandledRequest("GET /health");
    return {
      ok: true,
      provider: "mock",
    };
  }),
  getGetConfigMockHandler(() => {
    const config = {
      provider: "mock",
      defaultSymbol: "SPY",
      llmAdvisorMode: "disabled",
      providers: ["mock", "yahooSynthetic"],
      advisorModes: ["rules", "llm"],
    };
    logHandledRequest("GET /config", config);
    return config;
  }),
  getGetSnapshotMockHandler((info) => {
    const url = new URL(info.request.url);
    const symbol = url.searchParams.get("symbol") ?? "SPY";
    const provider = url.searchParams.get("provider") ?? "mock";
    const snapshot = buildMockSnapshot(symbol, provider);
    logHandledRequest("GET /snapshot", {
      symbol,
      provider,
      quotes: snapshot.quotes.length,
    });
    return snapshot;
  }),
  getAnalyzePortfolioMockHandler(async (info) => {
    const body = (await info.request.json()) as {
      snapshot: ReturnType<typeof buildMockSnapshot>;
      positionsInput: string;
      groupByMode:
        | "symbol"
        | "expiry"
        | "optionType"
        | "symbolExpiry"
        | "full";
      advisorMode: string;
    };

    const result = analyzeMockPortfolio({
      snapshot: body.snapshot,
      positionsInput: body.positionsInput,
      groupByMode: body.groupByMode,
      advisorMode: body.advisorMode,
    });
    logHandledRequest("POST /portfolio/analyze", {
      positions: result.parsedPositions.positions.length,
      parseErrors: result.parsedPositions.errors.length,
      groupedExposures: result.groupedExposures.length,
      spotScenarios: result.spotScenarios.length,
      volScenarios: result.volScenarios.length,
      timeScenarios: result.timeScenarios.length,
    });
    return result;
  }),
];
