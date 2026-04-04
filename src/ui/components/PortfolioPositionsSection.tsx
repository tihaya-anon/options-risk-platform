import type { ChangeEvent } from "react";
import type { I18nKey } from "../i18n";
import type { PortfolioExposure } from "../positions";

export function PortfolioPositionsSection({
  positionsInput,
  exposure,
  parseErrors,
  t,
  palette,
  onPositionsInputChange,
}: {
  positionsInput: string;
  exposure: PortfolioExposure;
  parseErrors: string[];
  t: (key: I18nKey) => string;
  palette: { up: string; down: string; neutral: string; accent: string };
  onPositionsInputChange: (value: string) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onPositionsInputChange(event.target.value);
  };

  const metrics = [
    { label: t("portfolioDelta"), value: exposure.netDelta, color: palette.up },
    { label: t("portfolioGamma"), value: exposure.netGamma, color: palette.neutral },
    { label: t("portfolioVega"), value: exposure.netVega, color: palette.down },
    { label: t("portfolioTheta"), value: exposure.netTheta, color: palette.accent },
  ];

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("positionsTitle")}</h2>
          <p>{t("positionsDesc")}</p>
        </div>
      </div>

      <div className="positions-layout">
        <article className="card positions-editor">
          <label className="toolbar-field">
            <span>{t("positionsTitle")}</span>
            <textarea
              className="positions-textarea"
              value={positionsInput}
              onChange={handleChange}
              placeholder={t("positionsPlaceholder")}
            />
          </label>
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
    </section>
  );
}
