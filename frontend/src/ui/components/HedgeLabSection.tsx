import type { HedgeProposalResponse } from "../../api/generated/model/hedgeProposalResponse";
import type { I18nKey } from "../i18n";
import { PanelSection } from "./PanelSection";
import { SelectField } from "./SelectField";

export function HedgeLabSection({
  hedgeLab,
  hedgeTarget,
  t,
  onTargetChange,
}: {
  hedgeLab: HedgeProposalResponse | null;
  hedgeTarget: string;
  t: (key: I18nKey) => string;
  onTargetChange: (value: string) => void;
}) {
  return (
    <PanelSection
      title={t("hedgeLabTitle")}
      description={t("hedgeLabDesc")}
      bodyClassName="risk-map-panel-content"
      actions={
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
      }
    >
      {!hedgeLab ? (
        <div className="empty-state">{t("loading")}</div>
      ) : (
        <div className="risk-list">
          {hedgeLab.proposals.map((proposal) => (
            <article key={proposal.id} className="card grouped-exposure-card">
              <div className="meta-block">
                <span>{proposal.hedgeType}</span>
                <strong>{proposal.label}</strong>
              </div>
              <p className="subtle">{proposal.summary}</p>
              <div className="grouped-stats">
                <div><span>{t("portfolioDelta")}</span><strong>{proposal.residualExposure.delta.toFixed(2)}</strong></div>
                <div><span>{t("netExposure")}</span><strong>{proposal.residualExposure.netExposure.toFixed(2)}</strong></div>
                <div><span>{t("grossExposure")}</span><strong>{proposal.residualExposure.grossExposure.toFixed(2)}</strong></div>
                <div><span>{t("hedgeCost")}</span><strong>{(proposal.estimatedCost ?? 0).toFixed(2)}</strong></div>
                <div><span>{t("hedgeInstrument")}</span><strong>{proposal.instrument ?? t("none")}</strong></div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PanelSection>
  );
}
