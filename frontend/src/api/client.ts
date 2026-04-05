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

export const DEFAULT_API_BASE_URL = "http://localhost:8787/api";

export async function fetchHealth(apiBaseUrl: string) {
  setApiBaseUrl(apiBaseUrl);
  const response = await getHealthGenerated();
  return response.data;
}

export async function fetchRuntimeConfig(apiBaseUrl: string) {
  setApiBaseUrl(apiBaseUrl);
  const response = await getConfigGenerated();
  return response.data;
}

export async function fetchSnapshot(
  symbol: string,
  provider: string,
  apiBaseUrl: string
): Promise<EnrichedSnapshotFile> {
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
  setApiBaseUrl(input.apiBaseUrl);
  const response = await createRiskMapGenerated({
    book: input.book,
  });
  return response.data;
}

export async function createHedgeProposals(input: {
  book: BookSnapshot;
  allowedHedgeTypes?: ("none" | "futuresOverlay" | "protectivePut")[];
  target?: string;
  apiBaseUrl: string;
}): Promise<HedgeProposalResponse> {
  setApiBaseUrl(input.apiBaseUrl);
  const response = await createHedgeProposalsGenerated({
    book: input.book,
    allowedHedgeTypes: input.allowedHedgeTypes,
    target: input.target,
  });
  return response.data;
}

export async function compareStrategies(input: {
  baselineExposure: HedgeProposalResponse["baselineExposure"];
  proposals: HedgeProposalResponse["proposals"];
  apiBaseUrl: string;
}): Promise<StrategyComparison> {
  setApiBaseUrl(input.apiBaseUrl);
  const response = await compareStrategiesGenerated({
    baselineExposure: input.baselineExposure,
    proposals: input.proposals,
  });
  return response.data;
}
