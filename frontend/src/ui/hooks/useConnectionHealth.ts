import { useEffect, useState } from "react";
import { fetchHealth } from "../../api/client";
import type { GetHealth200 } from "../../api/generated/model/getHealth200";

export function useConnectionHealth(apiBaseUrl: string) {
  const [health, setHealth] = useState<GetHealth200 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    setIsChecking(true);

    fetchHealth(apiBaseUrl)
      .then((result) => {
        if (isActive) {
          setHealth(result);
          setError(null);
          setIsChecking(false);
        }
      })
      .catch((err: unknown) => {
        if (isActive) {
          setHealth(null);
          setError(err instanceof Error ? err.message : "Unknown error");
          setIsChecking(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl, checkCount]);

  return {
    health,
    error,
    isChecking,
    testConnection: () => setCheckCount((count) => count + 1),
  };
}
