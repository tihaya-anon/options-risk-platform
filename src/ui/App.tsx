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
import { SectionNav } from "./components/SectionNav";
import {
  aggregatePortfolioExposure,
  calculateGroupedExposures,
  calculatePortfolioScenario,
  calculatePortfolioVolScenario,
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
const LazyVolScenarioSection = lazy(() =>
  import("./components/VolScenarioSection").then((module) => ({
    default: module.VolScenarioSection,
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
  const portfolioVolScenario = useMemo(() => {
    if (!snapshot) return [];
    return calculatePortfolioVolScenario(
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
  const sectionItems = useMemo(
    () => [
      { id: "positions", label: t("positionsTitle") },
      { id: "spot-scenario", label: t("scenarioTitle") },
      { id: "vol-scenario", label: t("volScenarioTitle") },
      { id: "grouped-exposure", label: t("groupedExposureTitle") },
      { id: "greeks-summary", label: t("greeksSummaryTitle") },
      { id: "term-structure", label: t("termTitle") },
      { id: "skew", label: t("skewTitle") },
      { id: "chain", label: t("chainTitle") },
    ],
    [t]
  );

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

      {!snapshot ? null : <SectionNav items={sectionItems} />}

      {!snapshot ? null : (
        <>
          <div id="positions">
            <PortfolioPositionsSection
              positionsInput={positionsInput}
              exposure={portfolioExposure}
              parseErrors={parsedPositions.errors}
              t={t}
              palette={paletteColors}
              onPositionsInputChange={setPositionsInput}
              onFileUpload={handleFileUpload}
            />
          </div>

          <div id="spot-scenario">
            <Suspense fallback={<ChartSectionFallback />}>
              <LazyScenarioPnlSection
                scenarios={portfolioScenario}
                t={t}
                accentColor={paletteColors.accent}
                neutralColor={paletteColors.neutral}
                chartTheme={chartTheme}
              />
            </Suspense>
          </div>

          <div id="vol-scenario">
            <Suspense fallback={<ChartSectionFallback />}>
              <LazyVolScenarioSection
                scenarios={portfolioVolScenario}
                t={t}
                accentColor={paletteColors.up}
                neutralColor={paletteColors.neutral}
                chartTheme={chartTheme}
              />
            </Suspense>
          </div>

          <div id="grouped-exposure">
            <Suspense fallback={<ChartSectionFallback />}>
              <LazyGroupedExposureSection
                groups={groupedExposures}
                groupByMode={groupByMode}
                t={t}
                chartTheme={chartTheme}
                onGroupByModeChange={setGroupByMode}
              />
            </Suspense>
          </div>

          <div id="greeks-summary">
            <GreeksSummarySection
              summary={riskSummary}
              palette={paletteColors}
              t={t}
            />
          </div>

          <div id="term-structure">
            <Suspense fallback={<ChartSectionFallback />}>
              <LazyTermStructureSection
                rows={enrichedQuotes}
                upColor={paletteColors.up}
                downColor={paletteColors.down}
                chartTheme={chartTheme}
                t={t}
              />
            </Suspense>
          </div>

          <div id="skew">
            <Suspense fallback={<ChartSectionFallback />}>
              <LazySkewSection
                rows={enrichedQuotes}
                upColor={paletteColors.up}
                downColor={paletteColors.down}
                chartTheme={chartTheme}
                t={t}
              />
            </Suspense>
          </div>

          <div id="chain">
            <ChainSection
              rows={enrichedQuotes}
              upColor={paletteColors.up}
              downColor={paletteColors.down}
              t={t}
            />
          </div>
        </>
      )}
    </main>
  );
}
