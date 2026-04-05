import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
} from "../types";

const DEFAULT_API_BASE_URL = "http://localhost:8787/api";

function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export async function fetchSnapshot(
  symbol: string
): Promise<EnrichedSnapshotFile> {
  const response = await fetch(
    `${getApiBaseUrl()}/snapshot?symbol=${encodeURIComponent(symbol)}`
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
}): Promise<AnalysisResponse> {
  const response = await fetch(`${getApiBaseUrl()}/portfolio/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`Portfolio analysis failed: ${response.status}`);
  }
  return (await response.json()) as AnalysisResponse;
}
