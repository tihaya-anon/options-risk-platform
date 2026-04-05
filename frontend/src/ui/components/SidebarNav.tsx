import { NavLink } from "react-router-dom";

export interface SidebarNavItem {
  path: string;
  label: string;
}

export interface SidebarNavGroup {
  title: string;
  items: SidebarNavItem[];
}

export function SidebarNav({ groups }: { groups: SidebarNavGroup[] }) {
  return (
    <aside className="sidebar card">
      <div className="sidebar-inner custom-scrollbar">
        <div className="sidebar-head">
          <span className="sidebar-kicker">Options Risk</span>
          <strong className="sidebar-title">Workbench</strong>
        </div>
        {groups.map((group) => (
          <div key={group.title} className="sidebar-group">
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
