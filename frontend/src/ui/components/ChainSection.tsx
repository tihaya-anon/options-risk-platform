import { useState } from "react";
import type { EnrichedOptionQuote } from "../../types";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import { QuoteCard } from "./QuoteCard";
import { SelectField } from "./SelectField";

export function ChainSection({
  rows,
  upColor,
  downColor,
  t,
  onSelectSymbol,
}: {
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  t: (key: I18nKey) => string;
  onSelectSymbol?: (symbol: string) => void;
}) {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const sortedRows = rows
    .slice()
    .sort(
      (left, right) =>
        left.expiry.localeCompare(right.expiry) ||
        left.strike - right.strike ||
        left.optionType.localeCompare(right.optionType)
    );

  return (
    <PanelSection
      title={t("chainTitle")}
      description={t("chainDesc")}
      actions={
        <label className="field-stack grouped-select">
          <span>{t("chainView")}</span>
          <SelectField
            value={viewMode}
            onChange={(value: "cards" | "table") => setViewMode(value)}
            options={[
              { value: "cards", label: t("chainViewCards") },
              { value: "table", label: t("chainViewTable") },
            ]}
          />
        </label>
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
              onSelect={onSelectSymbol}
            />
          ))}
        </div>
      ) : (
        <div className="book-table-wrap custom-scrollbar">
          <table className="book-table chain-table">
            <thead>
              <tr>
                <th>{t("call")}/{t("put")}</th>
                <th>{t("strike")}</th>
                <th>{t("mid")}</th>
                <th>{t("impliedVolatility")}</th>
                <th>{t("delta")}</th>
                <th>{t("gamma")}</th>
                <th>{t("vega")}</th>
                <th>{t("theta")}</th>
                <th>{t("oi")}</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.symbol}
                  className="chain-row-clickable"
                  onClick={() => onSelectSymbol?.(row.symbol)}
                >
                  <td>{row.optionType === "call" ? t("call") : t("put")}</td>
                  <td>{row.strike.toFixed(0)}</td>
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
