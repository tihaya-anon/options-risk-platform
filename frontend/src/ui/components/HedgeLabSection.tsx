import type { HedgeProposalResponse } from "../../api/generated/model/hedgeProposalResponse";
import type { HedgeUniverse } from "../../api/generated/model/hedgeUniverse";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import { SelectField } from "./SelectField";

export function HedgeLabSection({
  hedgeLab,
  hedgeTarget,
  hedgeUniverse,
  t,
  onTargetChange,
  onUniverseChange,
}: {
  hedgeLab: HedgeProposalResponse | null;
  hedgeTarget: string;
  hedgeUniverse: HedgeUniverse;
  t: (key: I18nKey) => string;
  onTargetChange: (value: string) => void;
  onUniverseChange: (value: HedgeUniverse) => void;
}) {
  return (
    <PanelSection
      title={t("hedgeLabTitle")}
      description={t("hedgeLabDesc")}
      bodyClassName="risk-map-panel-content"
      actions={
        <div className="chain-actions">
          <label className="field-stack grouped-select">
            <span>{t("hedgeTarget")}</span>
            <SelectField
              value={hedgeTarget}
              onChange={onTargetChange}
              options={[
                { value: "neutralize-delta", label: t("hedgeTargetDelta") },
                { value: "reduce-beta", label: t("hedgeTargetBeta") },
                { value: "tail-protection", label: t("hedgeTargetTail") },
              ]}
            />
          </label>
          <label className="field-stack grouped-select">
            <span>{t("hedgeUniverse")}</span>
            <SelectField
              value={hedgeUniverse}
              onChange={onUniverseChange}
              options={[
                { value: "futuresAndOptions", label: t("hedgeUniverseAll") },
                { value: "futuresOnly", label: t("hedgeUniverseFutures") },
                { value: "optionsOnly", label: t("hedgeUniverseOptions") },
              ]}
            />
          </label>
        </div>
      }
    >
      {!hedgeLab ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <div className="risk-list">
          {hedgeLab.proposals.map((proposal) => (
            <article key={proposal.id} className="card grouped-exposure-card">
              <div className="meta-block">
                <strong>{proposal.label}</strong>
              </div>
              <p className="subtle">{proposal.summary}</p>
              <div className="grouped-stats">
                <div>
                  <span>{t("portfolioDelta")}</span>
                  <strong>{proposal.residualExposure.delta.toFixed(2)}</strong>
                </div>
                <div>
                  <span>{t("netExposure")}</span>
                  <strong>
                    {proposal.residualExposure.netExposure.toFixed(2)}
                  </strong>
                </div>
                <div>
                  <span>{t("grossExposure")}</span>
                  <strong>
                    {proposal.residualExposure.grossExposure.toFixed(2)}
                  </strong>
                </div>
                <div>
                  <span>{t("hedgeCost")}</span>
                  <strong>{(proposal.estimatedCost ?? 0).toFixed(2)}</strong>
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
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="meta-block">
                    <span>{t("hedgeTradeOffs")}</span>
                    <ul className="compact-list">
                      {proposal.rationale.tradeOffs.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="meta-block">
                    <span>{t("hedgeResidualRisks")}</span>
                    <ul className="compact-list">
                      {proposal.rationale.residualRisks.map((item) => (
                        <li key={item}>{item}</li>
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
