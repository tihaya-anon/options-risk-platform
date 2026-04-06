import type { HedgeProposalResponse } from "@/api/generated/model/hedgeProposalResponse";
import type { RiskMap } from "@/api/generated/model/riskMap";
import type { OptionSnapshotFile } from "@/types";
import type { GroupedExposure, PortfolioExposure, ScenarioPoint, TimeScenarioPoint, VolScenarioPoint } from "@/ui/positions";
import type { I18nKey } from "@/ui/i18n";
import type { Language } from "@/ui/config";
import { OverviewSection } from "@/ui/components/dashboard/OverviewSection";
import { StatusPanel } from "@/ui/components/shared/StatusPanel";

export function DashboardPage({
  snapshot,
  exposure,
  spotScenarios,
  timeScenarios,
  volScenarios,
  groupedExposures,
  riskMap,
  hedgeLab,
  focusUnderlying,
  language,
  statusMessage,
  t,
}: {
  snapshot: OptionSnapshotFile | null;
  exposure: PortfolioExposure;
  spotScenarios: ScenarioPoint[];
  timeScenarios: TimeScenarioPoint[];
  volScenarios: VolScenarioPoint[];
  groupedExposures: GroupedExposure[];
  riskMap: RiskMap | null;
  hedgeLab: HedgeProposalResponse | null;
  focusUnderlying: string;
  language: Language;
  statusMessage: string;
  t: (key: I18nKey) => string;
}) {
  if (!snapshot) {
    return (
      <StatusPanel
        title={t("failedLoad")}
        message={statusMessage}
      />
    );
  }

  return (
    <OverviewSection
      snapshot={snapshot}
      exposure={exposure}
      spotScenarios={spotScenarios}
      timeScenarios={timeScenarios}
      volScenarios={volScenarios}
      groupedExposures={groupedExposures}
      riskMap={riskMap}
      hedgeLab={hedgeLab}
      focusUnderlying={focusUnderlying}
      language={language}
      t={t}
    />
  );
}
