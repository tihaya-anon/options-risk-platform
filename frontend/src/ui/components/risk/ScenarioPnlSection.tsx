import type { I18nKey } from "@/ui/i18n";
import type { EChartsOption } from "echarts";
import type { ScenarioPoint } from "@/ui/positions";
import type { ChartTheme } from "@/ui/chartTheme";
import {
  buildBaseChartOption,
  buildCategoryAxis,
  buildMoneyTooltipFormatter,
  buildValueAxis,
} from "@/ui/chartOptions";
import { EChart } from "@/ui/components/shared/EChart";
import { PanelSection } from "@/ui/components/layout/PanelSection";

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
      valueFormatter: buildMoneyTooltipFormatter(),
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
