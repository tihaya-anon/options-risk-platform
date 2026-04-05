import { useEffect, useState } from "react";
import { parseBook } from "../../api/client";
import type { EnrichedSnapshotFile } from "../../types";
import type { BookSnapshot } from "../../api/generated/model/bookSnapshot";

export function useBookSnapshot(input: {
  positionsInput: string;
  defaultSymbol: string;
  snapshot: EnrichedSnapshotFile | null;
  apiBaseUrl: string;
}) {
  const [book, setBook] = useState<BookSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    parseBook({
      positionsInput: input.positionsInput,
      defaultSymbol: input.defaultSymbol,
      snapshot: input.snapshot,
      apiBaseUrl: input.apiBaseUrl,
    })
      .then((result) => {
        if (isActive) {
          setBook(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setBook(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [input.apiBaseUrl, input.defaultSymbol, input.positionsInput, input.snapshot]);

  return { book, error };
}
