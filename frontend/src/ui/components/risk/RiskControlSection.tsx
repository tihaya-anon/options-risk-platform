import { Link } from "react-router-dom";
import type { RiskMap } from "@/api/generated/model/riskMap";
import type { GroupedExposure } from "@/api/generated/model/groupedExposure";
import type { I18nKey } from "@/ui/i18n";
import type {
  ScenarioPoint,
  TimeScenarioPoint,
  VolScenarioPoint,
} from "@/ui/positions";
import { GreekMetricCard } from "@/ui/components/shared/GreekMetricCard";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { StatusBadge } from "@/ui/components/shared/StatusBadge";
import type { Language } from "@/ui/config";
import { translateBackendMessage, translateRiskCategory } from "@/ui/i18n";
import { ActionRail } from "@/ui/components/layout/ActionRail";
import { formatMoney, formatNumber } from "@/ui/format";

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
            ]}
          />

          <div className="dashboard-split-grid">
            <article className="card dashboard-column-card">
              <div className="meta-block">
                <span>{t("riskInterpretationTitle")}</span>
                <strong>{topRisks[0] ? translateBackendMessage(language, topRisks[0].summary) : t("none")}</strong>
              </div>
              <p className="subtle">{t("riskInterpretationBody")}</p>
              <ul className="compact-list">
                <li>{t("riskInterpretationDirectional")}</li>
                <li>{t("riskInterpretationConcentration")}</li>
                <li>{t("riskInterpretationScenario")}</li>
              </ul>
            </article>

            <article className="card dashboard-column-card">
              <div className="meta-block">
                <span>{t("riskDecisionTitle")}</span>
                <strong>{t("riskDecisionHeadline")}</strong>
              </div>
              <p className="subtle">{t("riskDecisionBody")}</p>
              <div className="grouped-stats">
                <div>
                  <span>{t("worstSpotScenario")}</span>
                  <strong>{worstSpot ? formatMoney(worstSpot.portfolioPnl) : t("none")}</strong>
                </div>
                <div>
                  <span>{t("topConcentration")}</span>
                  <strong>{topBuckets[0]?.bucket ?? t("none")}</strong>
                </div>
              </div>
            </article>
          </div>

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
                        <span>{translateRiskCategory(language, risk.category)}</span>
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
                <Link
                  className="button-like dashboard-link"
                  to={topBuckets[0] ? `/grouped-exposure?bucket=${encodeURIComponent(topBuckets[0].bucket)}` : "/grouped-exposure"}
                >
                  {t("dashboardOpenGroupedExposure")}
                </Link>
              </div>
              <div className="risk-list">
                {topBuckets.map((bucket) => (
                  <article key={bucket.bucket} className="card grouped-exposure-card">
                    <div className="meta-block">
                      <span>{bucket.bucket}</span>
                      <strong>{formatMoney(bucket.marketValue)}</strong>
                    </div>
                    <div className="greek-mini-grid">
                      <GreekMetricCard greek="delta" value={formatNumber(bucket.netDelta, 2)} t={t} />
                      <GreekMetricCard greek="vega" value={formatNumber(bucket.netVega, 2)} t={t} />
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
                        ? `${(worstSpot.spotChangePct * 100).toFixed(0)}% / ${formatMoney(worstSpot.portfolioPnl)}`
                        : t("none")}
                    </strong>
                  </div>
                </article>
                <article className="card grouped-exposure-card">
                  <div className="meta-block">
                    <span>{t("worstVolScenario")}</span>
                    <strong>
                      {worstVol
                        ? `${(worstVol.volShift * 100).toFixed(0)}% / ${formatMoney(worstVol.portfolioPnl)}`
                        : t("none")}
                    </strong>
                  </div>
                </article>
                <article className="card grouped-exposure-card">
                  <div className="meta-block">
                    <span>{t("worstTimeScenario")}</span>
                    <strong>
                      {worstTime
                        ? `${worstTime.daysForward}d / ${formatMoney(worstTime.portfolioPnl)}`
                        : t("none")}
                    </strong>
                  </div>
                </article>
              </div>
            </article>
          </div>
        </>
      )}
    </PanelSection>
  );
}
