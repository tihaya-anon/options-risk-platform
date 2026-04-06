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

export interface EnrichedSnapshotFile
  extends Omit<OptionSnapshotFile, "quotes"> {
  quotes: EnrichedOptionQuote[];
}

export interface Greeks {
  price: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
}

export type GroupByMode =
  | "symbol"
  | "expiry"
  | "optionType"
  | "symbolExpiry"
  | "full";

export interface ImportedPosition {
  symbol: string;
  quantity: number;
}

export interface ParsedPositions {
  positions: ImportedPosition[];
  errors: string[];
}

export interface PortfolioExposure {
  netDelta: number;
  netGamma: number;
  netVega: number;
  netTheta: number;
  marketValue: number;
  unmatchedSymbols: string[];
}

export interface ScenarioPoint {
  spot: number;
  spotChangePct: number;
  portfolioValue: number;
  portfolioPnl: number;
}

export interface VolScenarioPoint {
  volShift: number;
  portfolioValue: number;
  portfolioPnl: number;
}

export interface TimeScenarioPoint {
  daysForward: number;
  portfolioValue: number;
  portfolioPnl: number;
}

export interface GroupedExposure {
  bucket: string;
  quantity: number;
  marketValue: number;
  netDelta: number;
  netGamma: number;
  netVega: number;
  netTheta: number;
}

export interface AdvisorSuggestion {
  risk: string;
  action: string;
  source: string;
}

export interface AnalysisResponse {
  parsedPositions: ParsedPositions;
  exposure: PortfolioExposure;
  spotScenarios: ScenarioPoint[];
  volScenarios: VolScenarioPoint[];
  timeScenarios: TimeScenarioPoint[];
  groupedExposures: GroupedExposure[];
  advisor: {
    source: string;
    suggestions: AdvisorSuggestion[];
  };
}

export interface FrontendSettings {
  apiBaseUrl: string;
  focusUnderlying: string;
  provider: string;
  advisorMode: string;
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
