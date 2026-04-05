import type { ChangeEvent, FormEvent } from "react";
import type { FrontendSettings } from "../../types";
import type { I18nKey } from "../i18n";
import { SelectField } from "./SelectField";

export function SettingsSection({
  settings,
  providers,
  advisorModes,
  t,
  onSettingsChange,
  onSave,
}: {
  settings: FrontendSettings;
  providers: string[];
  advisorModes: string[];
  t: (key: I18nKey) => string;
  onSettingsChange: (settings: FrontendSettings) => void;
  onSave: () => void;
}) {
  const handleChange =
    (field: keyof FrontendSettings) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({
        ...settings,
        [field]: event.target.value,
      });
    };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave();
  };

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("settingsTitle")}</h2>
          <p>{t("settingsDesc")}</p>
        </div>
      </div>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label className="toolbar-field">
          <span>{t("apiBaseUrl")}</span>
          <input
            className="settings-input"
            value={settings.apiBaseUrl}
            onChange={handleChange("apiBaseUrl")}
          />
        </label>
        <label className="toolbar-field">
          <span>{t("symbol")}</span>
          <input
            className="settings-input"
            value={settings.symbol}
            onChange={handleChange("symbol")}
          />
        </label>
        <label className="toolbar-field">
          <span>{t("provider")}</span>
          <SelectField
            value={settings.provider}
            onChange={(value) =>
              onSettingsChange({ ...settings, provider: value })
            }
            options={providers.map((provider) => ({
              value: provider,
              label:
                provider === "mock"
                  ? t("providerMock")
                  : provider === "yahooSynthetic"
                    ? t("providerYahooSynthetic")
                    : provider,
            }))}
          />
        </label>
        <label className="toolbar-field">
          <span>{t("advisorMode")}</span>
          <SelectField
            value={settings.advisorMode}
            onChange={(value) =>
              onSettingsChange({ ...settings, advisorMode: value })
            }
            options={advisorModes.map((mode) => ({
              value: mode,
              label: mode === "llm" ? t("advisorLlm") : t("advisorRules"),
            }))}
          />
        </label>
        <button type="submit" className="button-like">
          {t("saveSettings")}
        </button>
      </form>
    </section>
  );
}
