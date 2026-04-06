import type { HedgeProposalResponse } from "@/api/generated/model/hedgeProposalResponse";
import type { I18nKey } from "@/ui/i18n";
import type { Language } from "@/ui/config";
import { PanelSection } from "@/ui/components/layout/PanelSection";
import { StatusBadge } from "@/ui/components/shared/StatusBadge";
import { formatMoney, formatNumber } from "@/ui/format";
import {
  translateHedgeLabel,
  translateHedgeSummary,
  translateHedgeType,
} from "@/ui/i18n";

export function HedgeLabSection({
  hedgeLab,
  language,
  t,
}: {
  hedgeLab: HedgeProposalResponse | null;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  const visibleProposals = hedgeLab?.proposals ?? [];
  const strategyPrimer = [
    { hedgeType: "futuresOverlay", text: t("hedgePrimerFutures") },
    { hedgeType: "protectivePut", text: t("hedgePrimerProtectivePut") },
    { hedgeType: "collar", text: t("hedgePrimerCollar") },
  ] as const;
  const translateRationaleItem = (item: string) => {
    const rationaleMap: Record<string, I18nKey> = {
      "Fastest way to neutralize linear delta and beta with low implementation friction.":
        "hedgeRationaleFuturesWhy",
      "Reduces upside participation almost as much as downside sensitivity.":
        "hedgeRationaleFuturesTradeOff",
      "Gamma, vega, and event-driven gap risk remain in the book.":
        "hedgeRationaleFuturesResidual",
      "Best fit when downside convexity matters more than perfect delta neutrality.":
        "hedgeRationalePutWhy",
      "Premium cost creates negative carry and larger theta bleed.":
        "hedgeRationalePutTradeOff",
      "Upside is retained, but net delta and beta are only partially reduced.":
        "hedgeRationalePutResidual",
      "Balances lower carry with better downside shape than a pure futures overlay.":
        "hedgeRationaleCollarWhy",
      "Surrenders upside beyond the short call strike.":
        "hedgeRationaleCollarTradeOff",
      "Residual downside remains below the put strike and above any unhedged notional.":
        "hedgeRationaleCollarResidual",
    };

    return rationaleMap[item] ? t(rationaleMap[item]) : item;
  };

  return (
    <PanelSection
      title={t("hedgeLabTitle")}
      description={t("hedgeLabDesc")}
      bodyClassName="risk-map-panel-content"
    >
      {!hedgeLab ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <div className="risk-list">
          <article className="card dashboard-column-card">
            <div className="meta-block">
              <span>{t("hedgeStrategyPrimerTitle")}</span>
              <strong>{t("hedgeLabTitle")}</strong>
            </div>
            <p className="subtle">{t("hedgeLabOverviewSummary")}</p>
            <div className="grouped-stats">
              <div>
                <span>{t("strategyLabel")}</span>
                <strong>{visibleProposals.length}</strong>
              </div>
              <div>
                <span>{t("hedgeTypeNone")}</span>
                <strong>{translateHedgeLabel(language, "No hedge")}</strong>
              </div>
            </div>
          </article>

          <div className="dashboard-split-grid">
            {strategyPrimer.map((item) => (
              <article key={item.hedgeType} className="card dashboard-column-card">
                <div className="meta-block">
                  <span>{t("hedgeStrategyPrimerTitle")}</span>
                  <strong>{translateHedgeType(language, item.hedgeType)}</strong>
                </div>
                <p className="subtle">{item.text}</p>
              </article>
            ))}
          </div>

          {visibleProposals.map((proposal) => (
            <article key={proposal.id} className="card grouped-exposure-card">
              <div className="dashboard-card-topline">
                <div className="meta-block">
                  <span>{proposal.instrument ?? t("none")}</span>
                  <strong>{translateHedgeLabel(language, proposal.label)}</strong>
                </div>
                <StatusBadge
                  label={translateHedgeType(language, proposal.hedgeType)}
                  tone={
                    proposal.hedgeType === "protectivePut"
                      ? "warning"
                      : proposal.hedgeType === "collar"
                        ? "info"
                        : proposal.hedgeType === "futuresOverlay"
                          ? "positive"
                          : "neutral"
                  }
                />
              </div>
              <p className="subtle">{translateHedgeSummary(language, proposal.summary)}</p>
              <div className="grouped-stats">
                <div>
                  <span>{t("portfolioDelta")}</span>
                  <strong>{formatNumber(proposal.residualExposure.delta, 2)}</strong>
                </div>
                <div>
                  <span>{t("netExposure")}</span>
                  <strong>{formatMoney(proposal.residualExposure.netExposure)}</strong>
                </div>
                <div>
                  <span>{t("grossExposure")}</span>
                  <strong>{formatMoney(proposal.residualExposure.grossExposure)}</strong>
                </div>
                <div>
                  <span>{t("hedgeCost")}</span>
                  <strong>{formatMoney(proposal.estimatedCost ?? 0)}</strong>
                </div>
                <div>
                  <span>{t("hedgeInstrument")}</span>
                  <strong>{proposal.instrument ?? t("none")}</strong>
                </div>
              </div>
              {proposal.rationale ? (
                <div className="dashboard-split-grid hedge-rationale-grid">
                  <div className="meta-block">
                    <span>{t("hedgeWhy")}</span>
                    <ul className="compact-list">
                      {proposal.rationale.why.map((item) => (
                        <li key={item}>{translateRationaleItem(item)}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="meta-block">
                    <span>{t("hedgeTradeOffs")}</span>
                    <ul className="compact-list">
                      {proposal.rationale.tradeOffs.map((item) => (
                        <li key={item}>{translateRationaleItem(item)}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="meta-block">
                    <span>{t("hedgeResidualRisks")}</span>
                    <ul className="compact-list">
                      {proposal.rationale.residualRisks.map((item) => (
                        <li key={item}>{translateRationaleItem(item)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </PanelSection>
  );
}
