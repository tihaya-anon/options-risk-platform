import { useEffect, useState } from "react";
import { fetchHealth } from "../../api/client";
import type { GetHealth200 } from "../../api/generated/model/getHealth200";

export function useConnectionHealth(apiBaseUrl: string) {
  const [health, setHealth] = useState<GetHealth200 | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchHealth(apiBaseUrl)
      .then((result) => {
        if (isActive) {
          setHealth(result);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setHealth(null);
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl]);

  return { health, error };
}
