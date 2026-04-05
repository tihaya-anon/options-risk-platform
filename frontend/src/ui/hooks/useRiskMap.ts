import { useEffect, useState } from "react";
import { createRiskMap } from "../../api/client";
import type { BookSnapshot } from "../../api/generated/model/bookSnapshot";
import type { RiskMap } from "../../api/generated/model/riskMap";

export function useRiskMap(input: {
  book: BookSnapshot | null;
  apiBaseUrl: string;
}) {
  const [riskMap, setRiskMap] = useState<RiskMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.book) {
      setRiskMap(null);
      return;
    }

    let isActive = true;

    createRiskMap({
      book: input.book,
      apiBaseUrl: input.apiBaseUrl,
    })
      .then((result) => {
        if (isActive) {
          setRiskMap(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setRiskMap(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [input.apiBaseUrl, input.book]);

  return { riskMap, error };
}
