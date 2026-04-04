import type { I18nKey } from "../i18n";
import type { GroupByMode, GroupedExposure } from "../positions";

export function GroupedExposureSection({
  groups,
  groupByMode,
  t,
  onGroupByModeChange,
}: {
  groups: GroupedExposure[];
  groupByMode: GroupByMode;
  t: (key: I18nKey) => string;
  onGroupByModeChange: (mode: GroupByMode) => void;
}) {
  return (
    <section className="panel card">
      <div className="panel-head">
        <div>
          <h2>{t("groupedExposureTitle")}</h2>
          <p>{t("groupedExposureDesc")}</p>
        </div>
        <label className="toolbar-field grouped-select">
          <span>{t("groupBy")}</span>
          <select
            value={groupByMode}
            onChange={(event) => onGroupByModeChange(event.target.value as GroupByMode)}
          >
            <option value="symbol">{t("groupBySymbol")}</option>
            <option value="expiry">{t("groupByExpiry")}</option>
            <option value="optionType">{t("groupByOptionType")}</option>
            <option value="symbolExpiry">{t("groupBySymbolExpiry")}</option>
            <option value="full">{t("groupByFull")}</option>
          </select>
        </label>
      </div>

      <div className="grouped-exposure-grid">
        {groups.map((group) => (
          <article key={group.bucket} className="card grouped-exposure-card">
            <div className="meta-block">
              <span>{t("bucket")}</span>
              <strong>{group.bucket}</strong>
            </div>
            <div className="grouped-stats">
              <div><span>{t("quantity")}</span><strong>{group.quantity}</strong></div>
              <div><span>{t("marketValue")}</span><strong>{group.marketValue.toFixed(2)}</strong></div>
              <div><span>{t("portfolioDelta")}</span><strong>{group.netDelta.toFixed(2)}</strong></div>
              <div><span>{t("portfolioGamma")}</span><strong>{group.netGamma.toFixed(2)}</strong></div>
              <div><span>{t("portfolioVega")}</span><strong>{group.netVega.toFixed(2)}</strong></div>
              <div><span>{t("portfolioTheta")}</span><strong>{group.netTheta.toFixed(2)}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
