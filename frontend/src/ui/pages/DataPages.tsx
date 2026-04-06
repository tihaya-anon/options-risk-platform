import type { FrontendSettings } from "@/types";
import type { BookSnapshot } from "@/api/generated/model/bookSnapshot";
import type { StaticDatasetInfo } from "@/lib/staticWorkbench";
import type { PortfolioExposure } from "@/ui/positions";
import type { I18nKey } from "@/ui/i18n";
import { CurrentBookSection } from "@/ui/components/data/CurrentBookSection";
import { DataWorkspaceSection } from "@/ui/components/data/DataWorkspaceSection";
import { PortfolioPositionsSection } from "@/ui/components/data/PortfolioPositionsSection";
import { SettingsSection } from "@/ui/components/data/SettingsSection";

export function DataWorkspacePage({
  isStaticMode,
  staticDataset,
  settings,
  connectionStatus,
  positionsCount,
  parseErrorCount,
  unmatchedCount,
  t,
}: {
  isStaticMode: boolean;
  staticDataset: StaticDatasetInfo | null;
  settings: FrontendSettings;
  connectionStatus: "connected" | "degraded";
  positionsCount: number;
  parseErrorCount: number;
  unmatchedCount: number;
  t: (key: I18nKey) => string;
}) {
  return (
    <DataWorkspaceSection
      isStaticMode={isStaticMode}
      staticDataset={staticDataset}
      settings={settings}
      connectionStatus={connectionStatus}
      positionsCount={positionsCount}
      parseErrorCount={parseErrorCount}
      unmatchedCount={unmatchedCount}
      t={t}
    />
  );
}

export function CurrentBookPage({
  book,
  t,
}: {
  book: BookSnapshot | null;
  t: (key: I18nKey) => string;
}) {
  return <CurrentBookSection book={book} t={t} />;
}

export function PositionsPage({
  positionsInput,
  exposure,
  parseErrors,
  t,
  palette,
  onPositionsInputChange,
  onFileUpload,
}: {
  positionsInput: string;
  exposure: PortfolioExposure;
  parseErrors: string[];
  t: (key: I18nKey) => string;
  palette: { up: string; down: string; neutral: string; accent: string };
  onPositionsInputChange: (value: string) => void;
  onFileUpload: (file: File) => void;
}) {
  return (
    <PortfolioPositionsSection
      positionsInput={positionsInput}
      exposure={exposure}
      parseErrors={parseErrors}
      t={t}
      palette={palette}
      onPositionsInputChange={onPositionsInputChange}
      onFileUpload={onFileUpload}
    />
  );
}

export function SettingsPage({
  settings,
  providers,
  advisorModes,
  providerMetadata,
  connectionStatus,
  connectionProvider,
  connectionError,
  isConnectionChecking,
  isStaticMode,
  staticDataset,
  t,
  onSettingsChange,
  onSave,
  onTestConnection,
}: {
  settings: FrontendSettings;
  providers: string[];
  advisorModes: string[];
  providerMetadata: any[];
  connectionStatus: "connected" | "degraded";
  connectionProvider: string;
  connectionError: string | null;
  isConnectionChecking: boolean;
  isStaticMode: boolean;
  staticDataset: StaticDatasetInfo | null;
  t: (key: I18nKey) => string;
  onSettingsChange: (settings: FrontendSettings) => void;
  onSave: () => void;
  onTestConnection: () => void;
}) {
  return (
    <SettingsSection
      settings={settings}
      providers={providers}
      advisorModes={advisorModes}
      providerMetadata={providerMetadata}
      connectionStatus={connectionStatus}
      connectionProvider={connectionProvider}
      connectionError={connectionError}
      isConnectionChecking={isConnectionChecking}
      isStaticMode={isStaticMode}
      staticDataset={staticDataset}
      t={t}
      onSettingsChange={onSettingsChange}
      onSave={onSave}
      onTestConnection={onTestConnection}
    />
  );
}
