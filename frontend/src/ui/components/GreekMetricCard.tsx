import type { I18nKey } from "../i18n";

const GREEK_META: Record<
  "delta" | "gamma" | "vega" | "theta",
  { symbol: string; nameKey: I18nKey }
> = {
  delta: { symbol: "Δ", nameKey: "deltaName" },
  gamma: { symbol: "Γ", nameKey: "gammaName" },
  vega: { symbol: "V", nameKey: "vegaName" },
  theta: { symbol: "Θ", nameKey: "thetaName" },
};

export function GreekMetricCard({
  greek,
  value,
  label,
  accentColor,
  t,
  showTrack = false,
  trackWidthPct = 100,
}: {
  greek: "delta" | "gamma" | "vega" | "theta";
  value: string;
  label?: string;
  accentColor?: string;
  t: (key: I18nKey) => string;
  showTrack?: boolean;
  trackWidthPct?: number;
}) {
  const meta = GREEK_META[greek];

  return (
    <article className="greek-bar-card card">
      <div className="greek-bar-head greek-card-head">
        <div className="greek-identity">
          <strong className="greek-symbol">{meta.symbol}</strong>
          <span className="greek-name">{t(meta.nameKey)}</span>
          {label ? <span className="greek-label">{label}</span> : null}
        </div>
        <strong>{value}</strong>
      </div>
      {showTrack ? (
        <div className="greek-track">
          <div
            className="greek-fill"
            style={{ width: `${trackWidthPct}%`, background: accentColor }}
          />
        </div>
      ) : null}
    </article>
  );
}
