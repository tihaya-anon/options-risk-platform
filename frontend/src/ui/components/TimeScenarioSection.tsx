import type { EChartsOption } from "echarts";
import type { ChartTheme } from "../chartTheme";
import type { I18nKey } from "../i18n";
import type { TimeScenarioPoint } from "../positions";
import { EChart } from "./EChart";
import { PanelSection } from "./PanelSection";

export function TimeScenarioSection({
  scenarios,
  t,
  accentColor,
  neutralColor,
  chartTheme,
}: {
  scenarios: TimeScenarioPoint[];
  t: (key: I18nKey) => string;
  accentColor: string;
  neutralColor: string;
  chartTheme: ChartTheme;
}) {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    animation: false,
    grid: { top: 24, right: 18, bottom: 34, left: 60 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? value.toFixed(2) : String(value ?? ""),
    },
    xAxis: {
      type: "category",
      data: scenarios.map((scenario) => `${scenario.daysForward}d`),
      name: t("daysForward"),
      nameLocation: "middle",
      nameGap: 28,
      nameTextStyle: { color: chartTheme.subtleTextColor },
      axisLabel: { color: chartTheme.subtleTextColor },
      axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    yAxis: {
      type: "value",
      name: t("portfolioPnl"),
      nameTextStyle: { color: chartTheme.subtleTextColor },
      axisLabel: { color: chartTheme.subtleTextColor },
      splitLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    series: [
      {
        name: t("portfolioPnl"),
        type: "line",
        smooth: true,
        data: scenarios.map((scenario) => scenario.portfolioPnl),
        lineStyle: { color: accentColor, width: 3 },
        itemStyle: { color: accentColor },
        areaStyle: { color: `${accentColor}22` },
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: neutralColor, type: "dashed" },
          data: [{ yAxis: 0 }],
        },
      },
    ],
  };

  return (
    <PanelSection title={t("timeScenarioTitle")} description={t("timeScenarioDesc")}>
      <article className="surface-card card">
        {scenarios.length === 0 ? (
          <div className="empty-state">No chart data available.</div>
        ) : (
          <EChart option={option} height={340} />
        )}
      </article>
    </PanelSection>
  );
}
