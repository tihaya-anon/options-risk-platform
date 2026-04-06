import type { StrategyComparison } from "@/api/generated/model/strategyComparison";
import type { Language } from "@/ui/config";
import { formatMoney, formatNumber } from "@/ui/format";
import type { I18nKey } from "@/ui/i18n";
import { translateHedgeLabel } from "@/ui/i18n";
import { PanelSection } from "@/ui/components/layout/PanelSection";

export function StrategyCompareSection({
  comparison,
  selectedProposalId,
  language,
  t,
}: {
  comparison: StrategyComparison | null;
  selectedProposalId?: string;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  const sortedRows = [...(comparison?.rows ?? [])].sort((left, right) => {
    const leftScore =
      (left.downsideProtection ?? 0) * 100 -
      Math.abs(left.residualExposure.delta) * 0.6 -
      (left.estimatedCost ?? 0) * 0.02;
    const rightScore =
      (right.downsideProtection ?? 0) * 100 -
      Math.abs(right.residualExposure.delta) * 0.6 -
      (right.estimatedCost ?? 0) * 0.02;
    return rightScore - leftScore;
  });
  const bestProtection = sortedRows[0] ?? null;
  const lowestCost =
    sortedRows.length > 0
      ? sortedRows.reduce((best, row) =>
          (row.estimatedCost ?? Number.POSITIVE_INFINITY) <
          (best.estimatedCost ?? Number.POSITIVE_INFINITY)
            ? row
            : best,
        )
      : null;

  return (
    <PanelSection
      title={t("strategyCompareTitle")}
      description={t("strategyCompareDesc")}
      bodyClassName="risk-map-panel-content"
    >
      {!comparison ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <div className="risk-map-panel-content">
          <div className="dashboard-split-grid">
            <article className="card dashboard-column-card">
              <div className="meta-block">
                <span>{t("strategyCompareBestProtection")}</span>
                <strong>
                  {bestProtection ? translateHedgeLabel(language, bestProtection.label) : t("none")}
                </strong>
              </div>
              <p className="subtle">
                {bestProtection
                  ? `${t("downsideProtection")} ${((bestProtection.downsideProtection ?? 0) * 100).toFixed(0)}%`
                  : t("none")}
              </p>
            </article>
            <article className="card dashboard-column-card">
              <div className="meta-block">
                <span>{t("strategyCompareLowestCost")}</span>
                <strong>
                  {lowestCost ? translateHedgeLabel(language, lowestCost.label) : t("none")}
                </strong>
              </div>
              <p className="subtle">
                {lowestCost ? `${t("hedgeCost")} ${formatMoney(lowestCost.estimatedCost)}` : t("none")}
              </p>
            </article>
          </div>

          <div className="book-table-wrap">
            <table className="book-table">
              <thead>
                <tr>
                  <th>{t("strategyLabel")}</th>
                  <th>{t("hedgeCost")}</th>
                  <th>{t("portfolioDelta")}</th>
                  <th>{t("upsideRetention")}</th>
                  <th>{t("downsideProtection")}</th>
                  <th>{t("carryTheta")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row) => (
                  <tr
                    key={row.proposalId}
                    className={selectedProposalId === row.proposalId ? "is-selected" : ""}
                  >
                    <td>
                      <div className="strategy-label-cell">
                        <strong>{translateHedgeLabel(language, row.label)}</strong>
                      </div>
                    </td>
                    <td>{formatMoney(row.estimatedCost)}</td>
                    <td>{formatNumber(row.residualExposure.delta, 2)}</td>
                    <td>{((row.upsideRetention ?? 0) * 100).toFixed(0)}%</td>
                    <td>{((row.downsideProtection ?? 0) * 100).toFixed(0)}%</td>
                    <td>{formatNumber(row.carryTheta ?? 0, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="risk-list">
            <span className="sidebar-kicker">{t("strategyExplanationTitle")}</span>
            {sortedRows.map((row) => (
              <article
                key={`${row.proposalId}-explanation`}
                className={`card grouped-exposure-card${selectedProposalId === row.proposalId ? " is-selected" : ""}`}
              >
                <div className="dashboard-card-topline">
                  <div className="meta-block">
                    <span>{translateHedgeLabel(language, row.label)}</span>
                    <strong>{formatNumber(row.residualExposure.delta, 2)}</strong>
                  </div>
                </div>
                <div className="strategy-score-grid">
                  <div className="strategy-score-card">
                    <span>{t("upsideRetention")}</span>
                    <strong>{((row.upsideRetention ?? 0) * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="strategy-score-card">
                    <span>{t("downsideProtection")}</span>
                    <strong>{((row.downsideProtection ?? 0) * 100).toFixed(0)}%</strong>
                  </div>
                  <div className="strategy-score-card">
                    <span>{t("hedgeCost")}</span>
                    <strong>{formatMoney(row.estimatedCost)}</strong>
                  </div>
                </div>
                {row.explanation ? (
                  <div className="dashboard-split-grid hedge-rationale-grid">
                    <div className="meta-block">
                      <span>{t("upsideRetention")}</span>
                      <strong>{row.explanation.upsideRetention}</strong>
                    </div>
                    <div className="meta-block">
                      <span>{t("downsideProtection")}</span>
                      <strong>{row.explanation.downsideProtection}</strong>
                    </div>
                    <div className="meta-block">
                      <span>{t("carryTheta")}</span>
                      <strong>{row.explanation.carryTheta}</strong>
                    </div>
                    <div className="meta-block">
                      <span>{t("hedgeResidualRisks")}</span>
                      <strong>{row.explanation.residualExposure}</strong>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      )}
    </PanelSection>
  );
}
