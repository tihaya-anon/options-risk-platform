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

export interface Position {
  instrumentType: "equity" | "future" | "option" | "cash";
  symbol: string;
  underlying?: string | null;
  quantity: number;
  multiplier: number;
  markPrice: number;
  expiry?: string | null;
  strike?: number | null;
  optionType?: OptionRight | null;
  currency?: string | null;
  delta?: number | null;
  gamma?: number | null;
  vega?: number | null;
  theta?: number | null;
  beta?: number | null;
}

export interface BookSnapshot {
  asOf: string;
  positions: Position[];
  parsingErrors: string[];
}

export interface ExposureSummary {
  marketValue: number;
  grossExposure: number;
  netExposure: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  beta: number;
}

export interface RiskItem {
  category: string;
  severity: "low" | "medium" | "high";
  summary: string;
  details?: string | null;
}

export interface RiskMap {
  exposure: ExposureSummary;
  topRisks: RiskItem[];
  concentrationBySymbol: GroupedExposure[];
  concentrationByExpiry: GroupedExposure[];
}

export interface BookParseRequest {
  positionsInput: string;
  defaultSymbol?: string | null;
  snapshot?: EnrichedSnapshotFile;
}

export interface RiskMapRequest {
  book: BookSnapshot;
}

export type HedgeType = "none" | "futuresOverlay" | "protectivePut" | "collar" | "custom";

export interface HedgeProposal {
  id: string;
  hedgeType: HedgeType;
  label: string;
  summary: string;
  instrument?: string | null;
  hedgeRatio?: number | null;
  estimatedCost?: number | null;
  residualExposure: ExposureSummary;
  notes?: string[];
}

export interface HedgeLabRequest {
  book: BookSnapshot;
  allowedHedgeTypes?: HedgeType[];
  target?: string | null;
}

export interface HedgeProposalResponse {
  baselineExposure: ExposureSummary;
  proposals: HedgeProposal[];
}

export interface StrategyComparisonRow {
  proposalId: string;
  label: string;
  estimatedCost: number;
  residualExposure: ExposureSummary;
  upsideRetention?: number | null;
  downsideProtection?: number | null;
  carryTheta?: number | null;
}

export interface StrategyCompareRequest {
  baselineExposure: ExposureSummary;
  proposals: HedgeProposal[];
}

export interface StrategyComparison {
  baselineExposure: ExposureSummary;
  rows: StrategyComparisonRow[];
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

export interface ProviderMetadata {
  id: string;
  label: string;
  requiresApiKey: boolean;
  supportsSnapshots: boolean;
  supportsOptionChain: boolean;
  supportsGreeks: boolean;
  supportsScenarios: boolean;
  notes: string;
}

export interface SnapshotProvider {
  name: string;
  metadata: ProviderMetadata;
  getSnapshot(config: ProviderConfig): Promise<SnapshotFile>;
}
