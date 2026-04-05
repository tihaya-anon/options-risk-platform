import { buildLlmAdvisorPlaceholder } from "./llmAdvisor.js";
import { buildRuleAdvisor } from "./ruleAdvisor.js";
import type { GroupedExposure, PortfolioExposure } from "../types.js";

export function buildAdvisor(
  mode: string,
  exposure: PortfolioExposure,
  groupedExposures: GroupedExposure[]
) {
  if (mode === "llm") {
    return buildLlmAdvisorPlaceholder(exposure, groupedExposures);
  }
  return buildRuleAdvisor(exposure, groupedExposures);
}
