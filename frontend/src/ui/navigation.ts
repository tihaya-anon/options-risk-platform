import type { SidebarNavGroup } from "./components/layout/SidebarNav";
import type { I18nKey } from "./i18n";

export function buildSidebarNavGroups(t: (key: I18nKey) => string): SidebarNavGroup[] {
  return [
    {
      title: t("navDashboard"),
      items: [
        { path: "/dashboard", label: t("overviewTitle") },
        { path: "/current-book", label: t("currentBookTitle") },
      ],
    },
    {
      title: t("navRisk"),
      items: [
        { path: "/risks", label: t("riskControlTitle") },
        { path: "/risk-map", label: t("riskMapTitle") },
        { path: "/grouped-exposure", label: t("groupedExposureTitle") },
        { path: "/spot-scenario", label: t("scenarioTitle") },
        { path: "/vol-scenario", label: t("volScenarioTitle") },
        { path: "/time-scenario", label: t("timeScenarioTitle") },
      ],
    },
    {
      title: t("navHedge"),
      items: [
        { path: "/hedges", label: t("hedgeDecisionTitle") },
        { path: "/hedge-lab", label: t("hedgeLabTitle") },
        { path: "/strategy-compare", label: t("strategyCompareTitle") },
      ],
    },
    {
      title: t("navInstruments"),
      items: [
        { path: "/instruments", label: t("instrumentWorkbenchTitle") },
        { path: "/option-risk-profile", label: t("optionRiskProfileTitle") },
        { path: "/chain", label: t("chainTitle") },
        { path: "/term-structure", label: t("termTitle") },
        { path: "/skew", label: t("skewTitle") },
      ],
    },
    {
      title: t("navData"),
      tone: "muted",
      items: [
        { path: "/data", label: t("dataWorkspaceTitle") },
        { path: "/positions", label: t("positionsTitle") },
        { path: "/settings", label: t("settingsTitle") },
      ],
    },
  ];
}
