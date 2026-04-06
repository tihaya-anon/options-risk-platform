import type { RiskMap } from "../../api/generated/model/riskMap";
import type { I18nKey } from "../i18n";
import type { Language } from "../config";
import { GreekMetricCard } from "./GreekMetricCard";
import { PanelSection } from "./PanelSection";
import { translateBackendMessage } from "../i18n";

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
              <strong>{riskMap.exposure.grossExposure.toFixed(2)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("netExposure")}</span>
              <strong>{riskMap.exposure.netExposure.toFixed(2)}</strong>
            </article>
          </div>

          <div className="greek-mini-grid">
            <GreekMetricCard greek="delta" label={t("portfolioDelta")} value={riskMap.exposure.delta.toFixed(2)} t={t} />
            <GreekMetricCard greek="gamma" label={t("portfolioGamma")} value={riskMap.exposure.gamma.toFixed(2)} t={t} />
            <GreekMetricCard greek="vega" label={t("portfolioVega")} value={riskMap.exposure.vega.toFixed(2)} t={t} />
            <GreekMetricCard greek="theta" label={t("portfolioTheta")} value={riskMap.exposure.theta.toFixed(2)} t={t} />
          </div>

          <div className="risk-list">
            <span className="sidebar-kicker">{t("topRisksTitle")}</span>
            {riskMap.topRisks.map((risk) => (
              <article key={`${risk.category}-${risk.summary}`} className="card grouped-exposure-card">
                <div className="meta-block">
                  <span>{risk.category}</span>
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
