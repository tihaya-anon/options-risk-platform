import { useEffect, useState } from "react";
import { fetchSnapshot } from "../../api/client";
import type { EnrichedSnapshotFile } from "../../types";

export function useSnapshot(
  symbol: string,
  provider: string,
  apiBaseUrl: string
) {
  const [snapshot, setSnapshot] = useState<EnrichedSnapshotFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchSnapshot(symbol, provider, apiBaseUrl)
      .then((data) => {
        if (isActive) {
          if (import.meta.env.DEV) {
            console.info("[ui] snapshot loaded", {
              symbol: data.underlying.symbol,
              quotes: data.quotes.length,
              source: data.source,
            });
          }
          setSnapshot(data);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          if (import.meta.env.DEV) {
            console.error("[ui] snapshot load failed", err);
          }
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl, provider, symbol]);

  return { snapshot, error };
}
