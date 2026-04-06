import { Link } from "react-router-dom";

export interface ActionRailItem {
  to: string;
  label: string;
  caption: string;
}

export function ActionRail({
  title,
  items,
}: {
  title: string;
  items: ActionRailItem[];
}) {
  return (
    <section className="action-rail">
      <div className="meta-block">
        <span>{title}</span>
      </div>
      <div className="action-rail-grid">
        {items.map((item) => (
          <Link key={`${item.to}-${item.label}`} to={item.to} className="card action-rail-card">
            <strong>{item.label}</strong>
            <span>{item.caption}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
