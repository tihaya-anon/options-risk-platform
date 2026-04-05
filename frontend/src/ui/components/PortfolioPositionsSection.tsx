import type { ChangeEvent } from "react";
import type { I18nKey } from "../i18n";
import type { PortfolioExposure } from "../positions";
import { PanelSection } from "./PanelSection";

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

  const metrics = [
    { label: t("portfolioDelta"), value: exposure.netDelta, color: palette.up },
    { label: t("portfolioGamma"), value: exposure.netGamma, color: palette.neutral },
    { label: t("portfolioVega"), value: exposure.netVega, color: palette.down },
    { label: t("portfolioTheta"), value: exposure.netTheta, color: palette.accent },
  ];

  return (
    <PanelSection
      title={t("positionsTitle")}
      description={t("positionsDesc")}
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
          <div className="metrics-grid">
            {metrics.map((metric) => (
              <article key={metric.label} className="greek-bar-card card">
                <div className="greek-bar-head">
                  <span>{metric.label}</span>
                  <strong>{metric.value.toFixed(2)}</strong>
                </div>
                <div className="greek-track">
                  <div className="greek-fill" style={{ width: "100%", background: metric.color }} />
                </div>
              </article>
            ))}
          </div>

          <div className="positions-meta">
            <div className="meta-row">
              <span>{t("notional")}</span>
              <strong>{exposure.marketValue.toFixed(2)}</strong>
            </div>
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
