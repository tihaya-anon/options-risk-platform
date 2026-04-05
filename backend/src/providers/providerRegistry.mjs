import { mockProvider } from "./mockProvider.mjs";
import { yahooSyntheticProvider } from "./yahooSyntheticProvider.mjs";

const providers = {
  mock: mockProvider,
  yahooSynthetic: yahooSyntheticProvider,
};

export function getProvider(name) {
  return providers[name] ?? providers.mock;
}
