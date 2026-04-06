import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { getChartTheme } from "./chartTheme";
import {
  paletteTokens,
  type Language,
  type Palette,
  type ThemeMode,
} from "./config";
import { createTranslator } from "./i18n";
import {
  detectFrontendSettings,
  detectLanguage,
  detectPalette,
  detectTheme,
} from "./preferences";
import { useSnapshot } from "./hooks/useSnapshot";
import { usePortfolioAnalysis } from "./hooks/usePortfolioAnalysis";
import { useConnectionHealth } from "./hooks/useConnectionHealth";
import { useRuntimeConfig } from "./hooks/useRuntimeConfig";
import { useStaticDatasetInfo } from "./hooks/useStaticDatasetInfo";
import { ChainSection } from "./components/ChainSection";
import { CurrentBookSection } from "./components/CurrentBookSection";
import { DataWorkspaceSection } from "./components/DataWorkspaceSection";
import { GreeksSummarySection } from "./components/GreeksSummarySection";
import { HedgeDecisionSection } from "./components/HedgeDecisionSection";
import { HedgeLabSection } from "./components/HedgeLabSection";
import { HeroSection } from "./components/HeroSection";
import { InstrumentWorkbenchSection } from "./components/InstrumentWorkbenchSection";
import { OptionRiskProfileSection } from "./components/OptionRiskProfileSection";
import { OverviewSection } from "./components/OverviewSection";
import { PortfolioPositionsSection } from "./components/PortfolioPositionsSection";
import { RiskControlSection } from "./components/RiskControlSection";
import { RiskMapSection } from "./components/RiskMapSection";
import { SettingsSection } from "./components/SettingsSection";
import { SidebarNav } from "./components/SidebarNav";
import type { SidebarNavGroup } from "./components/SidebarNav";
import { StatusPanel } from "./components/StatusPanel";
import { StrategyCompareSection } from "./components/StrategyCompareSection";
import type { FrontendSettings, GroupByMode } from "../types";
import type { HedgeUniverse } from "../api/generated/model/hedgeUniverse";
import { useBookSnapshot } from "./hooks/useBookSnapshot";
import { useHedgeLab } from "./hooks/useHedgeLab";
import { useRiskMap } from "./hooks/useRiskMap";
import { useStrategyComparison } from "./hooks/useStrategyComparison";
import { isStaticDemoMode } from "../lib/staticWorkbench";

const DEFAULT_POSITIONS_INPUT =
  "SPY,100\nQQQ,40\nAAPL,80\nSPY260515P00525000,2\nQQQ260619P00470000,1\nAAPL260515C00210000,-1";

const LazyGroupedExposureSection = lazy(() =>
  import("./components/GroupedExposureSection").then((module) => ({
    default: module.GroupedExposureSection,
  }))
);
const LazyScenarioPnlSection = lazy(() =>
  import("./components/ScenarioPnlSection").then((module) => ({
    default: module.ScenarioPnlSection,
  }))
);
const LazySkewSection = lazy(() =>
  import("./components/SkewSection").then((module) => ({
    default: module.SkewSection,
  }))
);
const LazyTermStructureSection = lazy(() =>
  import("./components/TermStructureSection").then((module) => ({
    default: module.TermStructureSection,
  }))
);
const LazyVolScenarioSection = lazy(() =>
  import("./components/VolScenarioSection").then((module) => ({
    default: module.VolScenarioSection,
  }))
);
const LazyTimeScenarioSection = lazy(() =>
  import("./components/TimeScenarioSection").then((module) => ({
    default: module.TimeScenarioSection,
  }))
);

function ChartSectionFallback() {
  return <div className="panel card chart-loading">Loading chart module...</div>;
}

