import { defineConfig } from "orval";

export default defineConfig({
  optionsRiskPlatform: {
    input: "../openapi/openapi.yaml",
    output: {
      target: "src/api/generated/client.ts",
      schemas: "src/api/generated/model",
      client: "fetch",
      mode: "tags-split",
      mock: {
        type: "msw",
        delay: 150,
        useExamples: true,
      },
      override: {
        mutator: {
          path: "src/api/mutator.ts",
          name: "customFetch",
        },
      },
    },
  },
});
