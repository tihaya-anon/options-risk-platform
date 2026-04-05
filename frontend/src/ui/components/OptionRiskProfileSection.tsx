import type { EChartsOption } from "echarts";
import type { EnrichedOptionQuote } from "../../types";
import type { ChartTheme } from "../chartTheme";
import { formatNumber, formatPercent } from "../format";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import { SelectField } from "./SelectField";
import { EChart } from "./EChart";

function buildScenarioSeries(row: EnrichedOptionQuote) {
  const baseDelta = row.delta ?? 0;
  const baseGamma = row.gamma ?? 0;
  const baseVega = row.vega ?? 0;
  const baseTheta = row.theta ?? 0;

  return [-0.1, -0.05, 0, 0.05, 0.1].map((shock) => ({
    shock,
    pnl:
      baseDelta * shock * 100 +
      0.5 * baseGamma * shock * shock * 10000 +
      baseVega * Math.abs(shock) * 10 +
      baseTheta * 5,
  }));
}

export function OptionRiskProfileSection({
  rows,
  selectedSymbol,
  chartTheme,
  accentColor,
  t,
  onSelectSymbol,
}: {
  rows: EnrichedOptionQuote[];
  selectedSymbol: string;
  chartTheme: ChartTheme;
  accentColor: string;
  t: (key: I18nKey) => string;
  onSelectSymbol: (value: string) => void;
}) {
  const sortedRows = rows
    .slice()
    .sort(
      (left, right) =>
        left.expiry.localeCompare(right.expiry) ||
        left.strike - right.strike ||
        left.optionType.localeCompare(right.optionType),
    );

  const selectedRow =
    sortedRows.find((row) => row.symbol === selectedSymbol) ?? sortedRows[0] ?? null;

  const scenarioPoints = selectedRow ? buildScenarioSeries(selectedRow) : [];

  const option: EChartsOption = {
    backgroundColor: "transparent",
    animation: false,
    grid: { top: 24, right: 18, bottom: 34, left: 52 },
    tooltip: {
      trigger: "axis",
      valueFormatter: (value: unknown) =>
        typeof value === "number" ? value.toFixed(2) : String(value ?? ""),
    },
    xAxis: {
      type: "category",
      data: scenarioPoints.map((point) => `${(point.shock * 100).toFixed(0)}%`),
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
        smooth: true,
        data: scenarioPoints.map((point) => point.pnl),
        lineStyle: { color: accentColor, width: 3 },
        itemStyle: { color: accentColor },
      },
    ],
  };

  return (
    <PanelSection
      title={t("optionRiskProfileTitle")}
      description={t("optionRiskProfileDesc")}
      bodyClassName="risk-map-panel-content"
      actions={
        <label className="field-stack grouped-select">
          <span>{t("contractSelector")}</span>
          <SelectField
            value={selectedRow?.symbol ?? ""}
            onChange={onSelectSymbol}
            options={sortedRows.map((row) => ({
              value: row.symbol,
              label: `${row.expiry} | ${row.optionType.toUpperCase()} | ${row.strike.toFixed(0)}`,
            }))}
          />
        </label>
      }
    >
      {!selectedRow ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <>
          <div className="overview-grid">
            <article className="card overview-card">
              <span>{t("strike")}</span>
              <strong>{selectedRow.strike.toFixed(0)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("impliedVolatility")}</span>
              <strong>{formatPercent(selectedRow.impliedVol)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("mid")}</span>
              <strong>{selectedRow.mid.toFixed(2)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("oi")}</span>
              <strong>{selectedRow.openInterest}</strong>
            </article>
          </div>

          <div className="metrics-grid">
            <article className="greek-bar-card card">
              <div className="greek-bar-head">
                <span>{t("delta")}</span>
                <strong>{formatNumber(selectedRow.delta, 3)}</strong>
              </div>
            </article>
            <article className="greek-bar-card card">
              <div className="greek-bar-head">
                <span>{t("gamma")}</span>
                <strong>{formatNumber(selectedRow.gamma, 4)}</strong>
              </div>
            </article>
            <article className="greek-bar-card card">
              <div className="greek-bar-head">
                <span>{t("vega")}</span>
                <strong>{formatNumber(selectedRow.vega, 3)}</strong>
              </div>
            </article>
            <article className="greek-bar-card card">
              <div className="greek-bar-head">
                <span>{t("theta")}</span>
                <strong>{formatNumber(selectedRow.theta, 3)}</strong>
              </div>
            </article>
          </div>

          <article className="surface-card card">
            <EChart option={option} height={320} />
          </article>
        </>
      )}
    </PanelSection>
  );
}
