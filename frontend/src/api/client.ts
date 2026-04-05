import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
} from "../types";

export const DEFAULT_API_BASE_URL = "http://localhost:8787/api";

export async function fetchSnapshot(
  symbol: string,
  apiBaseUrl: string
): Promise<EnrichedSnapshotFile> {
  const response = await fetch(
    `${apiBaseUrl}/snapshot?symbol=${encodeURIComponent(symbol)}`
  );
  if (!response.ok) {
    throw new Error(`Snapshot request failed: ${response.status}`);
  }
  return (await response.json()) as EnrichedSnapshotFile;
}

export async function analyzePortfolio(input: {
  snapshot: EnrichedSnapshotFile;
  positionsInput: string;
  groupByMode: GroupByMode;
  apiBaseUrl: string;
}): Promise<AnalysisResponse> {
  const response = await fetch(`${input.apiBaseUrl}/portfolio/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      snapshot: input.snapshot,
      positionsInput: input.positionsInput,
      groupByMode: input.groupByMode,
    }),
  });
  if (!response.ok) {
    throw new Error(`Portfolio analysis failed: ${response.status}`);
  }
  return (await response.json()) as AnalysisResponse;
}
