import type { I18nKey } from "@/ui/i18n";
import type { EChartsOption } from "echarts";
import type { ChartTheme } from "@/ui/chartTheme";
import { buildBaseChartOption } from "@/ui/chartOptions";
import { formatMoney, formatNumber, formatQuantity } from "@/ui/format";
import type { GroupByMode, GroupedExposure } from "@/ui/positions";
import { EChart } from "@/ui/components/shared/EChart";
import { GreekMetricCard } from "@/ui/components/shared/GreekMetricCard";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { SelectField } from "@/ui/components/shared/SelectField";

export function GroupedExposureSection({
  groups,
  groupByMode,
  selectedBucket,
  t,
  chartTheme,
  onGroupByModeChange,
}: {
  groups: GroupedExposure[];
  groupByMode: GroupByMode;
  selectedBucket?: string;
  t: (key: I18nKey) => string;
  chartTheme: ChartTheme;
  onGroupByModeChange: (mode: GroupByMode) => void;
}) {
  const displayGroups = groups.slice().sort((left, right) => {
    const splitLeft = left.bucket.split(" | ");
    const splitRight = right.bucket.split(" | ");

    if (groupByMode === "symbol") {
      return splitLeft[0].localeCompare(splitRight[0]);
    }
    if (groupByMode === "expiry") {
      return splitLeft[0].localeCompare(splitRight[0]);
    }
    if (groupByMode === "optionType") {
      const order = { underlying: 0, call: 1, put: 2 };
      return (order[splitLeft[0] as keyof typeof order] ?? 9) - (order[splitRight[0] as keyof typeof order] ?? 9);
    }
    if (groupByMode === "symbolExpiry") {
      return (
        (splitLeft[0] ?? "").localeCompare(splitRight[0] ?? "") ||
        (splitLeft[1] ?? "").localeCompare(splitRight[1] ?? "")
      );
    }

    return (
      (splitLeft[0] ?? "").localeCompare(splitRight[0] ?? "") ||
      (splitLeft[1] ?? "").localeCompare(splitRight[1] ?? "") ||
      (splitLeft[2] ?? "").localeCompare(splitRight[2] ?? "")
    );
  });

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
      data: displayGroups.map((group) => group.bucket),
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
        data: displayGroups.map((group) => ({
          value: group.netVega,
          itemStyle: {
            color: group.netVega >= 0 ? "#a44716" : "#2563eb",
            borderRadius: group.netVega < 0 ? [6, 0, 0, 6] : [0, 6, 6, 0],
          },
        })),
        itemStyle: {
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
        {displayGroups.map((group) => (
          <article
            key={group.bucket}
            className={`card grouped-exposure-card${selectedBucket === group.bucket ? " is-selected" : ""}`}
          >
            <div className="meta-block">
              <span>{t("bucket")}</span>
              <strong>{group.bucket}</strong>
            </div>
            <div className="grouped-stats">
              <div><span>{t("quantity")}</span><strong>{formatQuantity(group.quantity)}</strong></div>
              <div><span>{t("marketValue")}</span><strong>{formatMoney(group.marketValue)}</strong></div>
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
