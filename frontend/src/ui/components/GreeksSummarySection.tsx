import type { I18nKey } from "../i18n";
import { formatNumber } from "../format";
import { GreekMetricCard } from "./GreekMetricCard";
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
    { key: "delta" as const, label: t("netDelta"), value: summary.netDelta, color: palette.up },
    { key: "gamma" as const, label: t("netGamma"), value: summary.netGamma, color: palette.neutral },
    { key: "vega" as const, label: t("netVega"), value: summary.netVega, color: palette.down },
    { key: "theta" as const, label: t("netTheta"), value: summary.netTheta, color: palette.accent },
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
            <GreekMetricCard
              key={metric.label}
              greek={metric.key}
              label={metric.label}
              value={formatNumber(metric.value, 2)}
              accentColor={metric.color}
              t={t}
              showTrack
              trackWidthPct={width}
            />
          );
        })}
      </div>
    </PanelSection>
  );
}
