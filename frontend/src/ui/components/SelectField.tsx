import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export function SelectField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuStyle, setMenuStyle] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = containerRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setMenuStyle({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [isOpen, options.length, value]);

  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={`select-field ${isOpen ? "open" : ""}`} ref={containerRef}>
      <button
        type="button"
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selected.label}</span>
        <i className={`select-chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && menuStyle
        ? createPortal(
            <div
              className="select-menu select-menu-portal"
              ref={menuRef}
              role="listbox"
              style={{
                position: "fixed",
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
              }}
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`select-option ${option.value === value ? "active" : ""}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
