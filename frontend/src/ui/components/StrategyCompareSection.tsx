import type { StrategyComparison } from "../../api/generated/model/strategyComparison";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";

export function StrategyCompareSection({
  comparison,
  t,
}: {
  comparison: StrategyComparison | null;
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
                <tr key={row.proposalId}>
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
      )}
    </PanelSection>
  );
}
