import { useEffect, useState } from "react";
import { fetchRuntimeConfig } from "../../api/client";
import type { GetConfig200 } from "../../api/generated/model/getConfig200";

export function useRuntimeConfig(apiBaseUrl: string) {
  const [runtimeConfig, setRuntimeConfig] = useState<GetConfig200 | null>(null);

  useEffect(() => {
    let isActive = true;

    fetchRuntimeConfig(apiBaseUrl)
      .then((config) => {
        if (isActive) setRuntimeConfig(config);
      })
      .catch(() => {
        if (isActive) {
          setRuntimeConfig({
            provider: "mock",
            defaultSymbol: "SPY",
            llmAdvisorMode: "disabled",
            providers: ["mock", "yahooSynthetic"],
            advisorModes: ["rules", "llm"],
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl]);

  return runtimeConfig;
}
