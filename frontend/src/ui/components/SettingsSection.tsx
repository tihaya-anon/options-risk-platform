import type { ChangeEvent, FormEvent } from "react";
import type { FrontendSettings } from "../../types";
import type { ProviderMetadata } from "../../api/generated/model/providerMetadata";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import { SelectField } from "./SelectField";

export function SettingsSection({
  settings,
  providers,
  advisorModes,
  providerMetadata,
  connectionStatus,
  connectionProvider,
  connectionError,
  isConnectionChecking,
  t,
  onSettingsChange,
  onSave,
  onTestConnection,
}: {
  settings: FrontendSettings;
  providers: string[];
  advisorModes: string[];
  providerMetadata: ProviderMetadata[];
  connectionStatus: "connected" | "degraded";
  connectionProvider: string;
  connectionError: string | null;
  isConnectionChecking: boolean;
  t: (key: I18nKey) => string;
  onSettingsChange: (settings: FrontendSettings) => void;
  onSave: () => void;
  onTestConnection: () => void;
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

  const selectedProvider =
    providerMetadata.find((provider) => provider.id === settings.provider) ?? null;

  return (
    <PanelSection
      title={t("settingsTitle")}
      description={t("dataWorkspaceDesc")}
      className="data-panel"
      bodyClassName="settings-panel-content"
    >
      <div className="settings-layout">
        <article className="card settings-card">
          <div className="meta-block">
            <span>{t("connectionStatus")}</span>
            <strong
              className={`status-pill ${connectionStatus === "connected" ? "online" : "offline"}`}
            >
              {connectionStatus === "connected"
                ? t("statusConnected")
                : t("statusDegraded")}
            </strong>
          </div>
          <div className="settings-detail-list">
            <div>
              <span>{t("provider")}</span>
              <strong>{connectionProvider}</strong>
            </div>
            <div>
              <span>{t("focusUnderlying")}</span>
              <strong>{settings.focusUnderlying || t("autoDetect")}</strong>
            </div>
            <div>
              <span>{t("advisorMode")}</span>
              <strong>
                {settings.advisorMode === "llm" ? t("advisorLlm") : t("advisorRules")}
              </strong>
            </div>
          </div>
          {connectionError ? (
            <div className="connection-error">
              <span>{t("connectionError")}</span>
              <strong>{connectionError}</strong>
            </div>
          ) : null}
          <div className="settings-actions">
            <button
              type="button"
              className="button-like"
              onClick={onTestConnection}
              disabled={isConnectionChecking}
            >
              {isConnectionChecking ? t("testingConnection") : t("testConnection")}
            </button>
          </div>
        </article>

        <article className="card settings-card">
          <div className="meta-block">
            <span>{t("providerCapabilities")}</span>
            <strong>{selectedProvider?.label ?? t("providerCapabilitiesDesc")}</strong>
          </div>
          <div className="capability-list">
            {selectedProvider?.supportsSnapshots ? (
              <span className="capability-chip">{t("capabilitySnapshot")}</span>
            ) : null}
            {selectedProvider?.supportsGreeks ? (
              <span className="capability-chip">{t("capabilityGreeks")}</span>
            ) : null}
            {selectedProvider?.supportsScenarios ? (
              <span className="capability-chip">{t("capabilityScenarios")}</span>
            ) : null}
            {selectedProvider?.supportsOptionChain ? (
              <span className="capability-chip">{t("capabilityGroupedRisk")}</span>
            ) : null}
          </div>
          <div className="provider-note">
            <span>{t("providerNotes")}</span>
            <strong>{selectedProvider?.notes ?? t("providerCapabilitiesDesc")}</strong>
          </div>
          <label className="field-stack">
            <span>{t("apiKeyPlaceholder")}</span>
            <input
              className="settings-input"
              type="password"
              placeholder={
                selectedProvider?.requiresApiKey
                  ? t("apiKeyRequired")
                  : t("apiKeyOptional")
              }
              disabled={!selectedProvider?.requiresApiKey}
            />
          </label>
        </article>
      </div>
      <form className="settings-form" onSubmit={handleSubmit}>
        <label className="field-stack">
          <span>{t("apiBaseUrl")}</span>
          <input
            className="settings-input"
            value={settings.apiBaseUrl}
            onChange={handleChange("apiBaseUrl")}
          />
        </label>
        <label className="field-stack">
          <span>{t("focusUnderlying")}</span>
          <input
            className="settings-input"
            value={settings.focusUnderlying}
            onChange={handleChange("focusUnderlying")}
            placeholder={t("focusUnderlyingPlaceholder")}
          />
        </label>
        <label className="field-stack">
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
        <label className="field-stack">
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
    </PanelSection>
  );
}
