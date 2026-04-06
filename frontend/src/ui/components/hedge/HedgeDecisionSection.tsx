import { Link } from "react-router-dom";
import type { HedgeProposalResponse } from "@/api/generated/model/hedgeProposalResponse";
import type { StrategyComparison } from "@/api/generated/model/strategyComparison";
import type { I18nKey } from "@/ui/i18n";
import type { Language } from "@/ui/config";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { StatusBadge } from "@/ui/components/shared/StatusBadge";
import { ActionRail } from "@/ui/components/layout/ActionRail";
import { translateHedgeLabel, translateHedgeSummary, translateHedgeType } from "@/ui/i18n";
import { formatMoney, formatNumber } from "@/ui/format";

export function HedgeDecisionSection({
  hedgeLab,
  comparison,
  language,
  t,
}: {
  hedgeLab: HedgeProposalResponse | null;
  comparison: StrategyComparison | null;
  language: Language;
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
                caption: topProposals[0]
                  ? translateHedgeLabel(language, topProposals[0].label)
                  : t("none"),
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
              <div className="meta-block">
                <span>{t("hedgeInterpretationTitle")}</span>
                <strong>
                  {topProposals[0]
                    ? translateHedgeLabel(language, topProposals[0].label)
                    : t("none")}
                </strong>
              </div>
              <p className="subtle">{t("hedgeInterpretationBody")}</p>
              <ul className="compact-list">
                <li>{t("hedgeInterpretationLinear")}</li>
                <li>{t("hedgeInterpretationConvex")}</li>
                <li>{t("hedgeInterpretationCarry")}</li>
              </ul>
            </article>

            <article className="card dashboard-column-card">
              <div className="meta-block">
                <span>{t("hedgeDecisionTitle")}</span>
                <strong>{t("hedgeDecisionHeadline")}</strong>
              </div>
              <p className="subtle">{t("hedgeDecisionBody")}</p>
              <div className="grouped-stats">
                <div>
                  <span>{t("hedgeCost")}</span>
                  <strong>{topProposals[0] ? formatMoney(topProposals[0].estimatedCost ?? 0) : t("none")}</strong>
                </div>
                <div>
                  <span>{t("downsideProtection")}</span>
                  <strong>
                    {topComparisons[0]
                      ? `${((topComparisons[0].downsideProtection ?? 0) * 100).toFixed(0)}%`
                      : t("none")}
                  </strong>
                </div>
              </div>
            </article>
          </div>

          <div className="dashboard-split-grid">
            <article className="card dashboard-column-card">
              <div className="dashboard-section-head">
                <div className="meta-block">
                  <span>{t("dashboardHedgeIdeasTitle")}</span>
                  <strong>
                    {topProposals[0]
                      ? translateHedgeLabel(language, topProposals[0].label)
                      : t("none")}
                  </strong>
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
                        <strong>{translateHedgeLabel(language, proposal.label)}</strong>
                      </div>
                      <StatusBadge
                        label={translateHedgeType(language, proposal.hedgeType)}
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
                    <p className="subtle">
                      {translateHedgeSummary(language, proposal.summary)}
                    </p>
                    <div className="grouped-stats dashboard-proposal-stats">
                      <div>
                        <span>{t("hedgeCost")}</span>
                        <strong>{formatMoney(proposal.estimatedCost ?? 0)}</strong>
                      </div>
                      <div>
                        <span>{t("portfolioDelta")}</span>
                        <strong>{formatNumber(proposal.residualExposure.delta, 2)}</strong>
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
                <Link
                  className="button-like dashboard-link"
                  to={topComparisons[0] ? `/strategy-compare?proposal=${encodeURIComponent(topComparisons[0].proposalId)}` : "/strategy-compare"}
                >
                  {t("dashboardOpenStrategyCompare")}
                </Link>
              </div>
              <div className="risk-list">
                {topComparisons.map((row) => (
                  <article key={row.proposalId} className="card grouped-exposure-card">
                    <div className="dashboard-card-topline">
                      <div className="meta-block">
                        <span>{row.label}</span>
                        <strong>{formatNumber(row.residualExposure.delta, 2)}</strong>
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
