import type {
  AdvisorSuggestion,
  GroupedExposure,
  PortfolioExposure,
} from "../types.js";

export function buildRuleAdvisor(
  exposure: PortfolioExposure,
  groupedExposures: GroupedExposure[]
): { source: string; suggestions: AdvisorSuggestion[] } {
  const suggestions: AdvisorSuggestion[] = [];

  if (Math.abs(exposure.netDelta) > 150) {
    suggestions.push({
      risk: "Directional delta concentration",
      action:
        exposure.netDelta > 0
          ? "Consider reducing net long delta with short futures, short calls, or put hedges."
          : "Consider reducing net short delta with long futures or call structures.",
      source: "rules",
    });
  }

  if (Math.abs(exposure.netVega) > 800) {
    suggestions.push({
      risk: "Large net vega exposure",
      action:
        exposure.netVega > 0
          ? "Review long-vol concentration and scenario sensitivity to vol crush."
          : "Review short-vol tail risk and consider convex hedges.",
      source: "rules",
    });
  }

  const topBucket = groupedExposures[0];
  if (topBucket) {
    suggestions.push({
      risk: "Largest grouped bucket",
      action: `Inspect bucket ${topBucket.bucket} first; it currently dominates grouped exposure.`,
      source: "rules",
    });
  }

  return {
    source: "rules",
    suggestions,
  };
}
