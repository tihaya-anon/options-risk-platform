import {
  buildMockBook,
  buildMockRiskMap,
  buildMockSnapshot,
  buildMockUniverseSnapshots,
} from "./fixtures";
import { buildStaticAnalysis, buildStaticBook } from "../lib/staticWorkbench";
import {
  getCompareStrategiesMockHandler,
  getCreateHedgeProposalsMockHandler,
  getAnalyzePortfolioMockHandler,
  getCreateRiskMapMockHandler,
  getGetConfigMockHandler,
  getGetHealthMockHandler,
  getGetSnapshotMockHandler,
  getParseBookMockHandler,
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
      provider: "mock-cn",
    };
  }),
  getGetConfigMockHandler(() => {
    const config = {
      provider: "mock",
      defaultSymbol: "510050",
      llmAdvisorMode: "disabled",
      providers: ["mock", "yahooSynthetic"],
      advisorModes: ["rules", "llm"],
      providerMetadata: [
        {
          id: "mock",
          label: "Mock CN options provider",
          requiresApiKey: false,
          supportsSnapshots: true,
          supportsOptionChain: true,
          supportsGreeks: true,
          supportsScenarios: true,
          notes: "Deterministic mainland ETF options snapshot for UI development and mock portfolio flows.",
        },
        {
          id: "yahooSynthetic",
          label: "Yahoo spot + synthetic chain",
          requiresApiKey: false,
          supportsSnapshots: true,
          supportsOptionChain: true,
          supportsGreeks: true,
          supportsScenarios: true,
          notes: "Fetches live underlying spot from Yahoo Finance and builds a synthetic option chain.",
        },
      ],
    };
    logHandledRequest("GET /config", config);
    return config;
  }),
  getGetSnapshotMockHandler((info) => {
    const url = new URL(info.request.url);
    const symbol = url.searchParams.get("symbol") ?? "510050";
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

    const result = buildStaticAnalysis({
      snapshot: body.snapshot,
      universeSnapshots: buildMockUniverseSnapshots(),
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
  getParseBookMockHandler(async (info) => {
    const body = (await info.request.json()) as {
      positionsInput: string;
      defaultSymbol?: string;
      snapshot?: ReturnType<typeof buildMockSnapshot>;
    };

    const book = buildStaticBook({
      positionsInput: body.positionsInput,
      defaultSymbol: body.defaultSymbol,
      snapshot: body.snapshot,
      universeSnapshots: buildMockUniverseSnapshots(),
    });
    logHandledRequest("POST /book/parse", {
      positions: book.positions.length,
      parsingErrors: book.parsingErrors.length,
    });
    return book;
  }),
  getCreateRiskMapMockHandler(async (info) => {
    const body = (await info.request.json()) as {
      book: ReturnType<typeof buildMockBook>;
    };
    const riskMap = buildMockRiskMap(body.book);
    logHandledRequest("POST /risk-map", {
      topRisks: riskMap.topRisks.length,
      concentrationBySymbol: riskMap.concentrationBySymbol.length,
    });
    return riskMap;
  }),
  getCreateHedgeProposalsMockHandler(async (info) => {
    const body = (await info.request.json()) as {
      book: ReturnType<typeof buildMockBook>;
    };
    const baselineExposure = buildMockRiskMap(body.book).exposure;
    return {
      baselineExposure,
      proposals: [
        {
          id: "baseline",
          hedgeType: "none",
          label: "No hedge",
          summary: "Keep the current book unchanged.",
          estimatedCost: 0,
          residualExposure: baselineExposure,
          notes: ["Baseline reference case."],
        },
        {
          id: "futures-overlay",
          hedgeType: "futuresOverlay",
          label: "Futures overlay",
          summary: "Neutralize most directional exposure with a linear overlay.",
          instrument: "FUT:SPY",
          hedgeRatio: -(baselineExposure.delta / 50),
          estimatedCost: 25,
          residualExposure: {
            ...baselineExposure,
            delta: 0,
            beta: baselineExposure.beta * 0.15,
          },
          notes: ["Efficient for beta reduction."],
        },
        {
          id: "protective-put",
          hedgeType: "protectivePut",
          label: "Protective put",
          summary: "Buy downside convexity while keeping more upside participation.",
          instrument: "ATM put",
          hedgeRatio: Math.max(Math.abs(baselineExposure.delta) / 100, 1),
          estimatedCost: Math.max(baselineExposure.grossExposure * 0.012, 250),
          residualExposure: {
            ...baselineExposure,
            delta: baselineExposure.delta * 0.45,
            beta: baselineExposure.beta * 0.55,
            vega: Math.abs(baselineExposure.vega) + 25,
            theta: baselineExposure.theta - 12,
          },
          notes: ["More expensive, but offers asymmetric downside protection."],
        },
      ],
    };
  }),
  getCompareStrategiesMockHandler(async (info) => {
    const body = (await info.request.json()) as {
      baselineExposure: ReturnType<typeof buildMockRiskMap>["exposure"];
      proposals: Array<{
        id: string;
        label: string;
        hedgeType: string;
        estimatedCost?: number | null;
        residualExposure: ReturnType<typeof buildMockRiskMap>["exposure"];
      }>;
    };
    return {
      baselineExposure: body.baselineExposure,
      rows: body.proposals.map((proposal) => ({
        proposalId: proposal.id,
        label: proposal.label,
        estimatedCost: proposal.estimatedCost ?? 0,
        residualExposure: proposal.residualExposure,
        upsideRetention:
          proposal.hedgeType === "futuresOverlay"
            ? 0.35
            : proposal.hedgeType === "protectivePut"
              ? 0.8
              : 1,
        downsideProtection:
          proposal.hedgeType === "futuresOverlay"
            ? 0.6
            : proposal.hedgeType === "protectivePut"
              ? 0.85
              : 0,
        carryTheta:
          proposal.hedgeType === "protectivePut"
            ? -(proposal.estimatedCost ?? 0) * 0.08
            : 0,
      })),
    };
  }),
];
