import { useEffect, useMemo, useState } from "react";
import { blackScholesModel } from "../lib/bs";
import { enrichSnapshot } from "../lib/enrich";
import { paletteTokens, type Language, type Palette, type ThemeMode } from "./config";
import { calculateRiskSummary } from "./format";
import { createTranslator } from "./i18n";
import { detectLanguage, detectPalette, detectTheme } from "./preferences";
import { useSnapshot } from "./hooks/useSnapshot";
import { ChainSection } from "./components/ChainSection";
import { GreeksSummarySection } from "./components/GreeksSummarySection";
import { HeroSection } from "./components/HeroSection";
import { PortfolioPositionsSection } from "./components/PortfolioPositionsSection";
import { SkewSection } from "./components/SkewSection";
import { TermStructureSection } from "./components/TermStructureSection";
import {
  aggregatePortfolioExposure,
  parsePositionsInput,
} from "./positions";

const DEFAULT_POSITIONS_INPUT = "SPY,100\nSPY260515P00525000,2\nSPY260417C00540000,-1";

export function App() {
  const [language, setLanguage] = useState<Language>(detectLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(detectTheme);
  const [palette, setPalette] = useState<Palette>(detectPalette);
  const [positionsInput, setPositionsInput] = useState<string>(DEFAULT_POSITIONS_INPUT);
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
  const paletteColors = paletteTokens[palette];

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
          />
          <GreeksSummarySection
            summary={riskSummary}
            palette={paletteColors}
            t={t}
          />
          <TermStructureSection
            rows={enrichedQuotes}
            upColor={paletteColors.up}
            downColor={paletteColors.down}
            t={t}
          />
          <SkewSection
            rows={enrichedQuotes}
            upColor={paletteColors.up}
            downColor={paletteColors.down}
            t={t}
          />
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
