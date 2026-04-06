import type { RiskMap } from "@/api/generated/model/riskMap";
import { formatMoney, formatNumber } from "@/ui/format";
import type { I18nKey } from "@/ui/i18n";
import type { Language } from "@/ui/config";
import { GreekMetricCard } from "@/ui/components/shared/GreekMetricCard";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { translateBackendMessage, translateRiskCategory } from "@/ui/i18n";

export function RiskMapSection({
  riskMap,
  language,
  t,
}: {
  riskMap: RiskMap | null;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  return (
    <PanelSection
      title={t("riskMapTitle")}
      description={t("riskMapDesc")}
      bodyClassName="risk-map-panel-content"
    >
      {!riskMap ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <>
          <div className="overview-grid">
            <article className="card overview-card">
              <span>{t("grossExposure")}</span>
              <strong>{formatMoney(riskMap.exposure.grossExposure)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("netExposure")}</span>
              <strong>{formatMoney(riskMap.exposure.netExposure)}</strong>
            </article>
          </div>

          <div className="greek-mini-grid">
            <GreekMetricCard greek="delta" label={t("portfolioDelta")} value={formatNumber(riskMap.exposure.delta, 2)} t={t} />
            <GreekMetricCard greek="gamma" label={t("portfolioGamma")} value={formatNumber(riskMap.exposure.gamma, 2)} t={t} />
            <GreekMetricCard greek="vega" label={t("portfolioVega")} value={formatNumber(riskMap.exposure.vega, 2)} t={t} />
            <GreekMetricCard greek="theta" label={t("portfolioTheta")} value={formatNumber(riskMap.exposure.theta, 2)} t={t} />
          </div>

          <div className="risk-list">
            <span className="sidebar-kicker">{t("topRisksTitle")}</span>
            {riskMap.topRisks.map((risk) => (
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
        </>
      )}
    </PanelSection>
  );
}
