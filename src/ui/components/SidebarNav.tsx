import { NavLink } from "react-router-dom";

export interface SidebarNavItem {
  path: string;
  label: string;
}

export function SidebarNav({ items }: { items: SidebarNavItem[] }) {
  return (
    <aside className="sidebar card">
      <div className="sidebar-head">
        <span className="sidebar-kicker">Options Risk</span>
        <strong className="sidebar-title">Workbench</strong>
      </div>
      <nav className="sidebar-nav" aria-label="Section navigation">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
