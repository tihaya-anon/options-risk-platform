import type { EnrichedOptionQuote } from "@/types";
import type { ChartTheme } from "@/ui/chartTheme";
import { groupByUnderlyingAndExpiry } from "@/ui/format";
import type { I18nKey } from "@/ui/i18n";
import { SkewCard } from "./SkewCard";

export function SkewSection({
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
  const grouped = groupByUnderlyingAndExpiry(rows);

  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("skewTitle")}</h2>
          <p>{t("skewDesc")}</p>
        </div>
      </div>
      <div className="surface-grid">
        {[...grouped.entries()].map(([key, group]) => (
          <SkewCard
            key={key}
            expiry={group.expiry}
            underlying={group.underlying}
            rows={group.rows}
            upColor={upColor}
            downColor={downColor}
            chartTheme={chartTheme}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
