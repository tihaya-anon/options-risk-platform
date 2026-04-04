import type { EnrichedOptionQuote } from "../../types";
import { linePath } from "../format";
import type { I18nKey } from "../i18n";
import type { ChartTheme } from "../chartTheme";

export function SkewCard({
  expiry,
  rows,
  upColor,
  downColor,
  chartTheme,
  t,
}: {
  expiry: string;
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  chartTheme: ChartTheme;
  t: (key: I18nKey) => string;
}) {
  const chartWidth = 520;
  const chartHeight = 180;
  const pad = 18;
  const strikes = [...new Set(rows.map((row) => row.strike))].sort((a, b) => a - b);
  const calls = strikes
    .map((strike) => rows.find((row) => row.strike === strike && row.optionType === "call"))
    .filter((row): row is EnrichedOptionQuote => Boolean(row));
  const puts = strikes
    .map((strike) => rows.find((row) => row.strike === strike && row.optionType === "put"))
    .filter((row): row is EnrichedOptionQuote => Boolean(row));
  const ivValues = [...calls, ...puts]
    .map((row) => row.impliedVol)
    .filter((value): value is number => value !== null);
  const minIv = Math.min(...ivValues);
  const maxIv = Math.max(...ivValues);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const xFor = (strike: number) =>
    pad + ((strike - minStrike) / Math.max(maxStrike - minStrike, 1)) * (chartWidth - pad * 2);
  const yFor = (iv: number) =>
    chartHeight - pad - ((iv - minIv) / Math.max(maxIv - minIv, 0.0001)) * (chartHeight - pad * 2);

  const callPath = linePath(
    calls
      .filter((row) => row.impliedVol !== null)
      .map((row) => ({ x: xFor(row.strike), y: yFor(row.impliedVol ?? minIv) }))
  );
  const putPath = linePath(
    puts
      .filter((row) => row.impliedVol !== null)
      .map((row) => ({ x: xFor(row.strike), y: yFor(row.impliedVol ?? minIv) }))
  );

  return (
    <article className="surface-card card">
      <div className="surface-head">
        <h3>{expiry}</h3>
        <div className="legend">
          <span><i className="legend-swatch" style={{ background: upColor }} />{t("call")}</span>
          <span><i className="legend-swatch" style={{ background: downColor }} />{t("put")}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg" role="img">
        <line x1={pad} y1={chartHeight - pad} x2={chartWidth - pad} y2={chartHeight - pad} className="chart-axis" />
        <line x1={pad} y1={pad} x2={pad} y2={chartHeight - pad} className="chart-axis" />
        <text
          x="10"
          y={chartHeight / 2}
          transform={`rotate(-90 10 ${chartHeight / 2})`}
          className="chart-text"
          fill={chartTheme.subtleTextColor}
        >
          {t("impliedVolatility")}
        </text>
        <path d={callPath} fill="none" stroke={upColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={putPath} fill="none" stroke={downColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {strikes.map((strike) => (
          <text
            key={strike}
            x={xFor(strike)}
            y={chartHeight - 4}
            textAnchor="middle"
            className="chart-text"
            fill={chartTheme.subtleTextColor}
          >
            {strike.toFixed(0)}
          </text>
        ))}
      </svg>
    </article>
  );
}
