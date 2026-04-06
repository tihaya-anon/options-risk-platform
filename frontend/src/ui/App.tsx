import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { getChartTheme } from "@/ui/chartTheme";
import {
  paletteTokens,
  type Language,
  type Palette,
  type ThemeMode,
} from "@/ui/config";
import { createTranslator } from "@/ui/i18n";
import {
  detectFrontendSettings,
  detectLanguage,
  detectPalette,
  detectTheme,
} from "@/ui/preferences";
import { useSnapshot } from "@/ui/hooks/useSnapshot";
import { usePortfolioAnalysis } from "@/ui/hooks/usePortfolioAnalysis";
import { useConnectionHealth } from "@/ui/hooks/useConnectionHealth";
import { useRuntimeConfig } from "@/ui/hooks/useRuntimeConfig";
import { useStaticDatasetInfo } from "@/ui/hooks/useStaticDatasetInfo";
import { HeroSection } from "@/ui/components/layout/HeroSection";
import { SidebarNav } from "@/ui/components/layout/SidebarNav";
import type { FrontendSettings, GroupByMode } from "@/types";
import { useBookSnapshot } from "@/ui/hooks/useBookSnapshot";
import { useHedgeLab } from "@/ui/hooks/useHedgeLab";
import { useRiskMap } from "@/ui/hooks/useRiskMap";
import { useStrategyComparison } from "@/ui/hooks/useStrategyComparison";
import { isStaticDemoMode } from "@/lib/staticWorkbench";
import { buildSidebarNavGroups } from "@/ui/navigation";
import { DashboardPage } from "@/ui/pages/DashboardPage";
import {
  GroupedExposurePage,
  RiskMapPage,
  RiskSummaryPage,
  SpotScenarioPage,
  TimeScenarioPage,
  VolScenarioPage,
} from "@/ui/pages/RiskPages";
import {
  HedgeLabPage,
  HedgeSummaryPage,
  StrategyComparePage,
} from "@/ui/pages/HedgePages";
import {
  ChainPage,
  InstrumentsSummaryPage,
  OptionRiskProfilePage,
  SkewPage,
  TermStructurePage,
} from "@/ui/pages/InstrumentPages";
import {
  CurrentBookPage,
  DataWorkspacePage,
  PositionsPage,
  SettingsPage,
} from "@/ui/pages/DataPages";

const DEFAULT_POSITIONS_INPUT =
  "510050,20000\n510300,10000\n510500,5000\n510050C2604M02800,-2\n510050P2604M02800,3\n510300P2604M04400,2";

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(detectTheme);
  const [palette, setPalette] = useState<Palette>(detectPalette);
  const [groupByMode, setGroupByMode] = useState<GroupByMode>("full");
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
  const routeParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedBucket = routeParams.get("bucket") ?? "";
  const selectedProposalId = routeParams.get("proposal") ?? "";
  const routeSymbol = routeParams.get("symbol") ?? "";

  useEffect(() => {
    if (!selectedContractSymbol) {
      const firstOption = enrichedQuotes.find((quote) => quote.optionType === "call" || quote.optionType === "put");
      if (firstOption) {
        setSelectedContractSymbol(firstOption.symbol);
      }
    }
  }, [enrichedQuotes, selectedContractSymbol]);

  useEffect(() => {
    if (routeSymbol && routeSymbol !== selectedContractSymbol) {
      setSelectedContractSymbol(routeSymbol);
    }
  }, [routeSymbol, selectedContractSymbol]);

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
  const navGroups = useMemo(() => buildSidebarNavGroups(t), [t]);

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
              element={<CurrentBookPage book={book} t={t} />}
            />
            <Route
              path="/risks"
              element={
                <RiskSummaryPage
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
              element={<RiskMapPage riskMap={riskMap} language={language} t={t} />}
            />
            <Route
              path="/hedges"
              element={
                <HedgeSummaryPage
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
                <HedgeLabPage
                  hedgeLab={hedgeLab}
                  language={language}
                  t={t}
                />
              }
            />
            <Route
              path="/strategy-compare"
              element={
                <StrategyComparePage
                  comparison={comparison}
                  selectedProposalId={selectedProposalId}
                  language={language}
                  t={t}
                />
              }
            />
            <Route
              path="/instruments"
              element={
                <InstrumentsSummaryPage
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
                <OptionRiskProfilePage
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
                <DataWorkspacePage
                  isStaticMode={isStaticMode}
                  staticDataset={staticDatasetInfo}
                  settings={settings}
                  positionsCount={parsedPositions?.positions.length ?? 0}
                  parseErrorCount={parsedPositions?.errors.length ?? 0}
                  unmatchedCount={portfolioExposure.unmatchedSymbols.length}
                  connectionStatus={health && !healthError ? "connected" : "degraded"}
                  t={t}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <SettingsPage
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
                <DashboardPage
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
                  statusMessage={statusMessage ?? t("loading")}
                  t={t}
                />
              }
            />
            <Route
              path="/positions"
              element={
                <PositionsPage
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
                <SpotScenarioPage
                  scenarios={portfolioScenario}
                  t={t}
                  accentColor={paletteColors.accent}
                  neutralColor={paletteColors.neutral}
                  chartTheme={chartTheme}
                />
              }
            />
            <Route
              path="/time-scenario"
              element={
                <TimeScenarioPage
                  scenarios={portfolioTimeScenario}
                  t={t}
                  accentColor={paletteColors.down}
                  neutralColor={paletteColors.neutral}
                  chartTheme={chartTheme}
                />
              }
            />
            <Route
              path="/vol-scenario"
              element={
                <VolScenarioPage
                  scenarios={portfolioVolScenario}
                  t={t}
                  accentColor={paletteColors.up}
                  neutralColor={paletteColors.neutral}
                  chartTheme={chartTheme}
                />
              }
            />
            <Route
              path="/grouped-exposure"
              element={
                <GroupedExposurePage
                  groups={groupedExposures}
                  groupByMode={groupByMode}
                  selectedBucket={selectedBucket}
                  t={t}
                  chartTheme={chartTheme}
                  onGroupByModeChange={setGroupByMode}
                />
              }
            />
            <Route
              path="/term-structure"
              element={
                <TermStructurePage
                  rows={enrichedQuotes}
                  upColor={paletteColors.up}
                  downColor={paletteColors.down}
                  chartTheme={chartTheme}
                  t={t}
                />
              }
            />
            <Route
              path="/skew"
              element={
                <SkewPage
                  rows={enrichedQuotes}
                  upColor={paletteColors.up}
                  downColor={paletteColors.down}
                  chartTheme={chartTheme}
                  t={t}
                />
              }
            />
            <Route
              path="/chain"
              element={
                <ChainPage
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
