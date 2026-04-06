import type { EnrichedOptionQuote } from "@/types";
import type { EChartsOption } from "echarts";
import type { I18nKey } from "@/ui/i18n";
import type { ChartTheme } from "@/ui/chartTheme";
import { formatStrike } from "@/ui/format";
import { EChart } from "@/ui/components/shared/EChart";

export function SkewCard({
  underlying,
  expiry,
  rows,
  upColor,
  downColor,
  chartTheme,
  t,
}: {
  underlying: string;
  expiry: string;
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  chartTheme: ChartTheme;
  t: (key: I18nKey) => string;
}) {
  const strikes = [...new Set(rows.map((row) => row.strike))].sort((a, b) => a - b);
  const calls = strikes
    .map((strike) => rows.find((row) => row.strike === strike && row.optionType === "call"));
  const puts = strikes
    .map((strike) => rows.find((row) => row.strike === strike && row.optionType === "put"));
  const option: EChartsOption = {
    backgroundColor: "transparent",
    animation: false,
    grid: { top: 20, right: 14, bottom: 28, left: 52 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? `${(value * 100).toFixed(2)}%` : String(value ?? ""),
    },
    legend: {
      top: 0,
      textStyle: { color: chartTheme.textColor },
      data: [t("call"), t("put")],
    },
    xAxis: {
      type: "category",
      name: t("strike"),
      nameLocation: "middle",
      nameGap: 24,
      nameTextStyle: { color: chartTheme.subtleTextColor },
      data: strikes.map((strike) => formatStrike(strike)),
      axisLabel: { color: chartTheme.subtleTextColor },
      axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    yAxis: {
      type: "value",
      name: t("impliedVolatility"),
      nameTextStyle: { color: chartTheme.subtleTextColor },
      axisLabel: {
        color: chartTheme.subtleTextColor,
        formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
      },
      splitLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    series: [
      {
        name: t("call"),
        type: "line",
        smooth: true,
        data: calls.map((row) => row?.impliedVol ?? null),
        lineStyle: { color: upColor, width: 3 },
        itemStyle: { color: upColor },
      },
      {
        name: t("put"),
        type: "line",
        smooth: true,
        data: puts.map((row) => row?.impliedVol ?? null),
        lineStyle: { color: downColor, width: 3 },
        itemStyle: { color: downColor },
      },
    ],
  };

  return (
    <article className="surface-card card">
      <div className="surface-head">
        <h3>{underlying} · {expiry}</h3>
        <div className="legend">
          <span><i className="legend-swatch" style={{ background: upColor }} />{t("call")}</span>
          <span><i className="legend-swatch" style={{ background: downColor }} />{t("put")}</span>
        </div>
      </div>
      <EChart option={option} height={260} />
    </article>
  );
}
