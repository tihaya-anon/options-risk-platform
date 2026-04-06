import { PanelSection } from "@/ui/components/layout/PanelSection";

export function StatusPanel({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <PanelSection title={title} description={message} className="status-panel">
      <div />
    </PanelSection>
  );
}
