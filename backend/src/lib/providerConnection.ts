import type { ProviderTestResponse, SnapshotProvider } from "../types.js";

export async function testProviderConnection(
  provider: SnapshotProvider,
  symbol: string,
  riskFreeRate: number,
): Promise<ProviderTestResponse> {
  const startedAt = Date.now();

  try {
    const snapshot = await provider.getSnapshot({ symbol, riskFreeRate });
    return {
      ok: true,
      provider: provider.metadata.id,
      symbol,
      latencyMs: Date.now() - startedAt,
      error: null,
      source: snapshot.source,
      generatedAt: snapshot.generatedAt,
    };
  } catch (error) {
    return {
      ok: false,
      provider: provider.metadata.id,
      symbol,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Unknown provider error",
      source: null,
      generatedAt: null,
    };
  }
}
