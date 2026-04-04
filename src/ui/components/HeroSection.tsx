import type { OptionSnapshotFile } from "../../types";
import type { Language, Palette, ThemeMode } from "../config";
import type { I18nKey } from "../i18n";
import { SelectField } from "./SelectField";

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
              <SelectField
                value={language}
                onChange={onLanguageChange}
                options={[
                  { value: "en", label: t("english") },
                  { value: "zh", label: t("chinese") },
                ]}
              />
            </label>
            <label className="toolbar-field">
              <span>{t("theme")}</span>
              <SelectField
                value={themeMode}
                onChange={onThemeChange}
                options={[
                  { value: "light", label: t("light") },
                  { value: "dark", label: t("dark") },
                ]}
              />
            </label>
            <label className="toolbar-field toolbar-span-2">
              <span>{t("palette")}</span>
              <SelectField
                value={palette}
                onChange={onPaletteChange}
                options={[
                  { value: "us", label: t("paletteUs") },
                  { value: "cn", label: t("paletteCn") },
                  { value: "amber", label: t("paletteAmber") },
                ]}
              />
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
