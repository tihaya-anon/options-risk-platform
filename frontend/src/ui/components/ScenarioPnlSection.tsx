import type { I18nKey } from "../i18n";
import type { EChartsOption } from "echarts";
import type { ScenarioPoint } from "../positions";
import type { ChartTheme } from "../chartTheme";
import { buildBaseChartOption, buildCategoryAxis, buildValueAxis } from "../chartOptions";
import { EChart } from "./EChart";
import { PanelSection } from "./PanelSection";

export function ScenarioPnlSection({
  scenarios,
  t,
  accentColor,
  neutralColor,
  chartTheme,
}: {
  scenarios: ScenarioPoint[];
  t: (key: I18nKey) => string;
  accentColor: string;
  neutralColor: string;
  chartTheme: ChartTheme;
}) {
  const option: EChartsOption = {
    ...buildBaseChartOption({
      chartTheme,
      grid: { top: 24, right: 18, bottom: 34, left: 60 },
    }),
    tooltip: {
      ...buildBaseChartOption({ chartTheme }).tooltip,
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? value.toFixed(2) : String(value ?? ""),
    },
    xAxis: buildCategoryAxis({
      data: scenarios.map((scenario) => `${(scenario.spotChangePct * 100).toFixed(0)}%`),
      chartTheme,
      name: t("spotChange"),
    }),
    yAxis: buildValueAxis({
      chartTheme,
      name: t("portfolioPnl"),
    }),
    series: [
      {
        name: t("portfolioPnl"),
        type: "line",
        data: scenarios.map((scenario) => scenario.portfolioPnl),
        lineStyle: { color: accentColor, width: 3 },
        itemStyle: { color: accentColor },
        showSymbol: true,
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
    <PanelSection title={t("scenarioTitle")} description={t("scenarioDesc")}>
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
