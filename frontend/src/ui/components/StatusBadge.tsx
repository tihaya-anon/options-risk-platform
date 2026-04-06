export function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "positive" | "warning" | "critical" | "info";
}) {
  return <span className={`status-badge ${tone}`}>{label}</span>;
}
