import type { OptionSnapshotFile } from "../../types";
import type { Language, Palette, ThemeMode } from "../config";
import type { I18nKey } from "../i18n";

export function HeroSection({
  snapshot,
  error,
  language,
  themeMode,
  palette,
  accentColor,
  t,
  onLanguageChange,
  onThemeChange,
  onPaletteChange,
}: {
  snapshot: OptionSnapshotFile | null;
  error: string | null;
  language: Language;
  themeMode: ThemeMode;
  palette: Palette;
  accentColor: string;
  t: (key: I18nKey) => string;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onPaletteChange: (palette: Palette) => void;
}) {
  return (
    <section className="hero card">
      <div className="hero-copy">
        <p className="eyebrow" style={{ color: accentColor }}>{t("appEyebrow")}</p>
        <h1>{t("appTitle")}</h1>
        <p className="lede">{t("appLede")}</p>
      </div>

      <div className="hero-panel">
        <div className="toolbar card">
          <div className="toolbar-grid">
            <label className="toolbar-field">
              <span>{t("language")}</span>
              <div className="select-wrap">
                <select value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
                  <option value="en">{t("english")}</option>
                  <option value="zh">{t("chinese")}</option>
                </select>
              </div>
            </label>
            <label className="toolbar-field">
              <span>{t("theme")}</span>
              <div className="select-wrap">
                <select value={themeMode} onChange={(event) => onThemeChange(event.target.value as ThemeMode)}>
                  <option value="light">{t("light")}</option>
                  <option value="dark">{t("dark")}</option>
                </select>
              </div>
            </label>
            <label className="toolbar-field toolbar-span-2">
              <span>{t("palette")}</span>
              <div className="select-wrap">
                <select value={palette} onChange={(event) => onPaletteChange(event.target.value as Palette)}>
                  <option value="us">{t("paletteUs")}</option>
                  <option value="cn">{t("paletteCn")}</option>
                  <option value="amber">{t("paletteAmber")}</option>
                </select>
              </div>
            </label>
          </div>
        </div>

        {!snapshot ? (
          <div className="metric card empty-state">
            {error ? `${t("failedLoad")}: ${error}` : t("loading")}
          </div>
        ) : (
          <>
            <div className="metric card"><span>{t("underlying")}</span><strong>{snapshot.underlying.symbol}</strong></div>
            <div className="metric card"><span>{t("spot")}</span><strong>{snapshot.underlying.spot.toFixed(2)} {snapshot.underlying.currency}</strong></div>
            <div className="metric card"><span>{t("snapshot")}</span><strong>{new Date(snapshot.generatedAt).toLocaleString(language === "zh" ? "zh-CN" : "en-US")}</strong></div>
            <div className="metric card"><span>{t("model")}</span><strong>Black-Scholes</strong></div>
          </>
        )}
      </div>
    </section>
  );
}
