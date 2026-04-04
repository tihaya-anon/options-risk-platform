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
import { SkewSection } from "./components/SkewSection";
import { TermStructureSection } from "./components/TermStructureSection";

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

  const t = useMemo(() => createTranslator(language), [language]);
  const enrichedQuotes = useMemo(
    () => (snapshot ? enrichSnapshot(snapshot, blackScholesModel) : []),
    [snapshot]
  );
  const riskSummary = useMemo(
    () => calculateRiskSummary(enrichedQuotes),
    [enrichedQuotes]
  );
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
