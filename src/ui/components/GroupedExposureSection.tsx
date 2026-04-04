import type { I18nKey } from "../i18n";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "../chartTheme";
import type { GroupByMode, GroupedExposure } from "../positions";
import { EChart } from "./EChart";

export function GroupedExposureSection({
  groups,
  groupByMode,
  t,
  chartTheme,
  onGroupByModeChange,
}: {
  groups: GroupedExposure[];
  groupByMode: GroupByMode;
  t: (key: I18nKey) => string;
  chartTheme: ChartTheme;
  onGroupByModeChange: (mode: GroupByMode) => void;
}) {
  const option: EChartsOption = {
    backgroundColor: "transparent",
    animation: false,
    grid: { top: 16, right: 18, bottom: 24, left: 120 },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "value",
      axisLabel: { color: chartTheme.subtleTextColor },
      splitLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    yAxis: {
      type: "category",
      data: groups.map((group) => group.bucket),
      axisLabel: {
        color: chartTheme.subtleTextColor,
        width: 160,
        overflow: "truncate",
      },
      axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
    },
    series: [
      {
        name: t("portfolioVega"),
        type: "bar",
        data: groups.map((group) => group.netVega),
        itemStyle: {
          color: (params: { value?: unknown }) =>
            typeof params.value === "number" && params.value >= 0
              ? "#a44716"
              : "#2563eb",
          borderRadius: [0, 6, 6, 0],
        },
      },
    ],
  };

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("groupedExposureTitle")}</h2>
          <p>{t("groupedExposureDesc")}</p>
        </div>
        <label className="toolbar-field grouped-select">
          <span>{t("groupBy")}</span>
          <select
            value={groupByMode}
            onChange={(event) => onGroupByModeChange(event.target.value as GroupByMode)}
          >
            <option value="symbol">{t("groupBySymbol")}</option>
            <option value="expiry">{t("groupByExpiry")}</option>
            <option value="optionType">{t("groupByOptionType")}</option>
            <option value="symbolExpiry">{t("groupBySymbolExpiry")}</option>
            <option value="full">{t("groupByFull")}</option>
          </select>
        </label>
      </div>

      <div className="grouped-exposure-grid">
        <article className="card grouped-exposure-card">
          <EChart option={option} height={Math.max(260, groups.length * 56)} />
        </article>
        {groups.map((group) => (
          <article key={group.bucket} className="card grouped-exposure-card">
            <div className="meta-block">
              <span>{t("bucket")}</span>
              <strong>{group.bucket}</strong>
            </div>
            <div className="grouped-stats">
              <div><span>{t("quantity")}</span><strong>{group.quantity}</strong></div>
              <div><span>{t("marketValue")}</span><strong>{group.marketValue.toFixed(2)}</strong></div>
              <div><span>{t("portfolioDelta")}</span><strong>{group.netDelta.toFixed(2)}</strong></div>
              <div><span>{t("portfolioGamma")}</span><strong>{group.netGamma.toFixed(2)}</strong></div>
              <div><span>{t("portfolioVega")}</span><strong>{group.netVega.toFixed(2)}</strong></div>
              <div><span>{t("portfolioTheta")}</span><strong>{group.netTheta.toFixed(2)}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
