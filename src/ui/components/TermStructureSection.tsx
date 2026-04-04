import type { EnrichedOptionQuote } from "../../types";
import type { I18nKey } from "../i18n";
import { SparkLine } from "./SparkLine";

export function TermStructureSection({
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
  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("termTitle")}</h2>
          <p>{t("termDesc")}</p>
        </div>
        <div className="legend">
          <span><i className="legend-swatch" style={{ background: upColor }} />{t("callIv")}</span>
          <span><i className="legend-swatch" style={{ background: downColor }} />{t("putIv")}</span>
        </div>
      </div>
      <div className="term-grid">
        <article className="surface-card card">
          <span className="subtle">{t("callIv")}</span>
          <SparkLine rows={rows} optionType="call" color={upColor} />
        </article>
        <article className="surface-card card">
          <span className="subtle">{t("putIv")}</span>
          <SparkLine rows={rows} optionType="put" color={downColor} />
        </article>
      </div>
    </section>
  );
}
