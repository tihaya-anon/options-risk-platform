import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("echarts")) return "echarts-vendor";
          if (id.includes("react")) return "react-vendor";
          return undefined;
        },
      },
    },
  },
});
