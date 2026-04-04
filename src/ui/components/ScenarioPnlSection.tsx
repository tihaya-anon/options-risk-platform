import type { I18nKey } from "../i18n";
import type { EChartsOption } from "echarts";
import type { ScenarioPoint } from "../positions";
import type { ChartTheme } from "../chartTheme";
import { EChart } from "./EChart";

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
      data: scenarios.map((scenario) => `${(scenario.spotChangePct * 100).toFixed(0)}%`),
      name: t("spotChange"),
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
        data: scenarios.map((scenario) => scenario.portfolioPnl),
        lineStyle: { color: accentColor, width: 3 },
        itemStyle: { color: accentColor },
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
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("scenarioTitle")}</h2>
          <p>{t("scenarioDesc")}</p>
        </div>
      </div>

      <div className="scenario-layout">
        <article className="surface-card card">
          <EChart option={option} height={320} />
        </article>

        <article className="surface-card card scenario-grid">
          {scenarios.map((scenario) => (
            <div key={scenario.spotChangePct} className="scenario-row">
              <span>
                {t("spotChange")} {(scenario.spotChangePct * 100).toFixed(0)}%
              </span>
              <strong>
                {t("portfolioPnl")} {scenario.portfolioPnl.toFixed(2)}
              </strong>
            </div>
          ))}
        </article>
      </div>
    </section>
  );
}
