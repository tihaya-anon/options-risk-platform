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
            providerMetadata: [
              {
                id: "mock",
                label: "Mock provider",
                requiresApiKey: false,
                supportsSnapshots: true,
                supportsOptionChain: true,
                supportsGreeks: true,
                supportsScenarios: true,
                notes: "Deterministic local snapshot for UI development and demo flows.",
              },
              {
                id: "yahooSynthetic",
                label: "Yahoo spot + synthetic chain",
                requiresApiKey: false,
                supportsSnapshots: true,
                supportsOptionChain: true,
                supportsGreeks: true,
                supportsScenarios: true,
                notes: "Fetches live underlying spot from Yahoo Finance and builds a synthetic option chain.",
              },
            ],
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [apiBaseUrl]);

  return runtimeConfig;
}
