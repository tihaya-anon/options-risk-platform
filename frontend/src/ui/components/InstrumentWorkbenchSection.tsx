import { Link } from "react-router-dom";
import type { EnrichedOptionQuote } from "../../types";
import type { I18nKey } from "../i18n";
import { GreekMetricCard } from "./GreekMetricCard";
import { PanelSection } from "./PanelSection";
import { ActionRail } from "./ActionRail";

export function InstrumentWorkbenchSection({
  rows,
  focusUnderlying,
  selectedSymbol,
  t,
}: {
  rows: EnrichedOptionQuote[];
  focusUnderlying: string;
  selectedSymbol: string;
  t: (key: I18nKey) => string;
}) {
  const selectedRow = rows.find((row) => row.symbol === selectedSymbol) ?? rows[0] ?? null;

  return (
    <PanelSection
      title={t("instrumentWorkbenchTitle")}
      description={t("instrumentWorkbenchDesc")}
      bodyClassName="risk-map-panel-content"
    >
      <ActionRail
        title={t("primaryActionsTitle")}
        items={[
          {
            to: "/chain",
            label: t("dashboardOpenChain"),
            caption: focusUnderlying || rows[0]?.underlying || t("none"),
          },
          {
            to: "/option-risk-profile",
            label: t("dashboardOpenProfile"),
            caption: selectedRow?.symbol ?? t("none"),
          },
          {
            to: "/term-structure",
            label: t("dashboardOpenSurface"),
            caption: t("termTitle"),
          },
        ]}
      />

      <div className="dashboard-split-grid">
        <article className="card dashboard-column-card">
          <div className="meta-block">
            <span>{t("instrumentInterpretationTitle")}</span>
            <strong>{focusUnderlying || rows[0]?.underlying || t("none")}</strong>
          </div>
          <p className="subtle">{t("instrumentInterpretationBody")}</p>
          <ul className="compact-list">
            <li>{t("instrumentInterpretationChain")}</li>
            <li>{t("instrumentInterpretationProfile")}</li>
            <li>{t("instrumentInterpretationSurface")}</li>
          </ul>
        </article>

        <article className="card dashboard-column-card">
          <div className="meta-block">
            <span>{t("instrumentDecisionTitle")}</span>
            <strong>{selectedRow?.symbol ?? t("none")}</strong>
          </div>
          <p className="subtle">{t("instrumentDecisionBody")}</p>
          <div className="grouped-stats">
            <div>
              <span>{t("quoteCount")}</span>
              <strong>{rows.length}</strong>
            </div>
            <div>
              <span>{t("contractSelector")}</span>
              <strong>{selectedRow?.strike?.toFixed(2) ?? t("none")}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="dashboard-split-grid">
        <article className="card dashboard-column-card">
          <div className="dashboard-section-head">
            <div className="meta-block">
              <span>{t("dashboardInstrumentFocusTitle")}</span>
              <strong>{focusUnderlying || rows[0]?.underlying || t("none")}</strong>
            </div>
            <Link className="button-like dashboard-link" to="/chain">
              {t("dashboardOpenChain")}
            </Link>
          </div>
          <div className="risk-list">
            <article className="card grouped-exposure-card">
              <div className="meta-block">
                <span>{t("quoteCount")}</span>
                <strong>{rows.length}</strong>
              </div>
            </article>
            <article className="card grouped-exposure-card">
              <div className="meta-block">
                <span>{t("contractSelector")}</span>
                <strong>{selectedRow?.symbol ?? t("none")}</strong>
              </div>
            </article>
            <div className="chain-actions">
              <Link className="button-like dashboard-link" to="/option-risk-profile">
                {t("dashboardOpenProfile")}
              </Link>
              <Link className="button-like dashboard-link" to="/term-structure">
                {t("dashboardOpenSurface")}
              </Link>
            </div>
          </div>
        </article>

        <article className="card dashboard-column-card">
          <div className="dashboard-section-head">
            <div className="meta-block">
              <span>{t("optionRiskProfileTitle")}</span>
              <strong>{selectedRow?.strike?.toFixed(2) ?? t("none")}</strong>
            </div>
            <Link className="button-like dashboard-link" to="/option-risk-profile">
              {t("dashboardOpenProfile")}
            </Link>
          </div>
          {selectedRow ? (
            <div className="greek-mini-grid">
              <GreekMetricCard greek="delta" value={(selectedRow.delta ?? 0).toFixed(3)} t={t} />
              <GreekMetricCard greek="gamma" value={(selectedRow.gamma ?? 0).toFixed(4)} t={t} />
              <GreekMetricCard greek="vega" value={(selectedRow.vega ?? 0).toFixed(3)} t={t} />
              <GreekMetricCard greek="theta" value={(selectedRow.theta ?? 0).toFixed(3)} t={t} />
            </div>
          ) : (
            <div className="empty-state">{t("none")}</div>
          )}
        </article>
      </div>
    </PanelSection>
  );
}
