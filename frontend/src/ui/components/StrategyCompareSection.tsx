import type { StrategyComparison } from "../../api/generated/model/strategyComparison";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";

export function StrategyCompareSection({
  comparison,
  selectedProposalId,
  t,
}: {
  comparison: StrategyComparison | null;
  selectedProposalId?: string;
  t: (key: I18nKey) => string;
}) {
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
                {comparison.rows.map((row) => (
                  <tr
                    key={row.proposalId}
                    className={selectedProposalId === row.proposalId ? "is-selected" : ""}
                  >
                    <td>{row.label}</td>
                    <td>{row.estimatedCost.toFixed(2)}</td>
                    <td>{row.residualExposure.delta.toFixed(2)}</td>
                    <td>{((row.upsideRetention ?? 0) * 100).toFixed(0)}%</td>
                    <td>{((row.downsideProtection ?? 0) * 100).toFixed(0)}%</td>
                    <td>{(row.carryTheta ?? 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="risk-list">
            <span className="sidebar-kicker">{t("strategyExplanationTitle")}</span>
            {comparison.rows.map((row) => (
              <article
                key={`${row.proposalId}-explanation`}
                className={`card grouped-exposure-card${selectedProposalId === row.proposalId ? " is-selected" : ""}`}
              >
                <div className="meta-block">
                  <span>{row.label}</span>
                  <strong>{row.residualExposure.delta.toFixed(2)}</strong>
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
