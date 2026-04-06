import type { ChangeEvent } from "react";
import type { I18nKey } from "@/ui/i18n";
import type { PortfolioExposure } from "@/ui/positions";
import { formatMoney } from "@/ui/format";
import { PanelSection } from "@/ui/components/layout/PanelSection";

export function PortfolioPositionsSection({
  positionsInput,
  exposure,
  parseErrors,
  t,
  palette,
  onPositionsInputChange,
  onFileUpload,
}: {
  positionsInput: string;
  exposure: PortfolioExposure;
  parseErrors: string[];
  t: (key: I18nKey) => string;
  palette: { up: string; down: string; neutral: string; accent: string };
  onPositionsInputChange: (value: string) => void;
  onFileUpload: (file: File) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onPositionsInputChange(event.target.value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onFileUpload(file);
    event.target.value = "";
  };

  return (
    <PanelSection
      title={t("positionsTitle")}
      description={t("dataWorkspaceDesc")}
      className="data-panel"
      bodyClassName="positions-panel-content"
    >
      <div className="positions-layout">
        <article className="card positions-editor">
          <label className="field-stack">
            <span>{t("positionsTitle")}</span>
            <textarea
              className="positions-textarea"
              value={positionsInput}
              onChange={handleChange}
              placeholder={t("positionsPlaceholder")}
            />
          </label>
          <div className="positions-actions">
            <label className="button-like upload-control" style={{ borderColor: palette.accent }}>
              <input type="file" accept=".csv,text/csv,.txt" onChange={handleFileChange} hidden />
              {t("uploadCsv")}
            </label>
          </div>
        </article>

        <article className="card positions-summary">
          <div className="overview-grid positions-overview-grid">
            <article className="card overview-card">
              <span>{t("notional")}</span>
              <strong>{formatMoney(exposure.marketValue)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("unmatchedSymbols")}</span>
              <strong>{exposure.unmatchedSymbols.length}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("parseErrors")}</span>
              <strong>{parseErrors.length}</strong>
            </article>
          </div>

          <div className="positions-meta">
            <div className="meta-block">
              <span>{t("unmatchedSymbols")}</span>
              <strong>
                {exposure.unmatchedSymbols.length > 0
                  ? exposure.unmatchedSymbols.join(", ")
                  : "None"}
              </strong>
            </div>
            <div className="meta-block">
              <span>{t("parseErrors")}</span>
              <strong>{parseErrors.length > 0 ? parseErrors.join(" | ") : "None"}</strong>
            </div>
          </div>
        </article>
      </div>
    </PanelSection>
  );
}
