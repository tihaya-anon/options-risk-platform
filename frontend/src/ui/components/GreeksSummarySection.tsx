import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";

export function GreeksSummarySection({
  summary,
  palette,
  t,
}: {
  summary: { netDelta: number; netGamma: number; netVega: number; netTheta: number };
  palette: { up: string; down: string; neutral: string; accent: string };
  t: (key: I18nKey) => string;
}) {
  const maxAbs = Math.max(
    Math.abs(summary.netDelta),
    Math.abs(summary.netGamma),
    Math.abs(summary.netVega),
    Math.abs(summary.netTheta),
    1
  );

  const metrics = [
    { label: t("netDelta"), value: summary.netDelta, color: palette.up },
    { label: t("netGamma"), value: summary.netGamma, color: palette.neutral },
    { label: t("netVega"), value: summary.netVega, color: palette.down },
    { label: t("netTheta"), value: summary.netTheta, color: palette.accent },
  ];

  return (
    <PanelSection
      title={t("greeksSummaryTitle")}
      description={t("greeksSummaryDesc")}
    >
      <div className="metrics-grid">
        {metrics.map((metric) => {
          const width = (Math.abs(metric.value) / maxAbs) * 100;
          return (
            <article key={metric.label} className="greek-bar-card card">
              <div className="greek-bar-head">
                <span>{metric.label}</span>
                <strong>{metric.value.toFixed(2)}</strong>
              </div>
              <div className="greek-track">
                <div className="greek-fill" style={{ width: `${width}%`, background: metric.color }} />
              </div>
            </article>
          );
        })}
      </div>
    </PanelSection>
  );
}
