import type { OptionRight } from "@/types";
import { averageIv, groupByExpiry, linePath } from "@/ui/format";
import type { EnrichedOptionQuote } from "@/types";

export function SparkLine({
  rows,
  optionType,
  color,
}: {
  rows: EnrichedOptionQuote[];
  optionType: OptionRight;
  color: string;
}) {
  const expiries = [...new Set(rows.map((row) => row.expiry))].sort();
  const grouped = groupByExpiry(rows);
  const series = expiries.map((expiry, index) => ({
    expiry,
    index,
    value: averageIv(grouped.get(expiry) ?? [], optionType),
  }));

  const values = series
    .map((row) => row.value)
    .filter((value): value is number => value !== null);

  if (values.length === 0) return <div className="empty-state">No data</div>;

  const width = 640;
  const height = 220;
  const pad = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xStep = expiries.length > 1 ? (width - pad * 2) / (expiries.length - 1) : 0;
  const toY = (value: number) =>
    height - pad - ((value - min) / Math.max(max - min, 0.0001)) * (height - pad * 2);

  const path = linePath(
    series
      .filter((row) => row.value !== null)
      .map((row) => ({ x: pad + row.index * xStep, y: toY(row.value ?? min) }))
  );

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="chart-axis" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} className="chart-axis" />
        <path d={path} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {series
          .filter((row) => row.value !== null)
          .map((row) => (
            <circle
              key={`${optionType}-${row.expiry}`}
              cx={pad + row.index * xStep}
              cy={toY(row.value ?? min)}
              r="5"
              fill={color}
              className="chart-dot"
            />
          ))}
      </svg>
      <div className="chart-axis-wrap">
        {series.map((row) => (
          <div key={row.expiry} className="chart-axis-label" style={{ left: `${pad + row.index * xStep}px` }}>
            {row.expiry.slice(5)}
          </div>
        ))}
      </div>
    </div>
  );
}
