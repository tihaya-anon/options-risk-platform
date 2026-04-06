import { Link } from "react-router-dom";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import type { StaticDatasetInfo } from "../../lib/staticWorkbench";

export function DataWorkspaceSection({
  isStaticMode,
  staticDataset,
  t,
}: {
  isStaticMode: boolean;
  staticDataset: StaticDatasetInfo | null;
  t: (key: I18nKey) => string;
}) {
  return (
    <PanelSection
      title={t("dataWorkspaceTitle")}
      description={t("dataWorkspaceDesc")}
      className="data-panel"
      bodyClassName="risk-map-panel-content"
    >
      <div className="overview-grid positions-overview-grid">
        <article className="card overview-card">
          <span>{t("modeTitle")}</span>
          <strong>{isStaticMode ? t("modeStaticDaily") : t("modeLiveBackend")}</strong>
        </article>
        <article className="card overview-card">
          <span>{t("asOfTitle")}</span>
          <strong>{staticDataset?.asOf ?? t("none")}</strong>
        </article>
        <article className="card overview-card">
          <span>{t("universeTitle")}</span>
          <strong>{staticDataset?.symbols.join(", ") ?? t("none")}</strong>
        </article>
        <article className="card overview-card">
          <span>{t("defaultSymbolTitle")}</span>
          <strong>{staticDataset?.defaultSymbol ?? t("none")}</strong>
        </article>
        <article className="card overview-card">
          <span>{t("symbolCountTitle")}</span>
          <strong>{staticDataset?.symbols.length ?? 0}</strong>
        </article>
      </div>

      {isStaticMode ? (
        <div className="data-mode-callout">
          <span>{t("staticDataNoticeTitle")}</span>
          <strong>{t("staticDataNoticeBody")}</strong>
        </div>
      ) : null}

      <div className="dashboard-split-grid">
        <article className="card dashboard-column-card">
          <div className="meta-block">
            <span>{t("positionsTitle")}</span>
            <strong>{t("dataWorkspaceImportTitle")}</strong>
          </div>
          <p className="subtle">{t("dataWorkspaceImportDesc")}</p>
          <Link className="button-like dashboard-link wide" to="/positions">
            {t("dashboardOpenBook")}
          </Link>
        </article>

        <article className="card dashboard-column-card">
          <div className="meta-block">
            <span>{t("settingsTitle")}</span>
            <strong>{t("dataWorkspaceConnectionTitle")}</strong>
          </div>
          <p className="subtle">{t("dataWorkspaceConnectionDesc")}</p>
          <Link className="button-like dashboard-link wide" to="/settings">
            {t("dashboardOpenSettings")}
          </Link>
        </article>
      </div>
    </PanelSection>
  );
}
