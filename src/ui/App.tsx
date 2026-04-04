import {
  Suspense,
  lazy,
  useEffect,
  useMemo,
  useState,
} from "react";
import { blackScholesModel } from "../lib/bs";
import { enrichSnapshot } from "../lib/enrich";
import { getChartTheme } from "./chartTheme";
import { paletteTokens, type Language, type Palette, type ThemeMode } from "./config";
import { calculateRiskSummary } from "./format";
import { createTranslator } from "./i18n";
import { detectLanguage, detectPalette, detectTheme } from "./preferences";
import { useSnapshot } from "./hooks/useSnapshot";
import { ChainSection } from "./components/ChainSection";
import { GreeksSummarySection } from "./components/GreeksSummarySection";
import { HeroSection } from "./components/HeroSection";
import { PortfolioPositionsSection } from "./components/PortfolioPositionsSection";
import {
  aggregatePortfolioExposure,
  calculateGroupedExposures,
  calculatePortfolioScenario,
  type GroupByMode,
  parsePositionsInput,
} from "./positions";

const DEFAULT_POSITIONS_INPUT = "SPY,100\nSPY260515P00525000,2\nSPY260417C00540000,-1";
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

function ChartSectionFallback() {
  return <div className="panel card chart-loading">Loading chart module...</div>;
}

export function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(detectTheme);
  const [palette, setPalette] = useState<Palette>(detectPalette);
  const [groupByMode, setGroupByMode] = useState<GroupByMode>("full");
  const [positionsInput, setPositionsInput] = useState<string>(DEFAULT_POSITIONS_INPUT);
  const { snapshot, error } = useSnapshot();

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    setPositionsInput(text);
  };

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

  const t = useMemo(() => createTranslator(language), [language]);
  const enrichedQuotes = useMemo(
    () => (snapshot ? enrichSnapshot(snapshot, blackScholesModel) : []),
    [snapshot]
  );
  const parsedPositions = useMemo(
    () => parsePositionsInput(positionsInput),
    [positionsInput]
  );
  const riskSummary = useMemo(
    () => calculateRiskSummary(enrichedQuotes),
    [enrichedQuotes]
  );
  const portfolioExposure = useMemo(() => {
    if (!snapshot) {
      return {
        netDelta: 0,
        netGamma: 0,
        netVega: 0,
        netTheta: 0,
        marketValue: 0,
        unmatchedSymbols: [],
      };
    }
    return aggregatePortfolioExposure(
      snapshot,
      enrichedQuotes,
      parsedPositions.positions
    );
  }, [enrichedQuotes, parsedPositions.positions, snapshot]);
  const portfolioScenario = useMemo(() => {
    if (!snapshot) return [];
    return calculatePortfolioScenario(
      snapshot,
      enrichedQuotes,
      parsedPositions.positions
    );
  }, [enrichedQuotes, parsedPositions.positions, snapshot]);
  const groupedExposures = useMemo(() => {
    if (!snapshot) return [];
    return calculateGroupedExposures(
      snapshot,
      enrichedQuotes,
      parsedPositions.positions,
      groupByMode
    );
  }, [enrichedQuotes, groupByMode, parsedPositions.positions, snapshot]);
  const paletteColors = paletteTokens[palette];
  const chartTheme = useMemo(() => getChartTheme(themeMode), [themeMode]);

  return (
    <main className="page-shell">
      <HeroSection
        snapshot={snapshot}
        error={error}
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
        <>
          <PortfolioPositionsSection
            positionsInput={positionsInput}
            exposure={portfolioExposure}
            parseErrors={parsedPositions.errors}
            t={t}
            palette={paletteColors}
            onPositionsInputChange={setPositionsInput}
            onFileUpload={handleFileUpload}
          />

          <Suspense fallback={<ChartSectionFallback />}>
            <LazyScenarioPnlSection
              scenarios={portfolioScenario}
              t={t}
              accentColor={paletteColors.accent}
              neutralColor={paletteColors.neutral}
              chartTheme={chartTheme}
            />
          </Suspense>

          <Suspense fallback={<ChartSectionFallback />}>
            <LazyGroupedExposureSection
              groups={groupedExposures}
              groupByMode={groupByMode}
              t={t}
              chartTheme={chartTheme}
              onGroupByModeChange={setGroupByMode}
            />
          </Suspense>

          <GreeksSummarySection
            summary={riskSummary}
            palette={paletteColors}
            t={t}
          />
          <Suspense fallback={<ChartSectionFallback />}>
            <LazyTermStructureSection
              rows={enrichedQuotes}
              upColor={paletteColors.up}
              downColor={paletteColors.down}
              chartTheme={chartTheme}
              t={t}
            />
          </Suspense>

          <Suspense fallback={<ChartSectionFallback />}>
            <LazySkewSection
              rows={enrichedQuotes}
              upColor={paletteColors.up}
              downColor={paletteColors.down}
              chartTheme={chartTheme}
              t={t}
            />
          </Suspense>

          <ChainSection
            rows={enrichedQuotes}
            upColor={paletteColors.up}
            downColor={paletteColors.down}
            t={t}
          />
        </>
      )}
    </main>
  );
}
