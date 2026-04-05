import type { Language, Palette, ThemeMode } from "./config";
import type { FrontendSettings } from "../types";
import { DEFAULT_API_BASE_URL } from "../api/client";

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

export function detectFrontendSettings(): FrontendSettings {
  const savedApiBaseUrl =
    localStorage.getItem("orp_api_base_url") ?? DEFAULT_API_BASE_URL;
  const savedSymbol = localStorage.getItem("orp_symbol") ?? "SPY";
  const savedProvider = localStorage.getItem("orp_provider") ?? "mock";
  const savedAdvisorMode =
    localStorage.getItem("orp_advisor_mode") ?? "rules";

  return {
    apiBaseUrl: savedApiBaseUrl,
    symbol: savedSymbol,
    provider: savedProvider,
    advisorMode: savedAdvisorMode,
  };
}
