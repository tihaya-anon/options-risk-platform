import type { EChartsOption } from "echarts";
import type { ChartTheme } from "./chartTheme";
import { formatMoney, formatNumber } from "./format";

export function buildBaseChartOption({
  chartTheme,
  grid = { top: 24, right: 18, bottom: 34, left: 56 },
  legend,
}: {
  chartTheme: ChartTheme;
  grid?: EChartsOption["grid"];
  legend?: EChartsOption["legend"];
}): EChartsOption {
  return {
    backgroundColor: "transparent",
    animation: false,
    grid,
    tooltip: {
      trigger: "axis",
      backgroundColor: chartTheme.surfaceColor,
      borderColor: chartTheme.gridLineColor,
      textStyle: { color: chartTheme.textColor },
    },
    legend,
  };
}

export function buildMoneyTooltipFormatter(digits = 2) {
  return (value: unknown) =>
    typeof value === "number" ? formatMoney(Number(value.toFixed(digits))) : String(value ?? "");
}

export function buildNumberTooltipFormatter(digits = 2) {
  return (value: unknown) =>
    typeof value === "number" ? formatNumber(value, digits) : String(value ?? "");
}

export function buildCategoryAxis({
  data,
  chartTheme,
  name,
  formatter,
}: {
  data: Array<string | number>;
  chartTheme: ChartTheme;
  name?: string;
  formatter?: (value: string | number) => string;
}): EChartsOption["xAxis"] {
  return {
    type: "category",
    data,
    name,
    nameLocation: name ? "middle" : undefined,
    nameGap: name ? 28 : undefined,
    nameTextStyle: { color: chartTheme.subtleTextColor },
    axisLabel: {
      color: chartTheme.subtleTextColor,
      formatter,
    },
    axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
  };
}

export function buildValueAxis({
  chartTheme,
  name,
  formatter,
}: {
  chartTheme: ChartTheme;
  name?: string;
  formatter?: (value: number) => string;
}): EChartsOption["yAxis"] {
  return {
    type: "value",
    name,
    nameTextStyle: { color: chartTheme.subtleTextColor },
    axisLabel: {
      color: chartTheme.subtleTextColor,
      formatter,
    },
    splitLine: { lineStyle: { color: chartTheme.gridLineColor } },
    axisLine: { lineStyle: { color: chartTheme.gridLineColor } },
  };
}
