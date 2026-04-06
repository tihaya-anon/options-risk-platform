import { NavLink } from "react-router-dom";

export interface SidebarNavItem {
  path: string;
  label: string;
}

export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
  tone?: "default" | "muted";
}

export function SidebarNav({
  groups,
  kicker,
}: {
  groups: SidebarNavGroup[];
  kicker: string;
}) {
  return (
    <aside className="sidebar card">
      <div className="sidebar-inner custom-scrollbar">
        {kicker && (
          <div className="sidebar-head">
            <span className="sidebar-kicker">{kicker}</span>
          </div>
        )}
        {groups.map((group) => (
          <div
            key={group.title}
            className={`sidebar-group${group.tone === "muted" ? " muted" : ""}`}
          >
            <span className="sidebar-group-title">{group.title}</span>
            <nav className="sidebar-nav" aria-label={group.title}>
              {group.items.map((item) => (
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
          </div>
        ))}
      </div>
    </aside>
  );
}
