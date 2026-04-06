import type { EnrichedOptionQuote } from "@/types";
import type { I18nKey } from "@/ui/i18n";
import { formatStrike } from "@/ui/format";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { QuoteCard } from "./QuoteCard";
import { SelectField } from "@/ui/components/shared/SelectField";

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

function getSortValue(row: EnrichedOptionQuote, sortKey: ChainSortKey) {
  switch (sortKey) {
    case "expiry":
      return row.expiry;
    case "strike":
      return row.strike;
    case "iv":
      return row.impliedVol ?? Number.NEGATIVE_INFINITY;
    case "oi":
      return row.openInterest;
    case "mid":
      return row.mid;
    case "delta":
      return row.delta ?? Number.NEGATIVE_INFINITY;
    case "gamma":
      return row.gamma ?? Number.NEGATIVE_INFINITY;
    case "vega":
      return row.vega ?? Number.NEGATIVE_INFINITY;
    case "theta":
      return row.theta ?? Number.NEGATIVE_INFINITY;
    case "optionType":
      return row.optionType;
    default:
      return row.expiry;
  }
}

function compareRows(
  left: EnrichedOptionQuote,
  right: EnrichedOptionQuote,
  sortKey: ChainSortKey,
  direction: SortDirection,
) {
  const leftValue = getSortValue(left, sortKey);
  const rightValue = getSortValue(right, sortKey);

  let result = 0;
  if (typeof leftValue === "number" && typeof rightValue === "number") {
    result = leftValue - rightValue;
  } else {
    result = String(leftValue).localeCompare(String(rightValue));
  }

  if (result === 0) {
    result =
      left.expiry.localeCompare(right.expiry) ||
      left.optionType.localeCompare(right.optionType) ||
      left.strike - right.strike;
  }

  return direction === "asc" ? result : -result;
}

export function ChainSection({
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
  onSelectSymbol?: (symbol: string) => void;
}) {
  const sortedRows = rows
    .slice()
    .sort((left, right) => compareRows(left, right, cardSortKey, cardSortDirection));
  const tableRows = rows
    .slice()
    .sort((left, right) => compareRows(left, right, tableSortKey, tableSortDirection));

  const cardSortOptions: Array<{ value: ChainSortKey; label: string }> = [
    { value: "expiry", label: t("sortExpiry") },
    { value: "strike", label: t("sortStrike") },
    { value: "iv", label: t("sortIv") },
    { value: "oi", label: t("sortOi") },
  ];

  const renderSortHeader = (label: string, key: ChainSortKey) => (
    <button
      type="button"
      className="table-sort-button"
      onClick={() => {
        if (tableSortKey === key) {
          onTableSortDirectionChange(tableSortDirection === "asc" ? "desc" : "asc");
        } else {
          onTableSortKeyChange(key);
          onTableSortDirectionChange("asc");
        }
      }}
    >
      {label}
      <span className="table-sort-indicator">
        {tableSortKey === key ? (tableSortDirection === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );

  return (
    <PanelSection
      title={t("chainTitle")}
      description={t("chainDesc")}
      actions={
        <div className="chain-actions">
          <label className="field-stack grouped-select">
            <span>{t("chainView")}</span>
            <SelectField
              value={viewMode}
              onChange={onViewModeChange}
              options={[
                { value: "cards", label: t("chainViewCards") },
                { value: "table", label: t("chainViewTable") },
              ]}
            />
          </label>
          {viewMode === "cards" ? (
            <>
              <label className="field-stack grouped-select">
                <span>{t("sortBy")}</span>
                <SelectField
                  value={cardSortKey}
                  onChange={onCardSortKeyChange}
                  options={cardSortOptions}
                />
              </label>
              <label className="field-stack grouped-select">
                <span>{t("groupBy")}</span>
                <SelectField
                  value={cardSortDirection}
                  onChange={onCardSortDirectionChange}
                  options={[
                    { value: "asc", label: t("sortAscending") },
                    { value: "desc", label: t("sortDescending") },
                  ]}
                />
              </label>
            </>
          ) : null}
        </div>
      }
    >
      {viewMode === "cards" ? (
        <div className="quote-grid">
          {sortedRows.map((row) => (
            <QuoteCard
              key={row.symbol}
              row={row}
              t={t}
              accentColor={row.optionType === "call" ? upColor : downColor}
              isSelected={row.symbol === selectedSymbol}
              onSelect={onSelectSymbol}
            />
          ))}
        </div>
      ) : (
        <div className="book-table-wrap custom-scrollbar">
          <table className="book-table chain-table">
            <thead>
              <tr>
                <th>{renderSortHeader(`${t("call")}/${t("put")}`, "optionType")}</th>
                <th>{renderSortHeader(t("strike"), "strike")}</th>
                <th>{renderSortHeader(t("mid"), "mid")}</th>
                <th>{renderSortHeader(t("impliedVolatility"), "iv")}</th>
                <th>{renderSortHeader(t("delta"), "delta")}</th>
                <th>{renderSortHeader(t("gamma"), "gamma")}</th>
                <th>{renderSortHeader(t("vega"), "vega")}</th>
                <th>{renderSortHeader(t("theta"), "theta")}</th>
                <th>{renderSortHeader(t("oi"), "oi")}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr
                  key={row.symbol}
                  className={`chain-row-clickable${row.symbol === selectedSymbol ? " is-selected" : ""}`}
                  onClick={() => onSelectSymbol?.(row.symbol)}
                >
                  <td>{row.optionType === "call" ? t("call") : t("put")}</td>
                  <td>{formatStrike(row.strike)}</td>
                  <td>{row.mid.toFixed(2)}</td>
                  <td>{row.impliedVol === null ? "n/a" : `${(row.impliedVol * 100).toFixed(2)}%`}</td>
                  <td>{row.delta === null ? "n/a" : row.delta.toFixed(3)}</td>
                  <td>{row.gamma === null ? "n/a" : row.gamma.toFixed(4)}</td>
                  <td>{row.vega === null ? "n/a" : row.vega.toFixed(3)}</td>
                  <td>{row.theta === null ? "n/a" : row.theta.toFixed(3)}</td>
                  <td>{row.openInterest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelSection>
  );
}
