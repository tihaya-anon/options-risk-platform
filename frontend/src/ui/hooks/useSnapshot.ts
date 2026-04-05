import { useEffect, useState } from "react";
import { fetchSnapshot } from "../../api/client";
import type { EnrichedSnapshotFile } from "../../types";

export function useSnapshot(symbol: string) {
  const [snapshot, setSnapshot] = useState<EnrichedSnapshotFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchSnapshot(symbol)
      .then((data) => {
        if (isActive) setSnapshot(data);
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [symbol]);

  return { snapshot, error };
}