export function App() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(detectTheme);
  const [palette, setPalette] = useState<Palette>(detectPalette);
  const [groupByMode, setGroupByMode] = useState<GroupByMode>("full");
  const [hedgeTarget, setHedgeTarget] = useState("neutralize-delta");
  const [hedgeUniverse, setHedgeUniverse] = useState<HedgeUniverse>("futuresAndOptions");
  const [chainViewMode, setChainViewMode] = useState<"cards" | "table">(
    () => (localStorage.getItem("orp_chain_view") as "cards" | "table") ?? "cards",
  );
  const [chainCardSortKey, setChainCardSortKey] = useState<
    "expiry" | "strike" | "iv" | "oi" | "mid" | "delta" | "gamma" | "vega" | "theta" | "optionType"
  >(
    () =>
      (localStorage.getItem("orp_chain_card_sort_key") as
        | "expiry"
        | "strike"
        | "iv"
        | "oi"
        | "mid"
        | "delta"
        | "gamma"
        | "vega"
        | "theta"
        | "optionType") ?? "expiry",
  );
  const [chainCardSortDirection, setChainCardSortDirection] = useState<"asc" | "desc">(
    () => (localStorage.getItem("orp_chain_card_sort_direction") as "asc" | "desc") ?? "asc",
  );
  const [chainTableSortKey, setChainTableSortKey] = useState<
    "expiry" | "strike" | "iv" | "oi" | "mid" | "delta" | "gamma" | "vega" | "theta" | "optionType"
  >(() =>
    (localStorage.getItem("orp_chain_table_sort_key") as
      | "expiry"
      | "strike"
      | "iv"
      | "oi"
      | "mid"
      | "delta"
      | "gamma"
      | "vega"
      | "theta"
      | "optionType") ?? "expiry",
  );
  const [chainTableSortDirection, setChainTableSortDirection] = useState<"asc" | "desc">(
    () => (localStorage.getItem("orp_chain_table_sort_direction") as "asc" | "desc") ?? "asc",
  );
  const [settings, setSettings] = useState<FrontendSettings>(detectFrontendSettings);
  const [positionsInput, setPositionsInput] =
    useState<string>(DEFAULT_POSITIONS_INPUT);
  const [selectedContractSymbol, setSelectedContractSymbol] = useState(
    () => localStorage.getItem("orp_selected_contract_symbol") ?? "",
  );
  const surfaceUnderlying = settings.focusUnderlying.trim();
  const { snapshot, error: snapshotError } = useSnapshot(
    surfaceUnderlying,
    settings.provider,
    settings.apiBaseUrl
  );

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

  useEffect(() => {
    localStorage.setItem("orp_chain_view", chainViewMode);
  }, [chainViewMode]);

  useEffect(() => {
    localStorage.setItem("orp_chain_card_sort_key", chainCardSortKey);
    localStorage.setItem("orp_chain_card_sort_direction", chainCardSortDirection);
    localStorage.setItem("orp_chain_table_sort_key", chainTableSortKey);
    localStorage.setItem("orp_chain_table_sort_direction", chainTableSortDirection);
  }, [
    chainCardSortDirection,
    chainCardSortKey,
    chainTableSortDirection,
    chainTableSortKey,
  ]);

  useEffect(() => {
    localStorage.setItem("orp_selected_contract_symbol", selectedContractSymbol);
  }, [selectedContractSymbol]);

  useEffect(() => {
    localStorage.setItem("orp_api_base_url", settings.apiBaseUrl);
    localStorage.setItem("orp_focus_underlying", settings.focusUnderlying);
    localStorage.setItem("orp_provider", settings.provider);
    localStorage.setItem("orp_advisor_mode", settings.advisorMode);
  }, [settings]);

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    setPositionsInput(text);
  };

  const t = useMemo(() => createTranslator(language), [language]);
  const isStaticMode = isStaticDemoMode(settings.apiBaseUrl);
  const runtimeConfig = useRuntimeConfig(settings.apiBaseUrl);
  const staticDatasetInfo = useStaticDatasetInfo(settings.apiBaseUrl);
  const surfaceContextUnderlying =
    settings.focusUnderlying.trim() ||
    staticDatasetInfo?.defaultSymbol ||
    snapshot?.underlying.symbol ||
    "";
  const {
    health,
    error: healthError,
    isChecking: isConnectionChecking,
    testConnection,
  } = useConnectionHealth(settings.apiBaseUrl);
  const { book, error: bookError } = useBookSnapshot({
    positionsInput,
    defaultSymbol: surfaceContextUnderlying || undefined,
    snapshot,
    apiBaseUrl: settings.apiBaseUrl,
  });
  const { riskMap, error: riskMapError } = useRiskMap({
    book,
    apiBaseUrl: settings.apiBaseUrl,
  });
  const { hedgeLab, error: hedgeLabError } = useHedgeLab({
    book,
    apiBaseUrl: settings.apiBaseUrl,
    target: hedgeTarget,
    hedgeUniverse,
  });
  const { comparison, error: comparisonError } = useStrategyComparison({
    hedgeLab,
    apiBaseUrl: settings.apiBaseUrl,
  });
  const { analysis, error: analysisError } = usePortfolioAnalysis({
    snapshot,
    positionsInput,
    groupByMode,
    apiBaseUrl: settings.apiBaseUrl,
    advisorMode: settings.advisorMode,
  });
  const enrichedQuotes = snapshot?.quotes ?? [];
  const parsedPositions = analysis?.parsedPositions;
  const riskSummary = analysis?.exposure ?? {
    netDelta: 0,
    netGamma: 0,
    netVega: 0,
    netTheta: 0,
    marketValue: 0,
    unmatchedSymbols: [],
  };
  const portfolioExposure = analysis?.exposure ?? riskSummary;
  const portfolioScenario = analysis?.spotScenarios ?? [];
  const portfolioVolScenario = analysis?.volScenarios ?? [];
  const portfolioTimeScenario = analysis?.timeScenarios ?? [];
  const groupedExposures = analysis?.groupedExposures ?? [];

  useEffect(() => {
    if (!selectedContractSymbol) {
      const firstOption = enrichedQuotes.find((quote) => quote.optionType === "call" || quote.optionType === "put");
      if (firstOption) {
        setSelectedContractSymbol(firstOption.symbol);
      }
    }
  }, [enrichedQuotes, selectedContractSymbol]);

  const paletteColors = paletteTokens[palette];
  const chartTheme = useMemo(() => getChartTheme(themeMode), [themeMode]);
  const statusMessage =
    snapshotError ??
    analysisError ??
    bookError ??
    riskMapError ??
    hedgeLabError ??
    comparisonError ??
    (snapshot ? null : t("loading"));
  const navGroups = useMemo<SidebarNavGroup[]>(
    () => [
      {
        title: t("navDashboard"),
        items: [
          { path: "/dashboard", label: t("overviewTitle") },
          { path: "/current-book", label: t("currentBookTitle") },
        ],
      },
      {
        title: t("navRisk"),
        items: [
          { path: "/risks", label: t("riskControlTitle") },
          { path: "/risk-map", label: t("riskMapTitle") },
          { path: "/grouped-exposure", label: t("groupedExposureTitle") },
          { path: "/greeks-summary", label: t("greeksSummaryTitle") },
          { path: "/spot-scenario", label: t("scenarioTitle") },
          { path: "/vol-scenario", label: t("volScenarioTitle") },
          { path: "/time-scenario", label: t("timeScenarioTitle") },
        ],
      },
      {
        title: t("navHedge"),
        items: [
          { path: "/hedges", label: t("hedgeDecisionTitle") },
          { path: "/hedge-lab", label: t("hedgeLabTitle") },
          { path: "/strategy-compare", label: t("strategyCompareTitle") },
        ],
      },
      {
        title: t("navInstruments"),
        items: [
          { path: "/instruments", label: t("instrumentWorkbenchTitle") },
          { path: "/option-risk-profile", label: t("optionRiskProfileTitle") },
          { path: "/chain", label: t("chainTitle") },
          { path: "/term-structure", label: t("termTitle") },
          { path: "/skew", label: t("skewTitle") },
        ],
      },
      {
        title: t("navData"),
        tone: "muted",
        items: [
          { path: "/data", label: t("dataWorkspaceTitle") },
          { path: "/positions", label: t("positionsTitle") },
          { path: "/settings", label: t("settingsTitle") },
        ],
      },
    ],
    [t]
  );

  return (
    <div className="page-shell dashboard-layout">
      <SidebarNav
        groups={navGroups}
        kicker=""
      />

      <main className="dashboard-content">
        <div className="dashboard-header">
          <HeroSection
            language={language}
            themeMode={themeMode}
            palette={palette}
            accentColor={paletteColors.accent}
            title={t("controlTowerTitle")}
            t={t}
            onLanguageChange={setLanguage}
            onThemeChange={setThemeMode}
            onPaletteChange={setPalette}
          />
        </div>

        <div className="dashboard-main custom-scrollbar">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/overview" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/current-book"
              element={<CurrentBookSection book={book} t={t} />}
            />
            <Route
              path="/risks"
              element={
                <RiskControlSection
                  riskMap={riskMap}
                  groupedExposures={groupedExposures}
                  spotScenarios={portfolioScenario}
                  volScenarios={portfolioVolScenario}
                  timeScenarios={portfolioTimeScenario}
                  language={language}
                  t={t}
                />
              }
            />
            <Route
              path="/risk-map"
              element={<RiskMapSection riskMap={riskMap} language={language} t={t} />}
            />
            <Route
              path="/hedges"
              element={
                <HedgeDecisionSection
                  hedgeLab={hedgeLab}
                  comparison={comparison}
                  language={language}
                  t={t}
                />
              }
            />
            <Route
              path="/hedge-lab"
              element={
                <HedgeLabSection
                  hedgeLab={hedgeLab}
                  hedgeTarget={hedgeTarget}
                  hedgeUniverse={hedgeUniverse}
                  t={t}
                  onTargetChange={setHedgeTarget}
                  onUniverseChange={setHedgeUniverse}
                />
              }
            />
            <Route
              path="/strategy-compare"
              element={<StrategyCompareSection comparison={comparison} t={t} />}
            />
            <Route
              path="/instruments"
              element={
                <InstrumentWorkbenchSection
                  rows={enrichedQuotes}
                  focusUnderlying={surfaceContextUnderlying}
                  selectedSymbol={selectedContractSymbol}
                  t={t}
                />
              }
            />
            <Route
              path="/option-risk-profile"
              element={
                <OptionRiskProfileSection
                  rows={enrichedQuotes}
                  selectedSymbol={selectedContractSymbol}
                  chartTheme={chartTheme}
                  accentColor={paletteColors.accent}
                  t={t}
                  onSelectSymbol={setSelectedContractSymbol}
                />
              }
            />
            <Route
              path="/data"
              element={
                <DataWorkspaceSection
                  isStaticMode={isStaticMode}
                  staticDataset={staticDatasetInfo}
                  t={t}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsSection
                  settings={settings}
                  providers={runtimeConfig?.providers ?? ["mock", "yahooSynthetic"]}
                  advisorModes={runtimeConfig?.advisorModes ?? ["rules", "llm"]}
                  providerMetadata={runtimeConfig?.providerMetadata ?? []}
                  connectionStatus={health && !healthError ? "connected" : "degraded"}
                  connectionProvider={health?.provider ?? settings.provider}
                  connectionError={healthError}
                  isConnectionChecking={isConnectionChecking}
                  isStaticMode={isStaticMode}
                  staticDataset={staticDatasetInfo}
                  t={t}
                  onSettingsChange={setSettings}
                  onSave={() => setSettings({ ...settings })}
                  onTestConnection={testConnection}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                !snapshot ? (
                  <StatusPanel
                    title={snapshotError ? t("failedLoad") : t("overviewTitle")}
                    message={statusMessage ?? t("loading")}
                  />
                ) : (
                  <OverviewSection
                    snapshot={snapshot}
                    exposure={portfolioExposure}
                    spotScenarios={portfolioScenario}
                    timeScenarios={portfolioTimeScenario}
                    volScenarios={portfolioVolScenario}
                    groupedExposures={groupedExposures}
                    riskMap={riskMap}
                    hedgeLab={hedgeLab}
                    focusUnderlying={surfaceContextUnderlying}
                    language={language}
                    t={t}
                  />
                )
              }
            />
            <Route
              path="/positions"
              element={
                <PortfolioPositionsSection
                  positionsInput={positionsInput}
                  exposure={portfolioExposure}
                  parseErrors={parsedPositions?.errors ?? []}
                  t={t}
                  palette={paletteColors}
                  onPositionsInputChange={setPositionsInput}
                  onFileUpload={handleFileUpload}
                />
              }
            />
            <Route
              path="/spot-scenario"
              element={
                <Suspense fallback={<ChartSectionFallback />}>
                  <LazyScenarioPnlSection
                    scenarios={portfolioScenario}
                    t={t}
                    accentColor={paletteColors.accent}
                    neutralColor={paletteColors.neutral}
                    chartTheme={chartTheme}
                  />
                </Suspense>
              }
            />
            <Route
              path="/time-scenario"
              element={
                <Suspense fallback={<ChartSectionFallback />}>
                  <LazyTimeScenarioSection
                    scenarios={portfolioTimeScenario}
                    t={t}
                    accentColor={paletteColors.down}
                    neutralColor={paletteColors.neutral}
                    chartTheme={chartTheme}
                  />
                </Suspense>
              }
            />
            <Route
              path="/vol-scenario"
              element={
                <Suspense fallback={<ChartSectionFallback />}>
                  <LazyVolScenarioSection
                    scenarios={portfolioVolScenario}
                    t={t}
                    accentColor={paletteColors.up}
                    neutralColor={paletteColors.neutral}
                    chartTheme={chartTheme}
                  />
                </Suspense>
              }
            />
            <Route
              path="/grouped-exposure"
              element={
                <Suspense fallback={<ChartSectionFallback />}>
                  <LazyGroupedExposureSection
                    groups={groupedExposures}
                    groupByMode={groupByMode}
                    t={t}
                    chartTheme={chartTheme}
                    onGroupByModeChange={setGroupByMode}
                  />
                </Suspense>
              }
            />
            <Route
              path="/greeks-summary"
              element={
                <GreeksSummarySection
                  summary={riskSummary}
                  palette={paletteColors}
                  t={t}
                />
              }
            />
            <Route
              path="/term-structure"
              element={
                <Suspense fallback={<ChartSectionFallback />}>
                  <LazyTermStructureSection
                    rows={enrichedQuotes}
                    upColor={paletteColors.up}
                    downColor={paletteColors.down}
                    chartTheme={chartTheme}
                    t={t}
                  />
                </Suspense>
              }
            />
            <Route
              path="/skew"
              element={
                <Suspense fallback={<ChartSectionFallback />}>
                  <LazySkewSection
                    rows={enrichedQuotes}
                    upColor={paletteColors.up}
                    downColor={paletteColors.down}
                    chartTheme={chartTheme}
                    t={t}
                  />
                </Suspense>
              }
            />
            <Route
              path="/chain"
              element={
                <ChainSection
                  rows={enrichedQuotes}
                  upColor={paletteColors.up}
                  downColor={paletteColors.down}
                  selectedSymbol={selectedContractSymbol}
                  viewMode={chainViewMode}
                  cardSortKey={chainCardSortKey}
                  cardSortDirection={chainCardSortDirection}
                  tableSortKey={chainTableSortKey}
                  tableSortDirection={chainTableSortDirection}
                  t={t}
                  onViewModeChange={setChainViewMode}
                  onCardSortKeyChange={setChainCardSortKey}
                  onCardSortDirectionChange={setChainCardSortDirection}
                  onTableSortKeyChange={setChainTableSortKey}
                  onTableSortDirectionChange={setChainTableSortDirection}
                  onSelectSymbol={(symbol) => {
                    setSelectedContractSymbol(symbol);
                    navigate("/option-risk-profile");
                  }}
                />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
