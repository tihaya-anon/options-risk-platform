import { useEffect, useState } from "react";
import { compareStrategies } from "../../api/client";
import type { HedgeProposalResponse } from "../../api/generated/model/hedgeProposalResponse";
import type { StrategyComparison } from "../../api/generated/model/strategyComparison";

export function useStrategyComparison(input: {
  hedgeLab: HedgeProposalResponse | null;
  apiBaseUrl: string;
}) {
  const [comparison, setComparison] = useState<StrategyComparison | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.hedgeLab) {
      setComparison(null);
      return;
    }

    let isActive = true;

    compareStrategies({
      baselineExposure: input.hedgeLab.baselineExposure,
      proposals: input.hedgeLab.proposals,
      apiBaseUrl: input.apiBaseUrl,
    })
      .then((result) => {
        if (isActive) {
          setComparison(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setComparison(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [input.apiBaseUrl, input.hedgeLab]);

  return { comparison, error };
}
