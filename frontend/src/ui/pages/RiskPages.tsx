import type { RiskMap } from "@/api/generated/model/riskMap";
import type { GroupedExposure, ScenarioPoint, TimeScenarioPoint, VolScenarioPoint } from "@/ui/positions";
import type { I18nKey } from "@/ui/i18n";
import type { Language } from "@/ui/config";
import type { ChartTheme } from "@/ui/chartTheme";
import type { GroupByMode } from "@/types";
import { GroupedExposureSection } from "@/ui/components/risk/GroupedExposureSection";
import { RiskControlSection } from "@/ui/components/risk/RiskControlSection";
import { RiskMapSection } from "@/ui/components/risk/RiskMapSection";
import { ScenarioPnlSection } from "@/ui/components/risk/ScenarioPnlSection";
import { TimeScenarioSection } from "@/ui/components/risk/TimeScenarioSection";
import { VolScenarioSection } from "@/ui/components/risk/VolScenarioSection";

export function RiskSummaryPage({
  riskMap,
  groupedExposures,
  spotScenarios,
  volScenarios,
  timeScenarios,
  language,
  t,
}: {
  riskMap: RiskMap | null;
  groupedExposures: GroupedExposure[];
  spotScenarios: ScenarioPoint[];
  volScenarios: VolScenarioPoint[];
  timeScenarios: TimeScenarioPoint[];
  language: Language;
  t: (key: I18nKey) => string;
}) {
  return (
    <RiskControlSection
      riskMap={riskMap}
      groupedExposures={groupedExposures}
      spotScenarios={spotScenarios}
      volScenarios={volScenarios}
      timeScenarios={timeScenarios}
      language={language}
      t={t}
    />
  );
}

export function RiskMapPage({
  riskMap,
  language,
  t,
}: {
  riskMap: RiskMap | null;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  return <RiskMapSection riskMap={riskMap} language={language} t={t} />;
}

export function GroupedExposurePage({
  groups,
  groupByMode,
  selectedBucket,
  t,
  chartTheme,
  onGroupByModeChange,
}: {
  groups: GroupedExposure[];
  groupByMode: GroupByMode;
  selectedBucket?: string;
  t: (key: I18nKey) => string;
  chartTheme: ChartTheme;
  onGroupByModeChange: (mode: GroupByMode) => void;
}) {
  return (
    <GroupedExposureSection
      groups={groups}
      groupByMode={groupByMode}
      selectedBucket={selectedBucket}
      t={t}
      chartTheme={chartTheme}
      onGroupByModeChange={onGroupByModeChange}
    />
  );
}

export function SpotScenarioPage({
  scenarios,
  t,
  accentColor,
  neutralColor,
  chartTheme,
}: {
  scenarios: ScenarioPoint[];
  t: (key: I18nKey) => string;
  accentColor: string;
  neutralColor: string;
  chartTheme: ChartTheme;
}) {
  return (
    <ScenarioPnlSection
      scenarios={scenarios}
      t={t}
      accentColor={accentColor}
      neutralColor={neutralColor}
      chartTheme={chartTheme}
    />
  );
}

export function VolScenarioPage({
  scenarios,
  t,
  accentColor,
  neutralColor,
  chartTheme,
}: {
  scenarios: VolScenarioPoint[];
  t: (key: I18nKey) => string;
  accentColor: string;
  neutralColor: string;
  chartTheme: ChartTheme;
}) {
  return (
    <VolScenarioSection
      scenarios={scenarios}
      t={t}
      accentColor={accentColor}
      neutralColor={neutralColor}
      chartTheme={chartTheme}
    />
  );
}

export function TimeScenarioPage({
  scenarios,
  t,
  accentColor,
  neutralColor,
  chartTheme,
}: {
  scenarios: TimeScenarioPoint[];
  t: (key: I18nKey) => string;
  accentColor: string;
  neutralColor: string;
  chartTheme: ChartTheme;
}) {
  return (
    <TimeScenarioSection
      scenarios={scenarios}
      t={t}
      accentColor={accentColor}
      neutralColor={neutralColor}
      chartTheme={chartTheme}
    />
  );
}
