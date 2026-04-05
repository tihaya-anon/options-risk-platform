import type { I18nKey } from "../i18n";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "../chartTheme";
import { buildBaseChartOption } from "../chartOptions";
import { formatNumber } from "../format";
import type { GroupByMode, GroupedExposure } from "../positions";
import { EChart } from "./EChart";
import { GreekMetricCard } from "./GreekMetricCard";
import { PanelSection } from "./PanelSection";
import { SelectField } from "./SelectField";

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
    ...buildBaseChartOption({
      chartTheme,
      grid: { top: 16, right: 18, bottom: 24, left: 120 },
    }),
    tooltip: {
      ...buildBaseChartOption({ chartTheme }).tooltip,
      axisPointer: { type: "shadow" },
    },
    xAxis: {
      type: "value",
      axisLabel: { color: chartTheme.subtleTextColor },
      splitLine: { lineStyle: { color: chartTheme.gridLineColor } },
      axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
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
    <PanelSection
      title={t("groupedExposureTitle")}
      description={t("groupedExposureDesc")}
      actions={
        <label className="field-stack grouped-select">
          <span>{t("groupBy")}</span>
          <SelectField
            value={groupByMode}
            onChange={onGroupByModeChange}
            options={[
              { value: "symbol", label: t("groupBySymbol") },
              { value: "expiry", label: t("groupByExpiry") },
              { value: "optionType", label: t("groupByOptionType") },
              { value: "symbolExpiry", label: t("groupBySymbolExpiry") },
              { value: "full", label: t("groupByFull") },
            ]}
          />
        </label>
      }
    >
      <div className="grouped-exposure-grid">
        <article className="card grouped-exposure-card">
          {groups.length === 0 ? (
            <div className="empty-state">No chart data available.</div>
          ) : (
            <EChart option={option} height={Math.max(260, groups.length * 56)} />
          )}
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
            </div>
            <div className="greek-mini-grid">
              <GreekMetricCard greek="delta" value={formatNumber(group.netDelta, 2)} t={t} />
              <GreekMetricCard greek="gamma" value={formatNumber(group.netGamma, 2)} t={t} />
              <GreekMetricCard greek="vega" value={formatNumber(group.netVega, 2)} t={t} />
              <GreekMetricCard greek="theta" value={formatNumber(group.netTheta, 2)} t={t} />
            </div>
          </article>
        ))}
      </div>
    </PanelSection>
  );
}
