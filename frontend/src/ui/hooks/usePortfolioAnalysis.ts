import { useEffect, useState } from "react";
import { analyzePortfolio } from "../../api/client";
import type {
  AnalysisResponse,
  EnrichedSnapshotFile,
  GroupByMode,
} from "../../types";

export function usePortfolioAnalysis(input: {
  snapshot: EnrichedSnapshotFile | null;
  positionsInput: string;
  groupByMode: GroupByMode;
  apiBaseUrl: string;
  advisorMode: string;
}) {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.snapshot) {
      setAnalysis(null);
      return;
    }

    let isActive = true;

    analyzePortfolio({
      snapshot: input.snapshot,
      positionsInput: input.positionsInput,
      groupByMode: input.groupByMode,
      apiBaseUrl: input.apiBaseUrl,
      advisorMode: input.advisorMode,
    })
      .then((result) => {
        if (isActive) {
          if (import.meta.env.DEV) {
            console.info("[ui] analysis loaded", {
              groupedExposures: result.groupedExposures.length,
              spotScenarios: result.spotScenarios.length,
              volScenarios: result.volScenarios.length,
              timeScenarios: result.timeScenarios.length,
            });
          }
          setAnalysis(result);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          if (import.meta.env.DEV) {
            console.error("[ui] analysis load failed", err);
          }
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [
    input.advisorMode,
    input.apiBaseUrl,
    input.groupByMode,
    input.positionsInput,
    input.snapshot,
  ]);

  return { analysis, error };
}
