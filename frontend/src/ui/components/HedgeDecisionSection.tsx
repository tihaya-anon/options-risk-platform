import { Link } from "react-router-dom";
import type { HedgeProposalResponse } from "../../api/generated/model/hedgeProposalResponse";
import type { StrategyComparison } from "../../api/generated/model/strategyComparison";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import { StatusBadge } from "./StatusBadge";
import { ActionRail } from "./ActionRail";

export function HedgeDecisionSection({
  hedgeLab,
  comparison,
  t,
}: {
  hedgeLab: HedgeProposalResponse | null;
  comparison: StrategyComparison | null;
  t: (key: I18nKey) => string;
}) {
  const topProposals = hedgeLab?.proposals.slice(0, 3) ?? [];
  const topComparisons = comparison?.rows.slice(0, 3) ?? [];

  return (
    <PanelSection
      title={t("hedgeDecisionTitle")}
      description={t("hedgeDecisionDesc")}
      bodyClassName="risk-map-panel-content"
    >
      {!hedgeLab ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <>
          <ActionRail
            title={t("primaryActionsTitle")}
            items={[
              {
                to: "/hedge-lab",
                label: t("dashboardOpenHedgeLab"),
                caption: topProposals[0]?.label ?? t("none"),
              },
              {
                to: "/strategy-compare",
                label: t("dashboardOpenStrategyCompare"),
                caption: topComparisons[0]?.label ?? t("none"),
              },
            ]}
          />

          <div className="dashboard-split-grid">
            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("dashboardHedgeIdeasTitle")}</span>
                  <strong>{topProposals[0]?.label ?? t("none")}</strong>
                </div>
                <Link className="button-like dashboard-link" to="/hedge-lab">
                  {t("dashboardOpenHedgeLab")}
                </Link>
              </div>
              <div className="risk-list">
                {topProposals.map((proposal) => (
                  <article key={proposal.id} className="card grouped-exposure-card">
                    <div className="dashboard-card-topline">
                      <div className="meta-block">
                        <span>{proposal.instrument ?? t("none")}</span>
                        <strong>{proposal.label}</strong>
                      </div>
                      <StatusBadge
                        label={proposal.hedgeType}
                        tone={
                          proposal.hedgeType === "protectivePut"
                            ? "warning"
                            : proposal.hedgeType === "collar"
                              ? "info"
                              : proposal.hedgeType === "futuresOverlay"
                                ? "positive"
                                : "neutral"
                        }
                      />
                    </div>
                    <p className="subtle">{proposal.summary}</p>
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

            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("strategyExplanationTitle")}</span>
                  <strong>{topComparisons[0]?.label ?? t("none")}</strong>
                </div>
                <Link className="button-like dashboard-link" to="/strategy-compare">
                  {t("dashboardOpenStrategyCompare")}
                </Link>
              </div>
              <div className="risk-list">
                {topComparisons.map((row) => (
                  <article key={row.proposalId} className="card grouped-exposure-card">
                    <div className="dashboard-card-topline">
                      <div className="meta-block">
                        <span>{row.label}</span>
                        <strong>{row.residualExposure.delta.toFixed(2)}</strong>
                      </div>
                      <StatusBadge
                        label={((row.downsideProtection ?? 0) * 100).toFixed(0) + "%"}
                        tone={
                          (row.downsideProtection ?? 0) > 0.65
                            ? "positive"
                            : (row.downsideProtection ?? 0) > 0.35
                              ? "warning"
                              : "neutral"
                        }
                      />
                    </div>
                    <p className="subtle">
                      {row.explanation?.upsideRetention ?? t("none")}
                    </p>
                    <div className="grouped-stats dashboard-proposal-stats">
                      <div>
                        <span>{t("upsideRetention")}</span>
                        <strong>{((row.upsideRetention ?? 0) * 100).toFixed(0)}%</strong>
                      </div>
                      <div>
                        <span>{t("downsideProtection")}</span>
                        <strong>{((row.downsideProtection ?? 0) * 100).toFixed(0)}%</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </article>
          </div>
        </>
      )}
    </PanelSection>
  );
}
