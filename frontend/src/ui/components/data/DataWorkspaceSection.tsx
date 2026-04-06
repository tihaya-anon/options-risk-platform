import { Link } from "react-router-dom";
import type { FrontendSettings } from "@/types";
import type { StaticDatasetInfo } from "@/lib/staticWorkbench";
import type { I18nKey } from "@/ui/i18n";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { StatusBadge } from "@/ui/components/shared/StatusBadge";
import { ActionRail } from "@/ui/components/layout/ActionRail";

export function DataWorkspaceSection({
  isStaticMode,
  staticDataset,
  settings,
  connectionStatus,
  positionsCount,
  parseErrorCount,
  unmatchedCount,
  t,
}: {
  isStaticMode: boolean;
  staticDataset: StaticDatasetInfo | null;
  settings: FrontendSettings;
  connectionStatus: "connected" | "degraded";
  positionsCount: number;
  parseErrorCount: number;
  unmatchedCount: number;
  t: (key: I18nKey) => string;
}) {
  const importTone =
    parseErrorCount > 0 || unmatchedCount > 0
      ? "warning"
      : positionsCount > 0
        ? "positive"
        : "neutral";
  const importLabel =
    parseErrorCount > 0
      ? t("dataWorkspaceImportReview")
      : unmatchedCount > 0
        ? t("dataWorkspaceImportPartial")
        : positionsCount > 0
          ? t("dataWorkspaceImportReady")
          : t("dataWorkspaceImportEmpty");

  return (
    <PanelSection
      title={t("dataWorkspaceTitle")}
      description={t("dataWorkspaceDesc")}
      className="data-panel"
      bodyClassName="risk-map-panel-content"
    >
      <ActionRail
        title={t("primaryActionsTitle")}
        items={[
          {
            to: "/positions",
            label: t("dashboardOpenBook"),
            caption: `${t("positionsTitle")} · ${positionsCount}`,
          },
          {
            to: "/settings",
            label: t("dashboardOpenSettings"),
            caption: isStaticMode ? t("modeStaticDaily") : t("modeLiveBackend"),
          },
          {
            to: "/current-book",
            label: t("dashboardOpenBook"),
            caption: t("dataWorkspaceReviewBook"),
          },
        ]}
      />

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
          <strong>{staticDataset?.defaultSymbol ?? (settings.focusUnderlying || t("none"))}</strong>
        </article>
        <article className="card overview-card">
          <span>{t("symbolCountTitle")}</span>
          <strong>{staticDataset?.symbols.length ?? 0}</strong>
        </article>
      </div>

      <div className="dashboard-split-grid data-workspace-grid">
        <article className="card dashboard-column-card">
          <div className="dashboard-card-topline">
            <div className="meta-block">
              <span>{t("dataWorkspaceDatasetTitle")}</span>
              <strong>{isStaticMode ? t("modeStaticDaily") : t("modeLiveBackend")}</strong>
            </div>
            <StatusBadge
              label={isStaticMode ? t("statusDelayed") : t("statusConnected")}
              tone={isStaticMode ? "info" : "positive"}
            />
          </div>
          <p className="subtle">
            {isStaticMode ? t("staticDataNoticeBody") : t("dataWorkspaceLiveModeBody")}
          </p>
          <div className="grouped-stats">
            <div>
              <span>{t("asOfTitle")}</span>
              <strong>{staticDataset?.asOf ?? t("none")}</strong>
            </div>
            <div>
              <span>{t("defaultSymbolTitle")}</span>
              <strong>{staticDataset?.defaultSymbol ?? (settings.focusUnderlying || t("none"))}</strong>
            </div>
            <div>
              <span>{t("dataWorkspaceProviderTitle")}</span>
              <strong>{staticDataset?.provider ?? settings.provider}</strong>
            </div>
            <div>
              <span>{t("dataWorkspaceFailureCount")}</span>
              <strong>{staticDataset?.failedSymbols.length ?? 0}</strong>
            </div>
          </div>
          {isStaticMode && staticDataset?.failedSymbols.length ? (
            <div className="provider-note">
              <span>{t("dataWorkspaceFailedSymbols")}</span>
              <strong>{staticDataset.failedSymbols.join(", ")}</strong>
            </div>
          ) : null}
        </article>

        <article className="card dashboard-column-card">
          <div className="dashboard-card-topline">
            <div className="meta-block">
              <span>{t("dataWorkspaceImportTitle")}</span>
              <strong>{t("dataWorkspaceImportHealthTitle")}</strong>
            </div>
            <StatusBadge label={importLabel} tone={importTone} />
          </div>
          <p className="subtle">{t("dataWorkspaceImportHealthDesc")}</p>
          <div className="grouped-stats">
            <div>
              <span>{t("dataWorkspacePositionsCount")}</span>
              <strong>{positionsCount}</strong>
            </div>
            <div>
              <span>{t("parseErrors")}</span>
              <strong>{parseErrorCount}</strong>
            </div>
            <div>
              <span>{t("unmatchedSymbols")}</span>
              <strong>{unmatchedCount}</strong>
            </div>
            <div>
              <span>{t("focusUnderlying")}</span>
              <strong>{settings.focusUnderlying || t("autoDetect")}</strong>
            </div>
          </div>
        </article>

        <article className="card dashboard-column-card">
          <div className="dashboard-card-topline">
            <div className="meta-block">
              <span>{t("dataWorkspaceConnectionTitle")}</span>
              <strong>{settings.provider}</strong>
            </div>
            <StatusBadge
              label={connectionStatus === "connected" ? t("statusConnected") : t("statusDegraded")}
              tone={connectionStatus === "connected" ? "positive" : "warning"}
            />
          </div>
          <p className="subtle">{t("dataWorkspaceConnectionHealthDesc")}</p>
          <div className="grouped-stats">
            <div>
              <span>{t("provider")}</span>
              <strong>{settings.provider}</strong>
            </div>
            <div>
              <span>{t("advisorMode")}</span>
              <strong>{settings.advisorMode}</strong>
            </div>
          </div>
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
          <ul className="compact-list">
            <li>{t("dataWorkspaceChecklistImport")}</li>
            <li>{t("dataWorkspaceChecklistMatch")}</li>
            <li>{t("dataWorkspaceChecklistReview")}</li>
          </ul>
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
          <ul className="compact-list">
            <li>{t("dataWorkspaceChecklistMode")}</li>
            <li>{t("dataWorkspaceChecklistUniverse")}</li>
            <li>{t("dataWorkspaceChecklistProvider")}</li>
          </ul>
        </article>
      </div>
    </PanelSection>
  );
}
