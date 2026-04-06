import { Link } from "react-router-dom";
import type { OptionSnapshotFile } from "../../types";
import type { HedgeProposalResponse } from "../../api/generated/model/hedgeProposalResponse";
import type { RiskMap } from "../../api/generated/model/riskMap";
import type { I18nKey } from "../i18n";
import type { Language } from "../config";
import type {
  GroupedExposure,
  PortfolioExposure,
  ScenarioPoint,
  TimeScenarioPoint,
  VolScenarioPoint,
} from "../positions";
import { PanelSection } from "./PanelSection";
import { StatusBadge } from "./StatusBadge";
import {
  translateBackendMessage,
  translateHedgeLabel,
  translateHedgeSummary,
  translateRiskCategory,
} from "../i18n";
import { ActionRail } from "./ActionRail";

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
  riskMap,
  hedgeLab,
  focusUnderlying,
  language,
  t,
}: {
  snapshot: OptionSnapshotFile;
  exposure: PortfolioExposure;
  spotScenarios: ScenarioPoint[];
  timeScenarios: TimeScenarioPoint[];
  volScenarios: VolScenarioPoint[];
  groupedExposures: GroupedExposure[];
  riskMap: RiskMap | null;
  hedgeLab: HedgeProposalResponse | null;
  focusUnderlying: string;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  const worstSpot = getWorstScenario(spotScenarios);
  const worstTime = getWorstScenario(timeScenarios);
  const worstVol = getWorstScenario(volScenarios);
  const topRiskBucket = groupedExposures[0] ?? riskMap?.concentrationBySymbol?.[0] ?? null;
  const topRisks = riskMap?.topRisks?.slice(0, 3) ?? [];
  const topHedges = hedgeLab?.proposals?.slice(0, 3) ?? [];

  const dashboardSignal = (() => {
    const worstSpotLoss = worstSpot?.portfolioPnl ?? 0;
    const directionalLoad = Math.abs(riskMap?.exposure.delta ?? exposure.netDelta ?? 0);
    const vegaLoad = Math.abs(riskMap?.exposure.vega ?? exposure.netVega ?? 0);

    if (worstSpotLoss < -1500 || directionalLoad > 120 || vegaLoad > 80) {
      return t("dashboardSignalDefensive");
    }
    if (worstSpotLoss < -500 || directionalLoad > 45 || vegaLoad > 30) {
      return t("dashboardSignalWatch");
    }
    return t("dashboardSignalHealthy");
  })();
  const dashboardAction =
    dashboardSignal === t("dashboardSignalDefensive")
      ? t("dashboardActionDefensive")
      : dashboardSignal === t("dashboardSignalWatch")
        ? t("dashboardActionWatch")
        : t("dashboardActionHealthy");

  const cards = [
    {
      label: t("dashboardSignal"),
      value: dashboardSignal,
    },
    {
      label: t("notional"),
      value: exposure.marketValue.toFixed(2),
    },
    {
      label: t("grossExposure"),
      value: (riskMap?.exposure.grossExposure ?? 0).toFixed(2),
    },
    {
      label: t("portfolioDelta"),
      value: (riskMap?.exposure.delta ?? exposure.netDelta).toFixed(2),
    },
    {
      label: t("worstSpotScenario"),
      value: worstSpot
        ? `${(worstSpot.spotChangePct * 100).toFixed(0)}% / ${worstSpot.portfolioPnl.toFixed(2)}`
        : t("none"),
    },
    {
      label: t("topConcentration"),
      value: topRiskBucket ? topRiskBucket.bucket : t("none"),
    },
    {
      label: t("focusUnderlying"),
      value: focusUnderlying || t("focusUnderlyingEmpty"),
    },
  ];

  return (
    <PanelSection title={t("overviewTitle")} description={t("overviewDesc")}>
      <div className="dashboard-panel-content">
        <article className="card dashboard-summary-card">
          <div className="dashboard-card-topline">
            <div className="meta-block">
              <span>{t("overviewTitle")}</span>
              <strong>
                {topRisks[0]
                  ? translateBackendMessage(language, topRisks[0].summary)
                  :
                  `${snapshot.underlying.symbol} @ ${snapshot.underlying.spot.toFixed(2)}`}
              </strong>
            </div>
            <StatusBadge
              label={dashboardSignal}
              tone={
                dashboardSignal === t("dashboardSignalDefensive")
                  ? "critical"
                  : dashboardSignal === t("dashboardSignalWatch")
                    ? "warning"
                    : "positive"
              }
            />
          </div>
          <p className="subtle">
            {(topRisks[0]?.details
              ? translateBackendMessage(language, topRisks[0].details)
              : null) ??
              `${t("quoteCount")}: ${snapshot.quotes.length}. ${t("dashboardOpenRiskMap")} / ${t("dashboardOpenHedgeLab")} / ${t("dashboardOpenChain")}.`}
          </p>
          <div className="dashboard-summary-action">
            <span>{t("recommendedAction")}</span>
            <strong>{dashboardAction}</strong>
          </div>
        </article>

        <ActionRail
          title={t("primaryActionsTitle")}
          items={[
            {
              to: "/risks",
              label: t("dashboardOpenRiskMap"),
              caption: t("dashboardActionWatch"),
            },
            {
              to: "/hedges",
              label: t("dashboardOpenHedgeLab"),
              caption: t("dashboardActionDefensive"),
            },
            {
              to: "/instruments",
              label: t("dashboardOpenChain"),
              caption: t("focusUnderlying") + " / " + (focusUnderlying || snapshot.underlying.symbol),
            },
          ]}
        />

        <div className="overview-grid dashboard-metric-strip">
          {cards.map((card) => (
            <article key={card.label} className="card overview-card">
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
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
                  <div className="meta-block">
                      <span>{translateRiskCategory(language, risk.category)}</span>
                      <strong>{translateBackendMessage(language, risk.summary)}</strong>
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
                  <span>{t("dashboardHedgeIdeasTitle")}</span>
                  <strong>
                    {topHedges[0]
                      ? translateHedgeLabel(language, topHedges[0].label)
                      : t("none")}
                  </strong>
                </div>
              <Link className="button-like dashboard-link" to="/hedge-lab">
                {t("dashboardOpenHedgeLab")}
              </Link>
            </div>
            <div className="risk-list">
              {topHedges.map((proposal) => (
                <article key={proposal.id} className="card grouped-exposure-card">
                  <div className="meta-block">
                    <span>{proposal.instrument ?? t("none")}</span>
                    <strong>{translateHedgeLabel(language, proposal.label)}</strong>
                  </div>
                  <p className="subtle">
                    {translateHedgeSummary(language, proposal.summary)}
                  </p>
                  <div className="grouped-stats dashboard-proposal-stats">
                    <div>
                      <span>{t("hedgeCost")}</span>
                      <strong>{(proposal.estimatedCost ?? 0).toFixed(2)}</strong>
                    </div>
                    <div>
                      <span>{t("portfolioDelta")}</span>
                      <strong>{proposal.residualExposure.delta.toFixed(2)}</strong>
                    </div>
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
                <span>{t("dashboardInstrumentFocusTitle")}</span>
                <strong>{focusUnderlying || snapshot.underlying.symbol}</strong>
              </div>
              <Link className="button-like dashboard-link" to="/chain">
                {t("dashboardOpenChain")}
              </Link>
            </div>
            <div className="risk-list">
              <article className="card grouped-exposure-card">
                <div className="meta-block">
                  <span>{t("underlying")}</span>
                  <strong>{snapshot.underlying.symbol}</strong>
                </div>
                <p className="subtle">
                  {snapshot.underlying.spot.toFixed(2)} · {t("quoteCount")}: {snapshot.quotes.length}
                </p>
              </article>
              <article className="card grouped-exposure-card">
                <div className="meta-block">
                  <span>{t("topConcentration")}</span>
                  <strong>{topRiskBucket?.bucket ?? t("none")}</strong>
                </div>
                <p className="subtle">
                  {topRiskBucket ? `${topRiskBucket.marketValue.toFixed(2)}` : t("focusUnderlyingEmpty")}
                </p>
              </article>
              <Link className="button-like dashboard-link wide" to="/current-book">
                {t("dashboardOpenBook")}
              </Link>
            </div>
          </article>
        </div>
      </div>
    </PanelSection>
  );
}
