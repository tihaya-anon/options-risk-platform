import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
} from "../types";
import {
  analyzePortfolio as analyzePortfolioGenerated,
  compareStrategies as compareStrategiesGenerated,
  createRiskMap as createRiskMapGenerated,
  createHedgeProposals as createHedgeProposalsGenerated,
  getConfig as getConfigGenerated,
  getHealth as getHealthGenerated,
  parseBook as parseBookGenerated,
  getSnapshot as getSnapshotGenerated,
} from "./generated/default/default";
import type { BookSnapshot } from "./generated/model/bookSnapshot";
import type { HedgeProposalResponse } from "./generated/model/hedgeProposalResponse";
import type { RiskMap } from "./generated/model/riskMap";
import type { StrategyComparison } from "./generated/model/strategyComparison";
import type { AnalysisRequestAdvisorMode } from "./generated/model/analysisRequestAdvisorMode";
import { setApiBaseUrl } from "./mutator";
import {
  buildStaticAnalysis,
  buildStaticBook,
  buildStaticHedgeLab,
  buildStaticRiskMap,
  buildStaticStrategyCompare,
  fetchStaticHealth,
  fetchStaticRuntimeConfig,
  fetchStaticSnapshot,
  fetchStaticUniverseSnapshots,
  isStaticDemoMode,
} from "../lib/staticWorkbench";

export const DEFAULT_API_BASE_URL = "";

export async function fetchHealth(apiBaseUrl: string) {
  if (isStaticDemoMode(apiBaseUrl)) {
    return fetchStaticHealth();
  }
  setApiBaseUrl(apiBaseUrl);
  const response = await getHealthGenerated();
  return response.data;
}

export async function fetchRuntimeConfig(apiBaseUrl: string) {
  if (isStaticDemoMode(apiBaseUrl)) {
    return fetchStaticRuntimeConfig();
  }
  setApiBaseUrl(apiBaseUrl);
  const response = await getConfigGenerated();
  return response.data;
}

export async function fetchSnapshot(
  symbol: string,
  provider: string,
  apiBaseUrl: string
): Promise<EnrichedSnapshotFile> {
  if (isStaticDemoMode(apiBaseUrl)) {
    return fetchStaticSnapshot(symbol);
  }
  setApiBaseUrl(apiBaseUrl);
  const response = await getSnapshotGenerated({ symbol, provider });
  return response.data as EnrichedSnapshotFile;
}

export async function analyzePortfolio(input: {
  snapshot: EnrichedSnapshotFile;
  positionsInput: string;
  groupByMode: GroupByMode;
  apiBaseUrl: string;
  advisorMode: string;
}): Promise<AnalysisResponse> {
  if (isStaticDemoMode(input.apiBaseUrl)) {
    const universeSnapshots = await fetchStaticUniverseSnapshots();
    return buildStaticAnalysis({
      snapshot: input.snapshot,
      universeSnapshots,
      positionsInput: input.positionsInput,
      groupByMode: input.groupByMode,
      advisorMode: input.advisorMode,
    });
  }
  setApiBaseUrl(input.apiBaseUrl);
  const response = await analyzePortfolioGenerated({
      snapshot: input.snapshot,
      positionsInput: input.positionsInput,
      groupByMode: input.groupByMode,
      advisorMode: input.advisorMode as AnalysisRequestAdvisorMode,
  });
  return response.data as AnalysisResponse;
}

export async function parseBook(input: {
  positionsInput: string;
  defaultSymbol?: string;
  snapshot?: EnrichedSnapshotFile | null;
  apiBaseUrl: string;
}): Promise<BookSnapshot> {
  if (isStaticDemoMode(input.apiBaseUrl)) {
    const universeSnapshots = await fetchStaticUniverseSnapshots();
    return buildStaticBook({
      positionsInput: input.positionsInput,
      defaultSymbol: input.defaultSymbol,
      snapshot: input.snapshot,
      universeSnapshots,
    });
  }
  setApiBaseUrl(input.apiBaseUrl);
  const response = await parseBookGenerated({
    positionsInput: input.positionsInput,
    defaultSymbol: input.defaultSymbol,
    snapshot: input.snapshot ?? undefined,
  });
  return response.data;
}

export async function createRiskMap(input: {
  book: BookSnapshot;
  apiBaseUrl: string;
}): Promise<RiskMap> {
  if (isStaticDemoMode(input.apiBaseUrl)) {
    return buildStaticRiskMap(input.book);
  }
  setApiBaseUrl(input.apiBaseUrl);
  const response = await createRiskMapGenerated({
    book: input.book,
  });
  return response.data;
}

export async function createHedgeProposals(input: {
  book: BookSnapshot;
  allowedHedgeTypes?: ("none" | "futuresOverlay" | "protectivePut" | "collar")[];
  target?: string;
  hedgeUniverse?: "futuresOnly" | "optionsOnly" | "futuresAndOptions";
  apiBaseUrl: string;
}): Promise<HedgeProposalResponse> {
  if (isStaticDemoMode(input.apiBaseUrl)) {
    return buildStaticHedgeLab({
      book: input.book,
      target: input.target,
      hedgeUniverse: input.hedgeUniverse,
    });
  }
  setApiBaseUrl(input.apiBaseUrl);
  const response = await createHedgeProposalsGenerated({
    book: input.book,
    allowedHedgeTypes: input.allowedHedgeTypes,
    target: input.target,
    hedgeUniverse: input.hedgeUniverse,
  });
  return response.data;
}

export async function compareStrategies(input: {
  baselineExposure: HedgeProposalResponse["baselineExposure"];
  proposals: HedgeProposalResponse["proposals"];
  apiBaseUrl: string;
}): Promise<StrategyComparison> {
  if (isStaticDemoMode(input.apiBaseUrl)) {
    return buildStaticStrategyCompare({
      baselineExposure: input.baselineExposure,
      proposals: input.proposals,
    });
  }
  setApiBaseUrl(input.apiBaseUrl);
  const response = await compareStrategiesGenerated({
    baselineExposure: input.baselineExposure,
    proposals: input.proposals,
  });
  return response.data;
}
