import type { Language, Palette, ThemeMode } from "../config";
import type { I18nKey } from "../i18n";
import { SelectField } from "./SelectField";

export function HeroSection({
  language,
  themeMode,
  palette,
  accentColor,
  title,
  t,
  onLanguageChange,
  onThemeChange,
  onPaletteChange,
}: {
  language: Language;
  themeMode: ThemeMode;
  palette: Palette;
  accentColor: string;
  title: string;
  t: (key: I18nKey) => string;
  onLanguageChange: (language: Language) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onPaletteChange: (palette: Palette) => void;
}) {
  return (
    <section className="hero card">
      <div className="hero-identity">
        <p className="eyebrow" style={{ color: accentColor }}>
          {t("appEyebrow")}
        </p>
        <strong className="hero-titleline">{title}</strong>
      </div>

      <div className="utility-dock card">
        <label className="field-stack compact">
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
        <label className="field-stack compact">
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
        <label className="field-stack compact">
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
    </section>
  );
}
