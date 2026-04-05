import type { BookSnapshot } from "../../api/generated/model/bookSnapshot";
import { formatNumber } from "../format";
import type { I18nKey } from "../i18n";
import { GreekMetricCard } from "./GreekMetricCard";
import { PanelSection } from "./PanelSection";

export function CurrentBookSection({
  book,
  t,
}: {
  book: BookSnapshot | null;
  t: (key: I18nKey) => string;
}) {
  return (
    <PanelSection
      title={t("currentBookTitle")}
      description={t("currentBookDesc")}
      bodyClassName="book-panel-content"
    >
      {!book ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <div className="risk-list">
          {book.positions.map((position) => (
            <article
              key={`${position.instrumentType}-${position.symbol}`}
              className="card grouped-exposure-card"
            >
              <div className="meta-block">
                <span>{position.instrumentType}</span>
                <strong>{position.symbol}</strong>
              </div>
              <div className="grouped-stats">
                <div><span>{t("quantity")}</span><strong>{position.quantity.toFixed(2)}</strong></div>
                <div><span>{t("markPrice")}</span><strong>{position.markPrice.toFixed(2)}</strong></div>
              </div>
              <div className="greek-mini-grid">
                <GreekMetricCard
                  greek="delta"
                  value={formatNumber(position.delta ?? null, 2)}
                  t={t}
                />
                <GreekMetricCard
                  greek="vega"
                  value={formatNumber(position.vega ?? null, 2)}
                  t={t}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </PanelSection>
  );
}
