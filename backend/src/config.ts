export function loadConfig() {
  return {
    port: Number(process.env.PORT ?? 8787),
    provider: process.env.DATA_PROVIDER ?? "yahooSynthetic",
    defaultSymbol: process.env.DEFAULT_SYMBOL ?? "SPY",
    riskFreeRate: Number(process.env.RISK_FREE_RATE ?? 0.045),
    llmAdvisorMode: process.env.LLM_ADVISOR_MODE ?? "disabled",
  };
}
