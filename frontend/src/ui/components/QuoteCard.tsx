import type { EnrichedOptionQuote } from "../../types";
import { formatNumber, formatPercent } from "../format";
import type { I18nKey } from "../i18n";

export function QuoteCard({
  row,
  t,
  accentColor,
  onSelect,
}: {
  row: EnrichedOptionQuote;
  t: (key: I18nKey) => string;
  accentColor: string;
  onSelect?: (symbol: string) => void;
}) {
  return (
    <article
      className={`quote-card card${onSelect ? " quote-card-clickable" : ""}`}
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
        {t("strike")} {row.strike.toFixed(0)}
      </h3>
      <p className="quote-mid">
        {t("mid")} {row.mid.toFixed(2)}
      </p>
      <div className="quote-stats">
        <div><span>{row.optionType === "call" ? t("callIv") : t("putIv")}</span><strong>{formatPercent(row.impliedVol)}</strong></div>
        <div><span>{t("delta")}</span><strong>{formatNumber(row.delta, 3)}</strong></div>
        <div><span>{t("gamma")}</span><strong>{formatNumber(row.gamma, 4)}</strong></div>
        <div><span>{t("vega")}</span><strong>{formatNumber(row.vega, 3)}</strong></div>
        <div><span>{t("theta")}</span><strong>{formatNumber(row.theta, 3)}</strong></div>
        <div><span>{t("oi")}</span><strong>{row.openInterest}</strong></div>
      </div>
    </article>
  );
}
