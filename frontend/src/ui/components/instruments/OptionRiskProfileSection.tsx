import type { EChartsOption } from "echarts";
import type { EnrichedOptionQuote } from "@/types";
import type { ChartTheme } from "@/ui/chartTheme";
import {
  buildBaseChartOption,
  buildCategoryAxis,
  buildMoneyTooltipFormatter,
  buildValueAxis,
} from "@/ui/chartOptions";
import { formatNumber, formatPercent, formatPrice, formatQuantity, formatStrike } from "@/ui/format";
import type { I18nKey } from "@/ui/i18n";
import { GreekMetricCard } from "@/ui/components/shared/GreekMetricCard";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { SelectField } from "@/ui/components/shared/SelectField";
import { EChart } from "@/ui/components/shared/EChart";
import { Link } from "react-router-dom";

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
  const sortedRows = rows.slice().sort(
    (left, right) =>
      left.expiry.localeCompare(right.expiry) ||
      left.optionType.localeCompare(right.optionType) ||
      left.strike - right.strike,
  );
  const expiries = [...new Set(sortedRows.map((row) => row.expiry))];
  const [firstRow] = sortedRows;
  const selectedRow =
    sortedRows.find((row) => row.symbol === selectedSymbol) ?? firstRow ?? null;
  const selectedExpiry = selectedRow?.expiry ?? expiries[0] ?? "";
  const expiryRows = sortedRows.filter((row) => row.expiry === selectedExpiry);
  const optionTypes = [...new Set(expiryRows.map((row) => row.optionType))];
  const selectedOptionType = selectedRow?.optionType ?? optionTypes[0] ?? "call";
  const typeRows = expiryRows.filter((row) => row.optionType === selectedOptionType);
  const strikeOptions = typeRows.map((row) => formatStrike(row.strike));

  const scenarioPoints = selectedRow ? buildScenarioSeries(selectedRow) : [];

  const option: EChartsOption = {
    ...buildBaseChartOption({
      chartTheme,
      grid: { top: 24, right: 18, bottom: 34, left: 52 },
    }),
    tooltip: {
      ...buildBaseChartOption({ chartTheme }).tooltip,
      valueFormatter: buildMoneyTooltipFormatter(),
    },
    xAxis: buildCategoryAxis({
      data: scenarioPoints.map((point) => `${(point.shock * 100).toFixed(0)}%`),
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
        smooth: true,
        data: scenarioPoints.map((point) => point.pnl),
        lineStyle: { color: accentColor, width: 3 },
        itemStyle: { color: accentColor },
        showSymbol: true,
      },
    ],
  };

  const greekCards = [
    { symbol: "Δ", name: t("deltaName"), value: formatNumber(selectedRow?.delta ?? null, 3) },
    { symbol: "Γ", name: t("gammaName"), value: formatNumber(selectedRow?.gamma ?? null, 4) },
    { symbol: "V", name: t("vegaName"), value: formatNumber(selectedRow?.vega ?? null, 3) },
    { symbol: "Θ", name: t("thetaName"), value: formatNumber(selectedRow?.theta ?? null, 3) },
  ];

  return (
    <PanelSection
      title={t("optionRiskProfileTitle")}
      description={t("optionRiskProfileDesc")}
      bodyClassName="risk-map-panel-content"
      actions={
        <div className="profile-filters">
          <label className="field-stack grouped-select">
            <span>{t("groupByExpiry")}</span>
            <SelectField
              value={selectedExpiry}
              onChange={(expiry) => {
                const nextRow = sortedRows.find((row) => row.expiry === expiry);
                if (nextRow) onSelectSymbol(nextRow.symbol);
              }}
              options={expiries.map((expiry) => ({
                value: expiry,
                label: expiry,
              }))}
            />
          </label>
          <label className="field-stack grouped-select">
            <span>{t("groupByOptionType")}</span>
            <SelectField
              value={selectedOptionType}
              onChange={(optionType) => {
                const nextRow = expiryRows.find((row) => row.optionType === optionType);
                if (nextRow) onSelectSymbol(nextRow.symbol);
              }}
              options={optionTypes.map((optionType) => ({
                value: optionType,
                label: optionType.toUpperCase(),
              }))}
            />
          </label>
          <label className="field-stack grouped-select">
            <span>{t("strike")}</span>
            <SelectField
              value={selectedRow ? formatStrike(selectedRow.strike) : ""}
              onChange={(strikeValue) => {
                const nextRow = typeRows.find((row) => formatStrike(row.strike) === strikeValue);
                if (nextRow) onSelectSymbol(nextRow.symbol);
              }}
              options={strikeOptions.map((strike) => ({
                value: strike,
                label: strike,
              }))}
            />
          </label>
          <Link className="button-like dashboard-link" to="/chain">
            {t("dashboardOpenChain")}
          </Link>
        </div>
      }
    >
      {!selectedRow ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <>
          <div className="overview-grid">
            <article className="card overview-card">
              <span>{t("strike")}</span>
              <strong>{formatStrike(selectedRow.strike)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("impliedVolatility")}</span>
              <strong>{formatPercent(selectedRow.impliedVol)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("mid")}</span>
              <strong>{formatPrice(selectedRow.mid)}</strong>
            </article>
            <article className="card overview-card">
              <span>{t("oi")}</span>
              <strong>{formatQuantity(selectedRow.openInterest)}</strong>
            </article>
          </div>

          <div className="metrics-grid">
            {greekCards.map((greek) => (
              <GreekMetricCard
                key={greek.symbol}
                greek={
                  greek.symbol === "Δ"
                    ? "delta"
                    : greek.symbol === "Γ"
                      ? "gamma"
                      : greek.symbol === "V"
                        ? "vega"
                        : "theta"
                }
                value={greek.value}
                t={t}
              />
            ))}
          </div>

          <article className="surface-card card">
            <EChart option={option} height={320} />
          </article>
        </>
      )}
    </PanelSection>
  );
}
