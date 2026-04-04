import { useEffect, useMemo, useState } from "react";
import {
  App as AntApp,
  Card,
  ConfigProvider,
  Empty,
  Flex,
  Segmented,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from "antd";
import type { ThemeConfig } from "antd";
import { blackScholesModel } from "../lib/bs";
import { enrichSnapshot } from "../lib/enrich";
import type { EnrichedOptionQuote, OptionRight, OptionSnapshotFile } from "../types";

const { Title, Paragraph, Text } = Typography;

type Language = "en" | "zh";
type ThemeMode = "light" | "dark";
type Palette = "us" | "cn" | "amber";

type I18nKey =
  | "appEyebrow"
  | "appTitle"
  | "appLede"
  | "underlying"
  | "spot"
  | "snapshot"
  | "model"
  | "theme"
  | "language"
  | "palette"
  | "light"
  | "dark"
  | "english"
  | "chinese"
  | "greeksSummaryTitle"
  | "greeksSummaryDesc"
  | "netDelta"
  | "netGamma"
  | "netVega"
  | "netTheta"
  | "termTitle"
  | "termDesc"
  | "callIv"
  | "putIv"
  | "skewTitle"
  | "skewDesc"
  | "chainTitle"
  | "chainDesc"
  | "strike"
  | "expiry"
  | "mid"
  | "delta"
  | "gamma"
  | "vega"
  | "theta"
  | "oi"
  | "loading"
  | "failedLoad"
  | "call"
  | "put"
  | "paletteUs"
  | "paletteCn"
  | "paletteAmber";

const translations: Record<Language, Record<I18nKey, string>> = {
  en: {
    appEyebrow: "Static Options Risk Platform",
    appTitle: "Option Risk Should Read Like a Control Panel, Not a Spreadsheet.",
    appLede:
      "A static TypeScript dashboard with pluggable implied-volatility modeling. Today it uses Black-Scholes. Tomorrow it can swap models without rewriting the UI contract.",
    underlying: "Underlying",
    spot: "Spot",
    snapshot: "Snapshot",
    model: "Model",
    theme: "Theme",
    language: "Language",
    palette: "Palette",
    light: "Light",
    dark: "Dark",
    english: "English",
    chinese: "中文",
    greeksSummaryTitle: "Greeks Risk Snapshot",
    greeksSummaryDesc: "Quote-level aggregation to show the platform shape. Real portfolio mode would aggregate actual positions.",
    netDelta: "Net Delta",
    netGamma: "Net Gamma",
    netVega: "Net Vega",
    netTheta: "Net Theta",
    termTitle: "IV Term Structure",
    termDesc: "Average implied volatility by expiry. This should be a first-class visual, not a table lookup.",
    callIv: "Call IV",
    putIv: "Put IV",
    skewTitle: "Skew by Expiry",
    skewDesc: "Strike versus implied volatility for each expiry. This is closer to how traders actually read the chain.",
    chainTitle: "Chain Cards",
    chainDesc: "Compact cards for scanning strikes, IV, Greeks, and open interest without falling back to a spreadsheet grid.",
    strike: "Strike",
    expiry: "Expiry",
    mid: "Mid",
    delta: "Delta",
    gamma: "Gamma",
    vega: "Vega",
    theta: "Theta",
    oi: "OI",
    loading: "Loading option snapshot...",
    failedLoad: "Failed to load option snapshot",
    call: "Call",
    put: "Put",
    paletteUs: "US: green up / red down",
    paletteCn: "CN: red up / green down",
    paletteAmber: "Amber / blue neutral",
  },
  zh: {
    appEyebrow: "静态期权风险平台",
    appTitle: "期权风险界面应该像控制台，而不是电子表格。",
    appLede:
      "这是一个静态 TypeScript 风险面板，隐含波动率模型通过通用接口接入。当前先用 Black-Scholes，后续可替换而不重写前端契约。",
    underlying: "标的",
    spot: "现价",
    snapshot: "快照时间",
    model: "模型",
    theme: "主题",
    language: "语言",
    palette: "调色板",
    light: "日间",
    dark: "夜间",
    english: "English",
    chinese: "中文",
    greeksSummaryTitle: "Greeks 风险快照",
    greeksSummaryDesc: "当前先做链级别聚合，用于展示平台形态。真实组合模式应聚合实际持仓。",
    netDelta: "净 Delta",
    netGamma: "净 Gamma",
    netVega: "净 Vega",
    netTheta: "净 Theta",
    termTitle: "IV 期限结构",
    termDesc: "按到期日汇总平均隐含波动率。实际风控应优先看这种图，而不是先翻表格。",
    callIv: "Call IV",
    putIv: "Put IV",
    skewTitle: "按到期日查看 Skew",
    skewDesc: "横轴是行权价，纵轴是隐含波动率。这更接近交易者阅读期权链的真实方式。",
    chainTitle: "期权链卡片视图",
    chainDesc: "用紧凑卡片浏览行权价、IV、Greeks 和持仓兴趣度，避免退回到传统表格思维。",
    strike: "行权价",
    expiry: "到期日",
    mid: "中间价",
    delta: "Delta",
    gamma: "Gamma",
    vega: "Vega",
    theta: "Theta",
    oi: "持仓量",
    loading: "正在加载期权快照...",
    failedLoad: "期权快照加载失败",
    call: "看涨",
    put: "看跌",
    paletteUs: "海外：绿涨红跌",
    paletteCn: "内地：红涨绿跌",
    paletteAmber: "琥珀 / 蓝中性",
  },
};

const paletteTokens: Record<Palette, { up: string; down: string; neutral: string; accent: string }> = {
  us: { up: "#16a34a", down: "#dc2626", neutral: "#64748b", accent: "#ea580c" },
  cn: { up: "#dc2626", down: "#16a34a", neutral: "#64748b", accent: "#ea580c" },
  amber: { up: "#d97706", down: "#2563eb", neutral: "#6b7280", accent: "#7c3aed" },
};

function detectLanguage(): Language {
  const saved = localStorage.getItem("orp_language");
  if (saved === "en" || saved === "zh") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function detectTheme(): ThemeMode {
  const saved = localStorage.getItem("orp_theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function detectPalette(): Palette {
  const saved = localStorage.getItem("orp_palette");
  if (saved === "us" || saved === "cn" || saved === "amber") return saved;
  return "us";
}

function averageIv(rows: EnrichedOptionQuote[], optionType: OptionRight): number | null {
  const filtered = rows.filter((row) => row.optionType === optionType && row.impliedVol !== null);
  if (filtered.length === 0) return null;
  return filtered.reduce((sum, row) => sum + (row.impliedVol ?? 0), 0) / filtered.length;
}

function linePath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return "";
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function formatPercent(value: number | null): string {
  return value === null ? "n/a" : `${(value * 100).toFixed(2)}%`;
}

function formatNumber(value: number | null, digits = 2): string {
  return value === null ? "n/a" : value.toFixed(digits);
}

function groupByExpiry(rows: EnrichedOptionQuote[]): Map<string, EnrichedOptionQuote[]> {
  const grouped = new Map<string, EnrichedOptionQuote[]>();
  for (const row of rows) {
    if (!grouped.has(row.expiry)) grouped.set(row.expiry, []);
    grouped.get(row.expiry)!.push(row);
  }
  return grouped;
}

function riskSummary(rows: EnrichedOptionQuote[]) {
  return rows.reduce(
    (acc, row) => {
      acc.netDelta += row.delta ?? 0;
      acc.netGamma += row.gamma ?? 0;
      acc.netVega += row.vega ?? 0;
      acc.netTheta += row.theta ?? 0;
      return acc;
    },
    { netDelta: 0, netGamma: 0, netVega: 0, netTheta: 0 }
  );
}

function loadSnapshot(): Promise<OptionSnapshotFile> {
  return fetch("./data/latest.json", { cache: "no-store" }).then((response) => {
    if (!response.ok) throw new Error(`Failed to load option snapshot: ${response.status}`);
    return response.json() as Promise<OptionSnapshotFile>;
  });
}

function useSnapshot() {
  const [snapshot, setSnapshot] = useState<OptionSnapshotFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadSnapshot()
      .then((data) => {
        if (!active) return;
        setSnapshot(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      });
    return () => {
      active = false;
    };
  }, []);

  return { snapshot, error };
}

function SparkLine({
  rows,
  optionType,
  color,
}: {
  rows: EnrichedOptionQuote[];
  optionType: OptionRight;
  color: string;
}) {
  const expiries = [...new Set(rows.map((row) => row.expiry))].sort();
  const grouped = groupByExpiry(rows);
  const series = expiries.map((expiry, index) => ({
    value: averageIv(grouped.get(expiry) ?? [], optionType),
    index,
    expiry,
  }));
  const values = series.map((row) => row.value).filter((value): value is number => value !== null);
  if (values.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const width = 640;
  const height = 220;
  const pad = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xStep = expiries.length > 1 ? (width - pad * 2) / (expiries.length - 1) : 0;
  const toY = (value: number) => height - pad - ((value - min) / Math.max(max - min, 0.0001)) * (height - pad * 2);
  const path = linePath(
    series
      .filter((row) => row.value !== null)
      .map((row) => ({ x: pad + row.index * xStep, y: toY(row.value ?? min) }))
  );

  return (
    <div className="chart-shell">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg" role="img">
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} className="chart-axis" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} className="chart-axis" />
        <path d={path} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {series
          .filter((row) => row.value !== null)
          .map((row) => (
            <circle
              key={`${optionType}-${row.expiry}`}
              cx={pad + row.index * xStep}
              cy={toY(row.value ?? min)}
              r="5"
              fill={color}
              className="chart-dot"
            />
          ))}
      </svg>
      <div className="chart-axis-wrap">
        {series.map((row) => (
          <div key={row.expiry} className="chart-axis-label" style={{ left: `${pad + row.index * xStep}px` }}>
            {row.expiry.slice(5)}
          </div>
        ))}
      </div>
    </div>
  );
}

function SkewCard({
  expiry,
  rows,
  upColor,
  downColor,
  t,
}: {
  expiry: string;
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  t: (key: I18nKey) => string;
}) {
  const chartWidth = 520;
  const chartHeight = 180;
  const pad = 18;
  const strikes = [...new Set(rows.map((row) => row.strike))].sort((a, b) => a - b);
  const calls = strikes
    .map((strike) => rows.find((row) => row.strike === strike && row.optionType === "call"))
    .filter((row): row is EnrichedOptionQuote => Boolean(row));
  const puts = strikes
    .map((strike) => rows.find((row) => row.strike === strike && row.optionType === "put"))
    .filter((row): row is EnrichedOptionQuote => Boolean(row));
  const ivValues = [...calls, ...puts].map((row) => row.impliedVol).filter((value): value is number => value !== null);
  const minIv = Math.min(...ivValues);
  const maxIv = Math.max(...ivValues);
  const minStrike = Math.min(...strikes);
  const maxStrike = Math.max(...strikes);
  const xFor = (strike: number) => pad + ((strike - minStrike) / Math.max(maxStrike - minStrike, 1)) * (chartWidth - pad * 2);
  const yFor = (iv: number) => chartHeight - pad - ((iv - minIv) / Math.max(maxIv - minIv, 0.0001)) * (chartHeight - pad * 2);
  const callPath = linePath(calls.filter((row) => row.impliedVol !== null).map((row) => ({ x: xFor(row.strike), y: yFor(row.impliedVol ?? minIv) })));
  const putPath = linePath(puts.filter((row) => row.impliedVol !== null).map((row) => ({ x: xFor(row.strike), y: yFor(row.impliedVol ?? minIv) })));

  return (
    <Card className="surface-card">
      <Flex justify="space-between" align="center" style={{ marginBottom: 10 }}>
        <Title level={5} style={{ margin: 0 }}>
          {expiry}
        </Title>
        <Space size={12}>
          <Tag color={upColor}>{t("call")}</Tag>
          <Tag color={downColor}>{t("put")}</Tag>
        </Space>
      </Flex>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="chart-svg" role="img">
        <line x1={pad} y1={chartHeight - pad} x2={chartWidth - pad} y2={chartHeight - pad} className="chart-axis" />
        <line x1={pad} y1={pad} x2={pad} y2={chartHeight - pad} className="chart-axis" />
        <path d={callPath} fill="none" stroke={upColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d={putPath} fill="none" stroke={downColor} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        {strikes.map((strike) => (
          <text key={strike} x={xFor(strike)} y={chartHeight - 4} textAnchor="middle" className="chart-text">
            {strike.toFixed(0)}
          </text>
        ))}
      </svg>
    </Card>
  );
}

function QuoteCard({
  row,
  t,
  accentColor,
}: {
  row: EnrichedOptionQuote;
  t: (key: I18nKey) => string;
  accentColor: string;
}) {
  return (
    <Card className="quote-card" styles={{ body: { padding: 14, borderLeft: `4px solid ${accentColor}` } }}>
      <Flex justify="space-between" align="center">
        <Tag color={accentColor}>{row.optionType === "call" ? t("call") : t("put")}</Tag>
        <Text type="secondary">{row.expiry}</Text>
      </Flex>
      <Title level={4} style={{ marginTop: 12, marginBottom: 4 }}>
        {t("strike")} {row.strike.toFixed(0)}
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 12 }}>
        {t("mid")} {row.mid.toFixed(2)}
      </Paragraph>
      <div className="quote-stats">
        <div>
          <span>{row.optionType === "call" ? t("callIv") : t("putIv")}</span>
          <strong>{formatPercent(row.impliedVol)}</strong>
        </div>
        <div>
          <span>{t("delta")}</span>
          <strong>{formatNumber(row.delta, 3)}</strong>
        </div>
        <div>
          <span>{t("gamma")}</span>
          <strong>{formatNumber(row.gamma, 4)}</strong>
        </div>
        <div>
          <span>{t("vega")}</span>
          <strong>{formatNumber(row.vega, 3)}</strong>
        </div>
        <div>
          <span>{t("theta")}</span>
          <strong>{formatNumber(row.theta, 3)}</strong>
        </div>
        <div>
          <span>{t("oi")}</span>
          <strong>{row.openInterest}</strong>
        </div>
      </div>
    </Card>
  );
}

