import type { EnrichedOptionQuote, OptionRight } from "../types";

export function averageIv(
  rows: EnrichedOptionQuote[],
  optionType: OptionRight
): number | null {
  const filtered = rows.filter(
    (row) => row.optionType === optionType && row.impliedVol !== null
  );
  if (filtered.length === 0) return null;
  return (
    filtered.reduce((sum, row) => sum + (row.impliedVol ?? 0), 0) /
    filtered.length
  );
}

export function linePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

export function formatPercent(value: number | null): string {
  return value === null ? "n/a" : `${(value * 100).toFixed(2)}%`;
}

export function formatNumber(value: number | null, digits = 2): string {
  return value === null ? "n/a" : value.toFixed(digits);
}

export function groupByExpiry(
  rows: EnrichedOptionQuote[]
): Map<string, EnrichedOptionQuote[]> {
  const grouped = new Map<string, EnrichedOptionQuote[]>();
  for (const row of rows) {
    if (!grouped.has(row.expiry)) grouped.set(row.expiry, []);
    grouped.get(row.expiry)!.push(row);
  }
  return grouped;
}

export function calculateRiskSummary(rows: EnrichedOptionQuote[]) {
  return rows.reduce(
    (acc, row) => {
      acc.netDelta += row.delta ?? 0;
      acc.netGamma += row.gamma ?? 0;
      acc.netVega += row.vega ?? 0;
      acc.netTheta += row.theta ?? 0;
      return acc;
    },
    { netDelta: 0, netGamma: 0, netVega: 0, netTheta: 0 }
  );
}
