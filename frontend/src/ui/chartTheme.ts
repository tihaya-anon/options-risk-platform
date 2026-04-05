import type { ThemeMode } from "./config";

export interface ChartTheme {
  textColor: string;
  subtleTextColor: string;
  gridLineColor: string;
}

export function getChartTheme(themeMode: ThemeMode): ChartTheme {
  if (themeMode === "dark") {
    return {
      textColor: "#edf2f7",
      subtleTextColor: "#9eb0c2",
      gridLineColor: "rgba(190, 208, 224, 0.14)",
    };
  }

  return {
    textColor: "#1f1812",
    subtleTextColor: "#6b5b4d",
    gridLineColor: "rgba(62, 43, 28, 0.14)",
  };
}
