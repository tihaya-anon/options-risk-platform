import type { EnrichedOptionQuote } from "../../types";
import type { I18nKey } from "../i18n";
import { QuoteCard } from "./QuoteCard";

export function ChainSection({
  rows,
  upColor,
  downColor,
  t,
}: {
  rows: EnrichedOptionQuote[];
  upColor: string;
  downColor: string;
  t: (key: I18nKey) => string;
}) {
  const sortedRows = rows
    .slice()
    .sort(
      (left, right) =>
        left.expiry.localeCompare(right.expiry) ||
        left.strike - right.strike ||
        left.optionType.localeCompare(right.optionType)
    );

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("chainTitle")}</h2>
          <p>{t("chainDesc")}</p>
        </div>
      </div>
      <div className="quote-grid">
        {sortedRows.map((row) => (
          <QuoteCard
            key={row.symbol}
            row={row}
            t={t}
            accentColor={row.optionType === "call" ? upColor : downColor}
          />
        ))}
      </div>
    </section>
  );
}
