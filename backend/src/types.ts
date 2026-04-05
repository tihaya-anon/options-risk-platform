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

export interface SnapshotFile {
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
  extends Omit<SnapshotFile, "quotes"> {
  quotes: EnrichedOptionQuote[];
}

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
  portfolioValue: number;
  portfolioPnl: number;
}

export interface SpotScenarioPoint extends ScenarioPoint {
  spot: number;
  spotChangePct: number;
}

export interface VolScenarioPoint extends ScenarioPoint {
  volShift: number;
}

export interface TimeScenarioPoint extends ScenarioPoint {
  daysForward: number;
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

export type GroupByMode =
  | "symbol"
  | "expiry"
  | "optionType"
  | "symbolExpiry"
  | "full";

export interface AdvisorSuggestion {
  risk: string;
  action: string;
  source: string;
}

export interface AnalysisRequest {
  snapshot: EnrichedSnapshotFile;
  positionsInput: string;
  groupByMode?: GroupByMode;
  advisorMode?: string;
}

export interface AnalysisResponse {
  parsedPositions: ParsedPositions;
  exposure: PortfolioExposure;
  spotScenarios: SpotScenarioPoint[];
  volScenarios: VolScenarioPoint[];
  timeScenarios: TimeScenarioPoint[];
  groupedExposures: GroupedExposure[];
  advisor: {
    source: string;
    suggestions: AdvisorSuggestion[];
  };
}

export interface ProviderConfig {
  symbol: string;
  riskFreeRate: number;
}

export interface SnapshotProvider {
  name: string;
  getSnapshot(config: ProviderConfig): Promise<SnapshotFile>;
}
