import type { EnrichedOptionQuote } from "@/types";
import { formatNumber, formatPercent, formatPrice, formatQuantity, formatStrike } from "@/ui/format";
import type { I18nKey } from "@/ui/i18n";
import { GreekMetricCard } from "@/ui/components/shared/GreekMetricCard";

export function QuoteCard({
  row,
  t,
  accentColor,
  isSelected = false,
  onSelect,
}: {
  row: EnrichedOptionQuote;
  t: (key: I18nKey) => string;
  accentColor: string;
  isSelected?: boolean;
  onSelect?: (symbol: string) => void;
}) {
  return (
    <article
      className={`quote-card card${onSelect ? " quote-card-clickable" : ""}${isSelected ? " is-selected" : ""}`}
      style={{ borderLeftColor: accentColor }}
      onClick={() => onSelect?.(row.symbol)}
      onKeyDown={(event) => {
        if (!onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(row.symbol);
        }
      }}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="quote-top">
        <span className="pill" style={{ color: accentColor }}>
          {row.optionType === "call" ? t("call") : t("put")}
        </span>
        <span className="quote-expiry">{row.expiry}</span>
      </div>
      <h3 className="quote-strike">
        {t("strike")} {formatStrike(row.strike)}
      </h3>
      <p className="quote-mid">
        {t("mid")} {formatPrice(row.mid)}
      </p>
      <div className="quote-stats">
        <div>
          <span>{row.optionType === "call" ? t("callIv") : t("putIv")}</span>
          <strong>{formatPercent(row.impliedVol)}</strong>
        </div>
        <div>
          <span>{t("oi")}</span>
          <strong>{formatQuantity(row.openInterest)}</strong>
        </div>
        <div className="quote-greek-cell">
          <GreekMetricCard
            greek="delta"
            value={formatNumber(row.delta, 3)}
            t={t}
          />
        </div>
        <div className="quote-greek-cell">
          <GreekMetricCard
            greek="gamma"
            value={formatNumber(row.gamma, 4)}
            t={t}
          />
        </div>
        <div className="quote-greek-cell">
          <GreekMetricCard
            greek="vega"
            value={formatNumber(row.vega, 3)}
            t={t}
          />
        </div>
        <div className="quote-greek-cell">
          <GreekMetricCard
            greek="theta"
            value={formatNumber(row.theta, 3)}
            t={t}
          />
        </div>
      </div>
    </article>
  );
}
