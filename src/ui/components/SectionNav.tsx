export interface SectionNavItem {
  id: string;
  label: string;
}

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  return (
    <nav className="section-nav card" aria-label="Section navigation">
      {items.map((item) => (
        <a key={item.id} className="section-link" href={`#${item.id}`}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
