export type Language = "en" | "zh";
export type ThemeMode = "light" | "dark";
export type Palette = "us" | "cn" | "amber";

export const paletteTokens: Record<
  Palette,
  { up: string; down: string; neutral: string; accent: string }
> = {
  us: { up: "#16a34a", down: "#dc2626", neutral: "#64748b", accent: "#ea580c" },
  cn: { up: "#dc2626", down: "#16a34a", neutral: "#64748b", accent: "#ea580c" },
  amber: { up: "#d97706", down: "#2563eb", neutral: "#6b7280", accent: "#7c3aed" },
};
