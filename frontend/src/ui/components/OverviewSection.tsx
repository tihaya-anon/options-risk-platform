import type { OptionSnapshotFile } from "../../types";
import type { I18nKey } from "../i18n";
import type {
  GroupedExposure,
  PortfolioExposure,
  ScenarioPoint,
  TimeScenarioPoint,
  VolScenarioPoint,
} from "../positions";
import { PanelSection } from "./PanelSection";

function getWorstScenario<T extends { portfolioPnl: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items.reduce((worst, current) =>
    current.portfolioPnl < worst.portfolioPnl ? current : worst
  );
}

export function OverviewSection({
  snapshot,
  exposure,
  spotScenarios,
  timeScenarios,
  volScenarios,
  groupedExposures,
  t,
}: {
  snapshot: OptionSnapshotFile;
  exposure: PortfolioExposure;
  spotScenarios: ScenarioPoint[];
  timeScenarios: TimeScenarioPoint[];
  volScenarios: VolScenarioPoint[];
  groupedExposures: GroupedExposure[];
  t: (key: I18nKey) => string;
}) {
  const worstSpot = getWorstScenario(spotScenarios);
  const worstTime = getWorstScenario(timeScenarios);
  const worstVol = getWorstScenario(volScenarios);
  const topRiskBucket = groupedExposures[0] ?? null;

  const cards = [
    {
      label: t("underlying"),
      value: `${snapshot.underlying.symbol} ${snapshot.underlying.spot.toFixed(2)}`,
    },
    {
      label: t("notional"),
      value: exposure.marketValue.toFixed(2),
    },
    {
      label: t("portfolioDelta"),
      value: exposure.netDelta.toFixed(2),
    },
    {
      label: t("portfolioVega"),
      value: exposure.netVega.toFixed(2),
    },
    {
      label: t("worstSpotScenario"),
      value: worstSpot
        ? `${(worstSpot.spotChangePct * 100).toFixed(0)}% / ${worstSpot.portfolioPnl.toFixed(2)}`
        : t("none"),
    },
    {
      label: t("worstVolScenario"),
      value: worstVol
        ? `${(worstVol.volShift * 100).toFixed(0)}% / ${worstVol.portfolioPnl.toFixed(2)}`
        : t("none"),
    },
    {
      label: t("worstTimeScenario"),
      value: worstTime
        ? `${worstTime.daysForward}d / ${worstTime.portfolioPnl.toFixed(2)}`
        : t("none"),
    },
    {
      label: t("topRiskBucket"),
      value: topRiskBucket ? topRiskBucket.bucket : t("none"),
    },
  ];

  return (
    <PanelSection title={t("overviewTitle")} description={t("overviewDesc")}>
      <div className="overview-grid">
        {cards.map((card) => (
          <article key={card.label} className="card overview-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>
    </PanelSection>
  );
}
