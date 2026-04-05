import type { EnrichedOptionQuote } from "../../types";
import type { EChartsOption } from "echarts";
import { averageIv, groupByExpiry } from "../format";
import type { I18nKey } from "../i18n";
import type { ChartTheme } from "../chartTheme";
import { EChart } from "./EChart";

export function TermStructureSection({
  rows,
  upColor,
  downColor,
  chartTheme,
  t,
}: {
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  chartTheme: ChartTheme;
  t: (key: I18nKey) => string;
}) {
  const expiries = [...new Set(rows.map((row) => row.expiry))].sort();
  const grouped = groupByExpiry(rows);
  const callSeries = expiries.map((expiry) => averageIv(grouped.get(expiry) ?? [], "call"));
  const putSeries = expiries.map((expiry) => averageIv(grouped.get(expiry) ?? [], "put"));

  const option: EChartsOption = {
    backgroundColor: "transparent",
    animation: false,
    grid: { top: 28, right: 18, bottom: 34, left: 52 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? `${(value * 100).toFixed(2)}%` : String(value ?? ""),
    },
    legend: {
      top: 0,
      textStyle: { color: chartTheme.textColor },
      data: [t("callIv"), t("putIv")],
    },
    xAxis: {
      type: "category",
      data: expiries,
      axisLabel: {
        color: chartTheme.subtleTextColor,
        formatter: (value: string) => value.slice(5),
      },
      axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: chartTheme.subtleTextColor,
        formatter: (value: number) => `${(value * 100).toFixed(0)}%`,
      },
      splitLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    series: [
      {
        name: t("callIv"),
        type: "line",
        smooth: true,
        data: callSeries,
        lineStyle: { color: upColor, width: 3 },
        itemStyle: { color: upColor },
      },
      {
        name: t("putIv"),
        type: "line",
        smooth: true,
        data: putSeries,
        lineStyle: { color: downColor, width: 3 },
        itemStyle: { color: downColor },
      },
    ],
  };

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("termTitle")}</h2>
          <p>{t("termDesc")}</p>
        </div>
        <div className="legend">
          <span><i className="legend-swatch" style={{ background: upColor }} />{t("callIv")}</span>
          <span><i className="legend-swatch" style={{ background: downColor }} />{t("putIv")}</span>
        </div>
      </div>
      <article className="surface-card card">
        {rows.length === 0 ? (
          <div className="empty-state">No chart data available.</div>
        ) : (
          <EChart option={option} height={340} />
        )}
      </article>
    </section>
  );
}
