import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8787/api";

export const handlers = [
  http.get(`${API_BASE_URL}/health`, () =>
    HttpResponse.json({ ok: true, provider: "mock" })
  ),
  http.get(`${API_BASE_URL}/config`, () =>
    HttpResponse.json({
      provider: "mock",
      defaultSymbol: "SPY",
      llmAdvisorMode: "disabled",
      providers: ["mock", "yahooSynthetic"],
      advisorModes: ["rules", "llm"],
    })
  ),
];
