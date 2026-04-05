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
    })
      .then((result) => {
        if (isActive) setAnalysis(result);
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [input.groupByMode, input.positionsInput, input.snapshot]);

  return { analysis, error };
}
