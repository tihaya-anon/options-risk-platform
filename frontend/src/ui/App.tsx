import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
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
import { ChainSection } from "./components/ChainSection";
import { GreeksSummarySection } from "./components/GreeksSummarySection";
import { HeroSection } from "./components/HeroSection";
import { OverviewSection } from "./components/OverviewSection";
import { PortfolioPositionsSection } from "./components/PortfolioPositionsSection";
import { SettingsSection } from "./components/SettingsSection";
import { SidebarNav } from "./components/SidebarNav";
import type { FrontendSettings, GroupByMode } from "../types";

const DEFAULT_POSITIONS_INPUT =
  "SPY,100\nSPY260515P00525000,2\nSPY260417C00540000,-1";

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
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(detectTheme);
  const [palette, setPalette] = useState<Palette>(detectPalette);
  const [groupByMode, setGroupByMode] = useState<GroupByMode>("full");
  const [settings, setSettings] = useState<FrontendSettings>(detectFrontendSettings);
  const [positionsInput, setPositionsInput] =
    useState<string>(DEFAULT_POSITIONS_INPUT);
  const { snapshot } = useSnapshot(settings.symbol, settings.apiBaseUrl);

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
    localStorage.setItem("orp_api_base_url", settings.apiBaseUrl);
    localStorage.setItem("orp_symbol", settings.symbol);
  }, [settings]);

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    setPositionsInput(text);
  };

  const t = useMemo(() => createTranslator(language), [language]);
  const { analysis } = usePortfolioAnalysis({
    snapshot,
    positionsInput,
    groupByMode,
    apiBaseUrl: settings.apiBaseUrl,
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

  const paletteColors = paletteTokens[palette];
  const chartTheme = useMemo(() => getChartTheme(themeMode), [themeMode]);
  const navItems = useMemo(
    () => [
      { path: "/overview", label: t("overviewTitle") },
      { path: "/settings", label: t("settingsTitle") },
      { path: "/positions", label: t("positionsTitle") },
      { path: "/spot-scenario", label: t("scenarioTitle") },
      { path: "/time-scenario", label: t("timeScenarioTitle") },
      { path: "/vol-scenario", label: t("volScenarioTitle") },
      { path: "/grouped-exposure", label: t("groupedExposureTitle") },
      { path: "/greeks-summary", label: t("greeksSummaryTitle") },
      { path: "/term-structure", label: t("termTitle") },
      { path: "/skew", label: t("skewTitle") },
      { path: "/chain", label: t("chainTitle") },
    ],
    [t]
  );

  return (
    <div className="page-shell dashboard-layout">
      {!snapshot ? null : <SidebarNav items={navItems} />}

      <main className="dashboard-content">
        <HeroSection
          language={language}
          themeMode={themeMode}
          palette={palette}
          accentColor={paletteColors.accent}
          t={t}
          onLanguageChange={setLanguage}
          onThemeChange={setThemeMode}
          onPaletteChange={setPalette}
        />

        {!snapshot ? null : (
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route
              path="/settings"
              element={
                <SettingsSection
                  settings={settings}
                  t={t}
                  onSettingsChange={setSettings}
                  onSave={() => setSettings({ ...settings })}
                />
              }
            />
            <Route
              path="/overview"
              element={
                <OverviewSection
                  snapshot={snapshot}
                  exposure={portfolioExposure}
                  spotScenarios={portfolioScenario}
                  timeScenarios={portfolioTimeScenario}
                  volScenarios={portfolioVolScenario}
                  groupedExposures={groupedExposures}
                  t={t}
                />
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
                  t={t}
                />
              }
            />
          </Routes>
        )}
      </main>
    </div>
  );
}
