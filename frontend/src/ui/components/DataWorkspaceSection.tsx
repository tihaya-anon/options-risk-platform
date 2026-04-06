import { Link } from "react-router-dom";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";

export function DataWorkspaceSection({
  t,
}: {
  t: (key: I18nKey) => string;
}) {
  return (
    <PanelSection
      title={t("dataWorkspaceTitle")}
      description={t("dataWorkspaceDesc")}
      className="data-panel"
      bodyClassName="risk-map-panel-content"
    >
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
