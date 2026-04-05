import type { ReactNode } from "react";

export function PanelSection({
  title,
  description,
  actions,
  className = "",
  bodyClassName = "",
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const shellClassName = ["panel", "card", className].filter(Boolean).join(" ");
  const contentClassName = ["panel-content", "custom-scrollbar", bodyClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={shellClassName}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {actions}
      </div>
      <div className={contentClassName}>{children}</div>
    </section>
  );
}
