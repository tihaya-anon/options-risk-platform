import { useEffect, useState } from "react";
import { createHedgeProposals } from "../../api/client";
import type { BookSnapshot } from "../../api/generated/model/bookSnapshot";
import type { HedgeUniverse } from "../../api/generated/model/hedgeUniverse";
import type { HedgeProposalResponse } from "../../api/generated/model/hedgeProposalResponse";

export function useHedgeLab(input: {
  book: BookSnapshot | null;
  apiBaseUrl: string;
  target: string;
  hedgeUniverse: HedgeUniverse;
}) {
  const [hedgeLab, setHedgeLab] = useState<HedgeProposalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!input.book) {
      setHedgeLab(null);
      return;
    }

    let isActive = true;

    createHedgeProposals({
      book: input.book,
      target: input.target,
      hedgeUniverse: input.hedgeUniverse,
      apiBaseUrl: input.apiBaseUrl,
    })
      .then((result) => {
        if (isActive) {
          setHedgeLab(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setHedgeLab(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [input.apiBaseUrl, input.book, input.target, input.hedgeUniverse]);

  return { hedgeLab, error };
}
