import type { EnrichedOptionQuote } from "../../types";
import { groupByExpiry } from "../format";
import type { I18nKey } from "../i18n";
import { SkewCard } from "./SkewCard";

export function SkewSection({
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
  const grouped = groupByExpiry(rows);

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("skewTitle")}</h2>
          <p>{t("skewDesc")}</p>
        </div>
      </div>
      <div className="surface-grid">
        {[...grouped.entries()].map(([expiry, expiryRows]) => (
          <SkewCard
            key={expiry}
            expiry={expiry}
            rows={expiryRows}
            upColor={upColor}
            downColor={downColor}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
