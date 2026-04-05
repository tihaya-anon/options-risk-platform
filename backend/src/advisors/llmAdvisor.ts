import type {
  AdvisorSuggestion,
  GroupedExposure,
  PortfolioExposure,
} from "../types.js";

export function buildLlmAdvisorPlaceholder(
  exposure: PortfolioExposure,
  groupedExposures: GroupedExposure[]
): { source: string; suggestions: AdvisorSuggestion[] } {
  const suggestions: AdvisorSuggestion[] = [
    {
      risk: "LLM advisor not enabled",
      action:
        "This deployment currently uses a placeholder advisor interface. Attach an LLM service behind this adapter when you are ready.",
      source: "llm-placeholder",
    },
  ];

  const topBucket = groupedExposures[0];
  if (topBucket) {
    suggestions.push({
      risk: "Current top grouped bucket",
      action: `Start with ${topBucket.bucket} before escalating to any generated suggestions.`,
      source: "llm-placeholder",
    });
  }

  suggestions.push({
    risk: "Current net delta",
    action: `Current net delta is ${exposure.netDelta.toFixed(2)}. Use this as explicit context if you later call an LLM advisor.`,
    source: "llm-placeholder",
  });

  return {
    source: "llm-placeholder",
    suggestions,
  };
}