export function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(detectTheme);
  const [palette, setPalette] = useState<Palette>(detectPalette);
  const { snapshot, error } = useSnapshot();

  useEffect(() => {
    localStorage.setItem("orp_language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("orp_theme", themeMode);
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("orp_palette", palette);
  }, [palette]);

  const t = (key: I18nKey) => translations[language][key];
  const enriched = useMemo(() => (snapshot ? enrichSnapshot(snapshot, blackScholesModel) : []), [snapshot]);
  const summary = useMemo(() => riskSummary(enriched), [enriched]);
  const grouped = useMemo(() => groupByExpiry(enriched), [enriched]);
  const paletteToken = paletteTokens[palette];

  const antdTheme = useMemo<ThemeConfig>(
    () => ({
      token: {
        colorPrimary: paletteToken.accent,
        borderRadius: 18,
        colorBgBase: themeMode === "dark" ? "#11161c" : "#f4eee5",
        colorTextBase: themeMode === "dark" ? "#edf2f7" : "#1f1812",
        colorBgContainer: themeMode === "dark" ? "rgba(22,29,37,0.90)" : "rgba(255,251,246,0.90)",
      },
      components: {
        Card: {
          colorBorderSecondary: themeMode === "dark" ? "rgba(190,208,224,0.12)" : "rgba(62,43,28,0.14)",
        },
      },
      algorithm: themeMode === "dark" ? undefined : undefined,
    }),
    [paletteToken.accent, themeMode]
  );

  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <main className="page-shell">
          <Card className="hero">
            <div className="hero-copy">
              <p className="eyebrow">{t("appEyebrow")}</p>
              <Title>{t("appTitle")}</Title>
              <Paragraph className="lede">{t("appLede")}</Paragraph>
            </div>
            <div className="hero-panel">
              <Card className="toolbar">
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <Flex gap={12} wrap="wrap">
                    <div className="toolbar-field">
                      <Text type="secondary">{t("language")}</Text>
                      <Segmented
                        value={language}
                        onChange={(value) => setLanguage(value as Language)}
                        options={[
                          { label: t("english"), value: "en" },
                          { label: t("chinese"), value: "zh" },
                        ]}
                      />
                    </div>
                    <div className="toolbar-field">
                      <Text type="secondary">{t("theme")}</Text>
                      <Segmented
                        value={themeMode}
                        onChange={(value) => setThemeMode(value as ThemeMode)}
                        options={[
                          { label: t("light"), value: "light" },
                          { label: t("dark"), value: "dark" },
                        ]}
                      />
                    </div>
                  </Flex>
                  <div className="toolbar-field">
                    <Text type="secondary">{t("palette")}</Text>
                    <Select
                      value={palette}
                      onChange={(value) => setPalette(value)}
                      options={[
                        { label: t("paletteUs"), value: "us" },
                        { label: t("paletteCn"), value: "cn" },
                        { label: t("paletteAmber"), value: "amber" },
                      ]}
                    />
                  </div>
                </Space>
              </Card>

              {snapshot ? (
                <>
                  <Card className="metric">
                    <Statistic title={t("underlying")} value={snapshot.underlying.symbol} />
                  </Card>
                  <Card className="metric">
                    <Statistic title={t("spot")} value={snapshot.underlying.spot} precision={2} suffix={snapshot.underlying.currency} />
                  </Card>
                  <Card className="metric">
                    <Statistic title={t("snapshot")} value={new Date(snapshot.generatedAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")} />
                  </Card>
                  <Card className="metric">
                    <Statistic title={t("model")} value={blackScholesModel.name} />
                  </Card>
                </>
              ) : (
                <Card className="metric">
                  {error ? <Empty description={`${t("failedLoad")}: ${error}`} /> : <Spin tip={t("loading")} />}
                </Card>
              )}
            </div>
          </Card>

          {!snapshot ? null : (
            <>
              <Card className="panel">
                <Flex justify="space-between" align="end" gap={16} wrap="wrap" style={{ marginBottom: 16 }}>
                  <div>
                    <Title level={2}>{t("greeksSummaryTitle")}</Title>
                    <Paragraph>{t("greeksSummaryDesc")}</Paragraph>
                  </div>
                </Flex>
                <div className="metrics-grid">
                  {[
                    { label: t("netDelta"), value: summary.netDelta, color: paletteToken.up },
                    { label: t("netGamma"), value: summary.netGamma, color: paletteToken.neutral },
                    { label: t("netVega"), value: summary.netVega, color: paletteToken.down },
                    { label: t("netTheta"), value: summary.netTheta, color: paletteToken.accent },
                  ].map((item) => {
                    const maxAbs = Math.max(
                      Math.abs(summary.netDelta),
                      Math.abs(summary.netGamma),
                      Math.abs(summary.netVega),
                      Math.abs(summary.netTheta),
                      1
                    );
                    const width = (Math.abs(item.value) / maxAbs) * 100;
                    return (
                      <Card key={item.label} className="greek-bar-card">
                        <Flex justify="space-between" style={{ marginBottom: 12 }}>
                          <Text type="secondary">{item.label}</Text>
                          <Text strong>{item.value.toFixed(2)}</Text>
                        </Flex>
                        <div className="greek-track">
                          <div className="greek-fill" style={{ width: `${width}%`, background: item.color }} />
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </Card>

              <Card className="panel">
                <Flex justify="space-between" align="end" gap={16} wrap="wrap" style={{ marginBottom: 16 }}>
                  <div>
                    <Title level={2}>{t("termTitle")}</Title>
                    <Paragraph>{t("termDesc")}</Paragraph>
                  </div>
                  <Space size={12}>
                    <Tag color={paletteToken.up}>{t("callIv")}</Tag>
                    <Tag color={paletteToken.down}>{t("putIv")}</Tag>
                  </Space>
                </Flex>
                <div className="term-grid">
                  <Card className="surface-card">
                    <Text type="secondary">{t("callIv")}</Text>
                    <SparkLine rows={enriched} optionType="call" color={paletteToken.up} />
                  </Card>
                  <Card className="surface-card">
                    <Text type="secondary">{t("putIv")}</Text>
                    <SparkLine rows={enriched} optionType="put" color={paletteToken.down} />
                  </Card>
                </div>
              </Card>

              <Card className="panel">
                <div style={{ marginBottom: 16 }}>
                  <Title level={2}>{t("skewTitle")}</Title>
                  <Paragraph>{t("skewDesc")}</Paragraph>
                </div>
                <div className="surface-grid">
                  {[...grouped.entries()].map(([expiry, rows]) => (
                    <SkewCard key={expiry} expiry={expiry} rows={rows} upColor={paletteToken.up} downColor={paletteToken.down} t={t} />
                  ))}
                </div>
              </Card>

              <Card className="panel">
                <div style={{ marginBottom: 16 }}>
                  <Title level={2}>{t("chainTitle")}</Title>
                  <Paragraph>{t("chainDesc")}</Paragraph>
                </div>
                <div className="quote-grid">
                  {enriched
                    .slice()
                    .sort((a, b) => a.expiry.localeCompare(b.expiry) || a.strike - b.strike || a.optionType.localeCompare(b.optionType))
                    .map((row) => (
                      <QuoteCard
                        key={row.symbol}
                        row={row}
                        t={t}
                        accentColor={row.optionType === "call" ? paletteToken.up : paletteToken.down}
                      />
                    ))}
                </div>
              </Card>
            </>
          )}
        </main>
      </AntApp>
    </ConfigProvider>
  );
}
