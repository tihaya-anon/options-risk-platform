export type OptionRight = "call" | "put";

export interface OptionQuote {
  symbol: string;
  underlying: string;
  optionType: OptionRight;
  strike: number;
  expiry: string;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
}

export interface UnderlyingSnapshot {
  symbol: string;
  spot: number;
  currency: string;
  timestamp: string;
}

export interface OptionSnapshotFile {
  source: string;
  generatedAt: string;
  riskFreeRate: number;
  underlying: UnderlyingSnapshot;
  quotes: OptionQuote[];
}

export interface EnrichedOptionQuote extends OptionQuote {
  mid: number;
  timeToExpiryYears: number;
  impliedVol: number | null;
  delta: number | null;
  gamma: number | null;
  vega: number | null;
  theta: number | null;
}

export interface Greeks {
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
}

export interface IvModel {
  readonly name: string;
  price(
    spot: number,
    strike: number,
    rate: number,
    timeToExpiryYears: number,
    volatility: number,
    optionType: OptionRight
  ): number;
  greeks(
    spot: number,
    strike: number,
    rate: number,
    timeToExpiryYears: number,
    volatility: number,
    optionType: OptionRight
  ): Greeks;
  impliedVolatility(
    marketPrice: number,
    spot: number,
    strike: number,
    rate: number,
    timeToExpiryYears: number,
    optionType: OptionRight
  ): number | null;
}
