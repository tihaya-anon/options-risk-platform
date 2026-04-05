import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
} from "../types";
import {
  analyzePortfolio as analyzePortfolioGenerated,
  getSnapshot as getSnapshotGenerated,
} from "./generated/default/default";
import type { AnalysisRequestAdvisorMode } from "./generated/model/analysisRequestAdvisorMode";
import { setApiBaseUrl } from "./mutator";

export const DEFAULT_API_BASE_URL = "http://localhost:8787/api";

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
