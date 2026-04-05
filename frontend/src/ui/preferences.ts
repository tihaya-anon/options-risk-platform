import type { Language, Palette, ThemeMode } from "./config";

export function detectLanguage(): Language {
  const saved = localStorage.getItem("orp_language");
  if (saved === "en" || saved === "zh") return saved;
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function detectTheme(): ThemeMode {
  const saved = localStorage.getItem("orp_theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function detectPalette(): Palette {
  const saved = localStorage.getItem("orp_palette");
  if (saved === "us" || saved === "cn" || saved === "amber") return saved;
  return "us";
}
