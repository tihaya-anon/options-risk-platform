import type { SnapshotProvider } from "../types.js";
import { mockProvider } from "./mockProvider.js";
import { yahooSyntheticProvider } from "./yahooSyntheticProvider.js";

const providers: Record<string, SnapshotProvider> = {
  mock: mockProvider,
  yahooSynthetic: yahooSyntheticProvider,
};

export function getProvider(name: string): SnapshotProvider {
  return providers[name] ?? providers.mock;
}

export function listProviders(): SnapshotProvider[] {
  return Object.values(providers);
}
