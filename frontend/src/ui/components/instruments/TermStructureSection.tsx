import type { EnrichedOptionQuote } from "@/types";
import type { EChartsOption } from "echarts";
import { averageIv, groupByExpiry } from "@/ui/format";
import type { I18nKey } from "@/ui/i18n";
import type { ChartTheme } from "@/ui/chartTheme";
import { buildBaseChartOption, buildCategoryAxis, buildValueAxis } from "@/ui/chartOptions";
import { EChart } from "@/ui/components/shared/EChart";
import { PanelSection } from "@/ui/components/layout/PanelSection";

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
    ...buildBaseChartOption({
      chartTheme,
      grid: { top: 28, right: 18, bottom: 34, left: 52 },
      legend: {
        top: 0,
        textStyle: { color: chartTheme.textColor },
        data: [t("callIv"), t("putIv")],
      },
    }),
    tooltip: {
      ...buildBaseChartOption({ chartTheme }).tooltip,
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? `${(value * 100).toFixed(2)}%` : String(value ?? ""),
    },
    xAxis: buildCategoryAxis({
      data: expiries,
      chartTheme,
      formatter: (value) => String(value).slice(5),
    }),
    yAxis: buildValueAxis({
      chartTheme,
      formatter: (value) => `${(value * 100).toFixed(0)}%`,
    }),
    series: [
      {
        name: t("callIv"),
        type: "line",
        smooth: true,
        data: callSeries,
        lineStyle: { color: upColor, width: 3 },
        itemStyle: { color: upColor },
        showSymbol: true,
      },
      {
        name: t("putIv"),
        type: "line",
        smooth: true,
        data: putSeries,
        lineStyle: { color: downColor, width: 3 },
        itemStyle: { color: downColor },
        showSymbol: true,
      },
    ],
  };

  return (
    <PanelSection
      title={t("termTitle")}
      description={t("termDesc")}
      actions={
        <div className="legend">
          <span><i className="legend-swatch" style={{ background: upColor }} />{t("callIv")}</span>
          <span><i className="legend-swatch" style={{ background: downColor }} />{t("putIv")}</span>
        </div>
      }
    >
      <article className="surface-card card">
        {rows.length === 0 ? (
          <div className="empty-state">No chart data available.</div>
        ) : (
          <EChart option={option} height={340} />
        )}
      </article>
    </PanelSection>
  );
}
