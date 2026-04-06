import type { HedgeProposalResponse } from "@/api/generated/model/hedgeProposalResponse";
import type { StrategyComparison } from "@/api/generated/model/strategyComparison";
import type { I18nKey } from "@/ui/i18n";
import type { Language } from "@/ui/config";
import { HedgeDecisionSection } from "@/ui/components/hedge/HedgeDecisionSection";
import { HedgeLabSection } from "@/ui/components/hedge/HedgeLabSection";
import { StrategyCompareSection } from "@/ui/components/hedge/StrategyCompareSection";

export function HedgeSummaryPage({
  hedgeLab,
  comparison,
  language,
  t,
}: {
  hedgeLab: HedgeProposalResponse | null;
  comparison: StrategyComparison | null;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  return (
    <HedgeDecisionSection
      hedgeLab={hedgeLab}
      comparison={comparison}
      language={language}
      t={t}
    />
  );
}

export function HedgeLabPage({
  hedgeLab,
  language,
  t,
}: {
  hedgeLab: HedgeProposalResponse | null;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  return (
    <HedgeLabSection
      hedgeLab={hedgeLab}
      language={language}
      t={t}
    />
  );
}

export function StrategyComparePage({
  comparison,
  selectedProposalId,
  language,
  t,
}: {
  comparison: StrategyComparison | null;
  selectedProposalId?: string;
  language: Language;
  t: (key: I18nKey) => string;
}) {
  return (
    <StrategyCompareSection
      comparison={comparison}
      selectedProposalId={selectedProposalId}
      language={language}
      t={t}
    />
  );
}
