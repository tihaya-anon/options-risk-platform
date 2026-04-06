import { Link } from "react-router-dom";
import type { RiskMap } from "../../api/generated/model/riskMap";
import type { GroupedExposure } from "../../api/generated/model/groupedExposure";
import type { I18nKey } from "../i18n";
import type {
  ScenarioPoint,
  TimeScenarioPoint,
  VolScenarioPoint,
} from "../positions";
import { GreekMetricCard } from "./GreekMetricCard";
import { PanelSection } from "./PanelSection";
import { StatusBadge } from "./StatusBadge";
import type { Language } from "../config";
import { translateBackendMessage } from "../i18n";
import { ActionRail } from "./ActionRail";

function getWorstScenario<T extends { portfolioPnl: number }>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items.reduce((worst, current) =>
    current.portfolioPnl < worst.portfolioPnl ? current : worst
  );
}

export function RiskControlSection({
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
  const worstSpot = getWorstScenario(spotScenarios);
  const worstVol = getWorstScenario(volScenarios);
  const worstTime = getWorstScenario(timeScenarios);
  const topBuckets = groupedExposures.slice(0, 3);
  const topRisks = riskMap?.topRisks.slice(0, 4) ?? [];

  return (
    <PanelSection
      title={t("riskControlTitle")}
      description={t("riskControlDesc")}
      bodyClassName="risk-map-panel-content"
    >
      {!riskMap ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <>
          <ActionRail
            title={t("primaryActionsTitle")}
            items={[
              {
                to: "/grouped-exposure",
                label: t("dashboardOpenGroupedExposure"),
                caption: topBuckets[0]?.bucket ?? t("none"),
              },
              {
                to: "/spot-scenario",
                label: t("dashboardOpenScenarios"),
                caption: t("worstSpotScenario"),
              },
              {
                to: "/greeks-summary",
                label: t("dashboardOpenGreeks"),
                caption: t("greeksSummaryTitle"),
              },
            ]}
          />

          <div className="dashboard-split-grid">
            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("dashboardTopRisksTitle")}</span>
                  <strong>
                    {topRisks[0]
                      ? translateBackendMessage(language, topRisks[0].summary)
                      : t("none")}
                  </strong>
                </div>
                <Link className="button-like dashboard-link" to="/risk-map">
                  {t("dashboardOpenRiskMap")}
                </Link>
              </div>
              <div className="risk-list">
                {topRisks.map((risk) => (
                  <article key={`${risk.category}-${risk.summary}`} className="card grouped-exposure-card">
                    <div className="dashboard-card-topline">
                      <div className="meta-block">
                        <span>{risk.category}</span>
                        <strong>{translateBackendMessage(language, risk.summary)}</strong>
                      </div>
                      <StatusBadge
                        label={risk.severity}
                        tone={
                          risk.severity === "high"
                            ? "critical"
                            : risk.severity === "medium"
                              ? "warning"
                              : "info"
                        }
                      />
                    </div>
                    {risk.details ? (
                      <p className="subtle">
                        {translateBackendMessage(language, risk.details)}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </article>

            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("groupedExposureTitle")}</span>
                  <strong>{topBuckets[0]?.bucket ?? t("none")}</strong>
                </div>
                <Link className="button-like dashboard-link" to="/grouped-exposure">
                  {t("dashboardOpenGroupedExposure")}
                </Link>
              </div>
              <div className="risk-list">
                {topBuckets.map((bucket) => (
                  <article key={bucket.bucket} className="card grouped-exposure-card">
                    <div className="meta-block">
                      <span>{bucket.bucket}</span>
                      <strong>{bucket.marketValue.toFixed(2)}</strong>
                    </div>
                    <div className="greek-mini-grid">
                      <GreekMetricCard greek="delta" value={bucket.netDelta.toFixed(2)} t={t} />
                      <GreekMetricCard greek="vega" value={bucket.netVega.toFixed(2)} t={t} />
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </div>

          <div className="dashboard-split-grid">
            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("dashboardScenarioWatchTitle")}</span>
                  <strong>{t("worstSpotScenario")}</strong>
                </div>
                <Link className="button-like dashboard-link" to="/spot-scenario">
                  {t("dashboardOpenScenarios")}
                </Link>
              </div>
              <div className="risk-list">
                <article className="card grouped-exposure-card">
                  <div className="meta-block">
                    <span>{t("worstSpotScenario")}</span>
                    <strong>
                      {worstSpot
                        ? `${(worstSpot.spotChangePct * 100).toFixed(0)}% / ${worstSpot.portfolioPnl.toFixed(2)}`
                        : t("none")}
                    </strong>
                  </div>
                </article>
                <article className="card grouped-exposure-card">
                  <div className="meta-block">
                    <span>{t("worstVolScenario")}</span>
                    <strong>
                      {worstVol
                        ? `${(worstVol.volShift * 100).toFixed(0)}% / ${worstVol.portfolioPnl.toFixed(2)}`
                        : t("none")}
                    </strong>
                  </div>
                </article>
                <article className="card grouped-exposure-card">
                  <div className="meta-block">
                    <span>{t("worstTimeScenario")}</span>
                    <strong>
                      {worstTime
                        ? `${worstTime.daysForward}d / ${worstTime.portfolioPnl.toFixed(2)}`
                        : t("none")}
                    </strong>
                  </div>
                </article>
              </div>
            </article>

            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("greeksSummaryTitle")}</span>
                  <strong>{t("riskMapTitle")}</strong>
                </div>
                <Link className="button-like dashboard-link" to="/greeks-summary">
                  {t("dashboardOpenGreeks")}
                </Link>
              </div>
              <div className="greek-mini-grid">
                <GreekMetricCard greek="delta" label={t("portfolioDelta")} value={riskMap.exposure.delta.toFixed(2)} t={t} />
                <GreekMetricCard greek="gamma" label={t("portfolioGamma")} value={riskMap.exposure.gamma.toFixed(2)} t={t} />
                <GreekMetricCard greek="vega" label={t("portfolioVega")} value={riskMap.exposure.vega.toFixed(2)} t={t} />
                <GreekMetricCard greek="theta" label={t("portfolioTheta")} value={riskMap.exposure.theta.toFixed(2)} t={t} />
              </div>
            </article>
          </div>
        </>
      )}
    </PanelSection>
  );
}
