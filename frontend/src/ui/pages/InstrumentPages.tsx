import type { EnrichedOptionQuote } from "@/types";
import type { ChartTheme } from "@/ui/chartTheme";
import type { I18nKey } from "@/ui/i18n";
import { ChainSection } from "@/ui/components/instruments/ChainSection";
import { InstrumentWorkbenchSection } from "@/ui/components/instruments/InstrumentWorkbenchSection";
import { OptionRiskProfileSection } from "@/ui/components/instruments/OptionRiskProfileSection";
import { SkewSection } from "@/ui/components/instruments/SkewSection";
import { TermStructureSection } from "@/ui/components/instruments/TermStructureSection";

type ChainSortKey =
  | "expiry"
  | "strike"
  | "iv"
  | "oi"
  | "mid"
  | "delta"
  | "gamma"
  | "vega"
  | "theta"
  | "optionType";

type SortDirection = "asc" | "desc";

export function InstrumentsSummaryPage({
  rows,
  focusUnderlying,
  selectedSymbol,
  t,
}: {
  rows: EnrichedOptionQuote[];
  focusUnderlying: string;
  selectedSymbol: string;
  t: (key: I18nKey) => string;
}) {
  return (
    <InstrumentWorkbenchSection
      rows={rows}
      focusUnderlying={focusUnderlying}
      selectedSymbol={selectedSymbol}
      t={t}
    />
  );
}

export function OptionRiskProfilePage({
  rows,
  selectedSymbol,
  chartTheme,
  accentColor,
  t,
  onSelectSymbol,
}: {
  rows: EnrichedOptionQuote[];
  selectedSymbol: string;
  chartTheme: ChartTheme;
  accentColor: string;
  t: (key: I18nKey) => string;
  onSelectSymbol: (value: string) => void;
}) {
  return (
    <OptionRiskProfileSection
      rows={rows}
      selectedSymbol={selectedSymbol}
      chartTheme={chartTheme}
      accentColor={accentColor}
      t={t}
      onSelectSymbol={onSelectSymbol}
    />
  );
}

export function ChainPage({
  rows,
  upColor,
  downColor,
  selectedSymbol,
  viewMode,
  cardSortKey,
  cardSortDirection,
  tableSortKey,
  tableSortDirection,
  t,
  onViewModeChange,
  onCardSortKeyChange,
  onCardSortDirectionChange,
  onTableSortKeyChange,
  onTableSortDirectionChange,
  onSelectSymbol,
}: {
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  selectedSymbol: string;
  viewMode: "cards" | "table";
  cardSortKey: ChainSortKey;
  cardSortDirection: SortDirection;
  tableSortKey: ChainSortKey;
  tableSortDirection: SortDirection;
  t: (key: I18nKey) => string;
  onViewModeChange: (value: "cards" | "table") => void;
  onCardSortKeyChange: (value: ChainSortKey) => void;
  onCardSortDirectionChange: (value: SortDirection) => void;
  onTableSortKeyChange: (value: ChainSortKey) => void;
  onTableSortDirectionChange: (value: SortDirection) => void;
  onSelectSymbol: (symbol: string) => void;
}) {
  return (
    <ChainSection
      rows={rows}
      upColor={upColor}
      downColor={downColor}
      selectedSymbol={selectedSymbol}
      viewMode={viewMode}
      cardSortKey={cardSortKey}
      cardSortDirection={cardSortDirection}
      tableSortKey={tableSortKey}
      tableSortDirection={tableSortDirection}
      t={t}
      onViewModeChange={onViewModeChange}
      onCardSortKeyChange={onCardSortKeyChange}
      onCardSortDirectionChange={onCardSortDirectionChange}
      onTableSortKeyChange={onTableSortKeyChange}
      onTableSortDirectionChange={onTableSortDirectionChange}
      onSelectSymbol={onSelectSymbol}
    />
  );
}

export function TermStructurePage({
  rows,
  upColor,
  downColor,
  chartTheme,
  t,
}: {
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  chartTheme: ChartTheme;
  t: (key: I18nKey) => string;
}) {
  return (
    <TermStructureSection
      rows={rows}
      upColor={upColor}
      downColor={downColor}
      chartTheme={chartTheme}
      t={t}
    />
  );
}

export function SkewPage({
  rows,
  upColor,
  downColor,
  chartTheme,
  t,
}: {
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  chartTheme: ChartTheme;
  t: (key: I18nKey) => string;
}) {
  return (
    <SkewSection
      rows={rows}
      upColor={upColor}
      downColor={downColor}
      chartTheme={chartTheme}
      t={t}
    />
  );
}
