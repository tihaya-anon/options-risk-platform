import type { Language } from "./config";

export type I18nKey =
  | "appEyebrow"
  | "appTitle"
  | "appLede"
  | "controlTowerTitle"
  | "status"
  | "recommendedAction"
  | "underlying"
  | "spot"
  | "snapshot"
  | "model"
  | "theme"
  | "language"
  | "palette"
  | "light"
  | "dark"
  | "english"
  | "chinese"
  | "settingsTitle"
  | "settingsDesc"
  | "currentBookTitle"
  | "currentBookDesc"
  | "riskMapTitle"
  | "riskMapDesc"
  | "riskControlTitle"
  | "riskControlDesc"
  | "hedgeLabTitle"
  | "hedgeLabDesc"
  | "hedgeDecisionTitle"
  | "hedgeDecisionDesc"
  | "strategyCompareTitle"
  | "strategyCompareDesc"
  | "instrumentWorkbenchTitle"
  | "instrumentWorkbenchDesc"
  | "apiBaseUrl"
  | "symbol"
  | "focusUnderlying"
  | "focusUnderlyingPlaceholder"
  | "autoDetect"
  | "provider"
  | "advisorMode"
  | "saveSettings"
  | "quoteCount"
  | "focusUnderlyingEmpty"
  | "overviewTitle"
  | "overviewDesc"
  | "dashboardSignal"
  | "dashboardSignalHealthy"
  | "dashboardSignalWatch"
  | "dashboardSignalDefensive"
  | "dashboardActionHealthy"
  | "dashboardActionWatch"
  | "dashboardActionDefensive"
  | "dashboardTopRisksTitle"
  | "dashboardHedgeIdeasTitle"
  | "dashboardScenarioWatchTitle"
  | "dashboardInstrumentFocusTitle"
  | "dashboardOpenRiskMap"
  | "dashboardOpenHedgeLab"
  | "dashboardOpenScenarios"
  | "dashboardOpenChain"
  | "dashboardOpenBook"
  | "dashboardOpenGroupedExposure"
  | "dashboardOpenGreeks"
  | "dashboardOpenStrategyCompare"
  | "dashboardOpenProfile"
  | "dashboardOpenSurface"
  | "dashboardOpenSettings"
  | "dataWorkspaceDesc"
  | "dataWorkspaceTitle"
  | "dataWorkspaceImportTitle"
  | "dataWorkspaceImportDesc"
  | "dataWorkspaceConnectionTitle"
  | "dataWorkspaceConnectionDesc"
  | "dataWorkspaceConnectionHealthDesc"
  | "dataWorkspaceDatasetTitle"
  | "dataWorkspaceProviderTitle"
  | "dataWorkspaceFailureCount"
  | "dataWorkspaceFailedSymbols"
  | "dataWorkspaceLiveModeBody"
  | "dataWorkspaceImportHealthTitle"
  | "dataWorkspaceImportHealthDesc"
  | "dataWorkspacePositionsCount"
  | "dataWorkspaceImportReady"
  | "dataWorkspaceImportPartial"
  | "dataWorkspaceImportReview"
  | "dataWorkspaceImportEmpty"
  | "dataWorkspaceReviewBook"
  | "dataWorkspaceChecklistImport"
  | "dataWorkspaceChecklistMatch"
  | "dataWorkspaceChecklistReview"
  | "dataWorkspaceChecklistMode"
  | "dataWorkspaceChecklistUniverse"
  | "dataWorkspaceChecklistProvider"
  | "primaryActionsTitle"
  | "modeTitle"
  | "modeStaticDaily"
  | "modeLiveBackend"
  | "asOfTitle"
  | "universeTitle"
  | "defaultSymbolTitle"
  | "symbolCountTitle"
  | "staticDataNoticeTitle"
  | "staticDataNoticeBody"
  | "statusDelayed"
  | "topConcentration"
  | "greeksSummaryTitle"
  | "greeksSummaryDesc"
  | "netDelta"
  | "netGamma"
  | "netVega"
  | "netTheta"
  | "termTitle"
  | "termDesc"
  | "callIv"
  | "putIv"
  | "skewTitle"
  | "skewDesc"
  | "optionRiskProfileTitle"
  | "optionRiskProfileDesc"
  | "contractSelector"
  | "chainTitle"
  | "chainDesc"
  | "chainView"
  | "chainViewCards"
  | "chainViewTable"
  | "sortBy"
  | "sortAscending"
  | "sortDescending"
  | "sortExpiry"
  | "sortStrike"
  | "sortIv"
  | "sortOi"
  | "sortMid"
  | "sortDelta"
  | "sortGamma"
  | "sortVega"
  | "sortTheta"
  | "sortType"
  | "strike"
  | "mid"
  | "delta"
  | "deltaName"
  | "gamma"
  | "gammaName"
  | "vega"
  | "vegaName"
  | "theta"
  | "thetaName"
  | "oi"
  | "loading"
  | "failedLoad"
  | "call"
  | "put"
  | "paletteUs"
  | "paletteCn"
  | "paletteAmber"
  | "positionsTitle"
  | "positionsDesc"
  | "positionsPlaceholder"
  | "portfolioDelta"
  | "portfolioGamma"
  | "portfolioVega"
  | "portfolioTheta"
  | "notional"
  | "unmatchedSymbols"
  | "parseErrors"
  | "quantity"
  | "scenarioTitle"
  | "scenarioDesc"
  | "spotChange"
  | "portfolioPnl"
  | "groupedExposureTitle"
  | "groupedExposureDesc"
  | "bucket"
  | "marketValue"
  | "none"
  | "groupBy"
  | "groupBySymbol"
  | "groupByExpiry"
  | "groupByOptionType"
  | "groupBySymbolExpiry"
  | "groupByFull"
  | "impliedVolatility"
  | "uploadCsv"
  | "volScenarioTitle"
  | "volScenarioDesc"
  | "volChange"
  | "worstSpotScenario"
  | "worstVolScenario"
  | "topRiskBucket"
  | "timeScenarioTitle"
  | "timeScenarioDesc"
  | "daysForward"
  | "worstTimeScenario"
  | "providerMock"
  | "providerYahooSynthetic"
  | "advisorRules"
  | "advisorLlm"
  | "connectionStatus"
  | "statusConnected"
  | "statusDegraded"
  | "providerCapabilities"
  | "providerCapabilitiesDesc"
  | "capabilitySnapshot"
  | "capabilityGreeks"
  | "capabilityScenarios"
  | "capabilityGroupedRisk"
  | "testConnection"
  | "testingConnection"
  | "connectionError"
  | "providerNotes"
  | "apiKeyPlaceholder"
  | "apiKeyRequired"
  | "apiKeyOptional"
  | "grossExposure"
  | "netExposure"
  | "instrumentType"
  | "markPrice"
  | "topRisksTitle"
  | "navDashboard"
  | "navBook"
  | "navRisk"
  | "navHedge"
  | "navInstruments"
  | "navData"
  | "navSurface"
  | "hedgeCost"
  | "hedgeInstrument"
  | "strategyLabel"
  | "upsideRetention"
  | "downsideProtection"
  | "carryTheta"
  | "hedgeTarget"
  | "hedgeTargetDelta"
  | "hedgeTargetBeta"
  | "hedgeTargetTail"
  | "hedgeUniverse"
  | "hedgeUniverseAll"
  | "hedgeUniverseFutures"
  | "hedgeUniverseOptions"
  | "hedgeWhy"
  | "hedgeTradeOffs"
  | "hedgeResidualRisks"
  | "strategyExplanationTitle"
  | "riskSummaryDirectionalBetaElevated"
  | "riskDetailsDirectionalBetaElevated"
  | "riskSummaryVegaExposureElevated"
  | "riskDetailsVegaExposureElevated"
  | "riskSummaryTopSymbolConcentration"
  | "riskDetailsTopSymbolConcentration"
  | "riskSummaryExpiryConcentration"
  | "riskDetailsExpiryConcentration"
  | "riskCategoryDirectional"
  | "riskCategoryConcentration"
  | "riskCategoryVolatility"
  | "riskCategoryExpiry"
  | "hedgeLabelNoHedge"
  | "hedgeLabelFuturesOverlay"
  | "hedgeLabelProtectivePut"
  | "hedgeLabelCollar"
  | "hedgeTypeNone"
  | "hedgeTypeFuturesOverlay"
  | "hedgeTypeProtectivePut"
  | "hedgeTypeCollar"
  | "hedgeSummaryNoHedge"
  | "hedgeSummaryFuturesOverlayNeutralize"
  | "hedgeSummaryFuturesOverlayBeta"
  | "hedgeSummaryProtectivePutTail"
  | "hedgeSummaryProtectivePutGeneral"
  | "hedgeSummaryCollar"
  | "hedgeLabRecommendationTitle"
  | "hedgeUniverseExcludesTitle"
  | "hedgeStrategyPrimerTitle"
  | "hedgeTargetDeltaSummary"
  | "hedgeTargetBetaSummary"
  | "hedgeTargetTailSummary"
  | "hedgePrimerFutures"
  | "hedgePrimerProtectivePut"
  | "hedgePrimerCollar"
  | "hedgeRationaleFuturesWhy"
  | "hedgeRationaleFuturesTradeOff"
  | "hedgeRationaleFuturesResidual"
  | "hedgeRationalePutWhy"
  | "hedgeRationalePutTradeOff"
  | "hedgeRationalePutResidual"
  | "hedgeRationaleCollarWhy"
  | "hedgeRationaleCollarTradeOff"
  | "hedgeRationaleCollarResidual"
  | "hedgeLabOverviewSummary"
  | "strategyCompareBestProtection"
  | "strategyCompareLowestCost"
  | "dashboardInterpretationTitle"
  | "dashboardInterpretationHeadline"
  | "dashboardInterpretationBody"
  | "dashboardDrilldownTitle"
  | "dashboardDrilldownHeadline"
  | "dashboardDrilldownBody"
  | "dashboardDrilldownRisk"
  | "dashboardDrilldownHedge"
  | "dashboardDrilldownInstrument"
  | "riskInterpretationTitle"
  | "riskInterpretationBody"
  | "riskInterpretationDirectional"
  | "riskInterpretationConcentration"
  | "riskInterpretationScenario"
  | "riskDecisionTitle"
  | "riskDecisionHeadline"
  | "riskDecisionBody"
  | "hedgeInterpretationTitle"
  | "hedgeInterpretationBody"
  | "hedgeInterpretationLinear"
  | "hedgeInterpretationConvex"
  | "hedgeInterpretationCarry"
  | "hedgeDecisionHeadline"
  | "hedgeDecisionBody"
  | "instrumentInterpretationTitle"
  | "instrumentInterpretationBody"
  | "instrumentInterpretationChain"
  | "instrumentInterpretationProfile"
  | "instrumentInterpretationSurface"
  | "instrumentDecisionTitle"
  | "instrumentDecisionBody";

const translations: Record<Language, Record<I18nKey, string>> = {
  en: {
    appEyebrow: "Options Risk Platform",
    appTitle: "Option Risk Should Read Like a Control Panel, Not a Spreadsheet.",
    appLede:
      "A static TypeScript dashboard with pluggable implied-volatility modeling. Today it uses Black-Scholes. Tomorrow it can swap models without rewriting the UI contract.",
    controlTowerTitle: "Portfolio Risk Panel",
    status: "Status",
    recommendedAction: "Recommended action",
    underlying: "Underlying",
    spot: "Spot",
    snapshot: "Snapshot",
    model: "Model",
    theme: "Theme",
    language: "Language",
    palette: "Palette",
    light: "Light",
    dark: "Dark",
    english: "English",
    chinese: "中文",
    settingsTitle: "Settings",
    settingsDesc:
      "Leave API Base URL empty to use static daily snapshots. Fill it only when switching to live backend mode.",
    currentBookTitle: "Current Book",
    currentBookDesc:
      "Normalize the current holdings into a portfolio book before comparing hedge overlays.",
    riskMapTitle: "Risk Map",
    riskMapDesc:
      "Summarize concentration, directional exposure, and top risk flags at the portfolio level.",
    riskControlTitle: "Risk Control",
    riskControlDesc:
      "Read the portfolio through primary risks, concentration pockets, and scenario stress before drilling into raw data.",
    hedgeLabTitle: "Hedge Lab",
    hedgeLabDesc:
      "Compare simple hedge overlays before committing to execution.",
    hedgeDecisionTitle: "Hedge Decision",
    hedgeDecisionDesc:
      "Review hedge candidates as decision paths, not just payoff mechanics.",
    strategyCompareTitle: "Strategy Compare",
    strategyCompareDesc:
      "Review baseline and hedge candidates side by side across cost and residual exposure.",
    instrumentWorkbenchTitle: "Instrument Workbench",
    instrumentWorkbenchDesc:
      "Drill from the portfolio into chains, surfaces, and single-contract risk only after the top-down read is clear.",
    apiBaseUrl: "API Base URL",
    symbol: "Symbol",
    focusUnderlying: "Focus underlying",
    focusUnderlyingPlaceholder: "Optional. Used for surface views like chain, skew, and risk profile.",
    autoDetect: "Auto detect",
    provider: "Provider",
    advisorMode: "Advisor mode",
    saveSettings: "Save settings",
    quoteCount: "Contracts in view",
    focusUnderlyingEmpty: "Use auto-detected underlyings from the book.",
    overviewTitle: "Portfolio Overview",
    overviewDesc:
      "Start with the most important portfolio signals, then drill into risks, hedges, and instruments only when needed.",
    dashboardSignal: "Book signal",
    dashboardSignalHealthy: "Balanced",
    dashboardSignalWatch: "Watchlist",
    dashboardSignalDefensive: "Defensive",
    dashboardActionHealthy: "Keep monitoring. Drill down only if concentration starts to build.",
    dashboardActionWatch: "Inspect concentration and compare lighter hedge overlays.",
    dashboardActionDefensive: "Review risk concentration and open hedge candidates now.",
    dashboardTopRisksTitle: "Primary Risks",
    dashboardHedgeIdeasTitle: "Hedge Ideas",
    dashboardScenarioWatchTitle: "Scenario Watch",
    dashboardInstrumentFocusTitle: "Instrument Focus",
    dashboardOpenRiskMap: "Open risk map",
    dashboardOpenHedgeLab: "Open hedge lab",
    dashboardOpenScenarios: "Open scenarios",
    dashboardOpenChain: "Open chain",
    dashboardOpenBook: "Open book",
    dashboardOpenGroupedExposure: "Open grouped exposure",
    dashboardOpenGreeks: "Open Greeks",
    dashboardOpenStrategyCompare: "Open strategy compare",
    dashboardOpenProfile: "Open profile",
    dashboardOpenSurface: "Open surface",
    dashboardOpenSettings: "Open settings",
    dataWorkspaceDesc:
      "Use these pages to configure providers and ingest raw positions after the top-down review is clear.",
    dataWorkspaceTitle: "Data Workspace",
    dataWorkspaceImportTitle: "Position ingestion",
    dataWorkspaceImportDesc:
      "Paste or upload raw positions, inspect parsing errors, and verify unmatched symbols before risk aggregation.",
    dataWorkspaceConnectionTitle: "Provider connection",
    dataWorkspaceConnectionDesc:
      "Adjust provider defaults, focus underlying, and backend connection options without cluttering the main panel.",
    dataWorkspaceConnectionHealthDesc:
      "Keep connection settings here so analysis pages stay focused on portfolio decisions instead of infrastructure details.",
    dataWorkspaceDatasetTitle: "Dataset state",
    dataWorkspaceProviderTitle: "Snapshot source",
    dataWorkspaceFailureCount: "Failed symbols",
    dataWorkspaceFailedSymbols: "Failed snapshot refresh",
    dataWorkspaceLiveModeBody:
      "Live backend mode can fetch fresher snapshots and run heavier analytics, but the panel should still start from the same book and risk workflow.",
    dataWorkspaceImportHealthTitle: "Import health",
    dataWorkspaceImportHealthDesc:
      "Before reading risk outputs, make sure symbols are parsed cleanly and the book has as few unmatched legs as possible.",
    dataWorkspacePositionsCount: "Imported rows",
    dataWorkspaceImportReady: "Ready",
    dataWorkspaceImportPartial: "Partial",
    dataWorkspaceImportReview: "Needs review",
    dataWorkspaceImportEmpty: "Empty",
    dataWorkspaceReviewBook: "Review normalized book",
    dataWorkspaceChecklistImport: "Import or paste raw holdings before trusting downstream charts.",
    dataWorkspaceChecklistMatch: "Resolve unmatched symbols so grouped risk and hedge proposals stay meaningful.",
    dataWorkspaceChecklistReview: "Open the normalized book once before moving back to risks and hedges.",
    dataWorkspaceChecklistMode: "Leave API Base URL empty for static T-1 mode.",
    dataWorkspaceChecklistUniverse: "Use focus underlying only for surface views, not for the whole book.",
    dataWorkspaceChecklistProvider: "Switch provider settings here, not inside analysis pages.",
    primaryActionsTitle: "Primary actions",
    modeTitle: "Mode",
    modeStaticDaily: "Static daily demo",
    modeLiveBackend: "Live backend",
    asOfTitle: "As of",
    universeTitle: "Universe",
    defaultSymbolTitle: "Default symbol",
    symbolCountTitle: "Tracked symbols",
    staticDataNoticeTitle: "Dataset notice",
    staticDataNoticeBody:
      "Static daily mode uses T-1 snapshots generated by GitHub Actions. Portfolio analytics remain available, but intraday pricing and provider connectivity are intentionally disabled.",
    statusDelayed: "Delayed",
    topConcentration: "Top concentration",
    greeksSummaryTitle: "Greeks Risk Snapshot",
    greeksSummaryDesc:
      "Quote-level aggregation to show the platform shape. Real portfolio mode would aggregate actual positions.",
    netDelta: "Net Delta",
    netGamma: "Net Gamma",
    netVega: "Net Vega",
    netTheta: "Net Theta",
    termTitle: "IV Term Structure",
    termDesc:
      "Average implied volatility by expiry. This should be a first-class visual, not a table lookup.",
    callIv: "Call IV",
    putIv: "Put IV",
    skewTitle: "Skew by Expiry",
    skewDesc:
      "Strike versus implied volatility for each expiry. This is closer to how traders actually read the chain.",
    optionRiskProfileTitle: "Option Risk Profile",
    optionRiskProfileDesc:
      "Inspect one contract at a time to see how its Greeks and simple PnL sensitivity behave together.",
    contractSelector: "Contract",
    chainTitle: "Chain Cards",
    chainDesc:
      "Compact cards for scanning strikes, IV, Greeks, and open interest without falling back to a spreadsheet grid.",
    chainView: "View",
    chainViewCards: "Cards",
    chainViewTable: "Compare table",
    sortBy: "Sort by",
    sortAscending: "Ascending",
    sortDescending: "Descending",
    sortExpiry: "Expiry",
    sortStrike: "Strike",
    sortIv: "Implied vol",
    sortOi: "Open interest",
    sortMid: "Mid",
    sortDelta: "Delta",
    sortGamma: "Gamma",
    sortVega: "Vega",
    sortTheta: "Theta",
    sortType: "Type",
    strike: "Strike",
    mid: "Mid",
    delta: "Delta",
    deltaName: "delta",
    gamma: "Gamma",
    gammaName: "gamma",
    vega: "Vega",
    vegaName: "vega",
    theta: "Theta",
    thetaName: "theta",
    oi: "OI",
    loading: "Loading option snapshot...",
    failedLoad: "Failed to load option snapshot",
    call: "Call",
    put: "Put",
    paletteUs: "US: green up / red down",
    paletteCn: "CN: red up / green down",
    paletteAmber: "Amber / blue neutral",
    positionsTitle: "Portfolio Position Import",
    positionsDesc:
      "Paste simple CSV rows as symbol,quantity. Underlying shares are treated as delta 1. Option contracts are aggregated using chain Greeks times 100.",
    positionsPlaceholder: "510050,20000\n510300,10000\n510050C2604M02800,-2\n510050P2604M02800,3",
    portfolioDelta: "Portfolio Delta",
    portfolioGamma: "Portfolio Gamma",
    portfolioVega: "Portfolio Vega",
    portfolioTheta: "Portfolio Theta",
    notional: "Market Value",
    unmatchedSymbols: "Unmatched symbols",
    parseErrors: "Parse errors",
    quantity: "Quantity",
    scenarioTitle: "Scenario PnL",
    scenarioDesc:
      "Reprice the imported portfolio across spot shocks while holding implied volatility and time-to-expiry constant.",
    spotChange: "Spot change",
    portfolioPnl: "Portfolio PnL",
    groupedExposureTitle: "Grouped Exposure Breakdown",
    groupedExposureDesc:
      "Decompose portfolio risk by grouped buckets so you can see which symbol, expiry, or option side is dominating the book.",
    bucket: "Bucket",
    marketValue: "Market Value",
    none: "None",
    groupBy: "Group by",
    groupBySymbol: "Symbol",
    groupByExpiry: "Expiry",
    groupByOptionType: "Option type",
    groupBySymbolExpiry: "Symbol + expiry",
    groupByFull: "Symbol + expiry + type",
    impliedVolatility: "Implied Volatility",
    uploadCsv: "Upload CSV",
    volScenarioTitle: "Volatility Shock PnL",
    volScenarioDesc:
      "Reprice the imported portfolio under parallel implied-volatility shifts while keeping spot and time-to-expiry fixed.",
    volChange: "Vol change",
    worstSpotScenario: "Worst Spot Scenario",
    worstVolScenario: "Worst Vol Scenario",
    topRiskBucket: "Top Risk Bucket",
    timeScenarioTitle: "Time Decay Shock PnL",
    timeScenarioDesc:
      "Reprice the imported portfolio after moving time forward while keeping spot and implied volatility fixed.",
    daysForward: "Days forward",
    worstTimeScenario: "Worst Time Scenario",
    providerMock: "Mock provider",
    providerYahooSynthetic: "Yahoo spot + synthetic chain",
    advisorRules: "Rules only",
    advisorLlm: "LLM interface",
    connectionStatus: "Connection status",
    statusConnected: "Connected",
    statusDegraded: "Degraded",
    providerCapabilities: "Provider capabilities",
    providerCapabilitiesDesc:
      "Static mode reads precomputed daily snapshots. Live mode can fetch snapshots and run heavier portfolio analytics.",
    capabilitySnapshot: "Snapshot retrieval",
    capabilityGreeks: "Greeks enrichment",
    capabilityScenarios: "Scenario analysis",
    capabilityGroupedRisk: "Grouped risk breakdown",
    testConnection: "Test connection",
    testingConnection: "Testing...",
    connectionError: "Connection error",
    providerNotes: "Provider notes",
    apiKeyPlaceholder: "API key placeholder",
    apiKeyRequired: "This provider will require an API key.",
    apiKeyOptional: "No API key required for the current provider.",
    grossExposure: "Gross Exposure",
    netExposure: "Net Exposure",
    instrumentType: "Instrument",
    markPrice: "Mark Price",
    topRisksTitle: "Top Risks",
    navDashboard: "Dashboard",
    navBook: "Book",
    navRisk: "Risk",
    navHedge: "Hedge",
    navInstruments: "Instruments",
    navData: "Data",
    navSurface: "Surface",
    hedgeCost: "Hedge Cost",
    hedgeInstrument: "Instrument",
    strategyLabel: "Strategy",
    upsideRetention: "Upside Retention",
    downsideProtection: "Downside Protection",
    carryTheta: "Carry / Theta",
    hedgeTarget: "Target",
    hedgeTargetDelta: "Neutralize delta",
    hedgeTargetBeta: "Reduce beta",
    hedgeTargetTail: "Tail protection",
    hedgeUniverse: "Universe",
    hedgeUniverseAll: "All hedge tools",
    hedgeUniverseFutures: "Futures overlay only",
    hedgeUniverseOptions: "Options hedge only",
    hedgeWhy: "Why",
    hedgeTradeOffs: "Trade-offs",
    hedgeResidualRisks: "Residual risks",
    strategyExplanationTitle: "Decision notes",
    riskSummaryDirectionalBetaElevated: "Directional beta exposure is elevated.",
    riskDetailsDirectionalBetaElevated: "Current beta proxy is {value}.",
    riskSummaryVegaExposureElevated: "Net vega exposure is elevated.",
    riskDetailsVegaExposureElevated: "Current vega is {value}.",
    riskSummaryTopSymbolConcentration: "The book is concentrated in {bucket}.",
    riskDetailsTopSymbolConcentration: "{bucket} contributes the largest market value slice.",
    riskSummaryExpiryConcentration: "Expiry concentration is elevated in {bucket}.",
    riskDetailsExpiryConcentration: "{bucket} currently dominates expiry-level risk.",
    riskCategoryDirectional: "Directional",
    riskCategoryConcentration: "Concentration",
    riskCategoryVolatility: "Volatility",
    riskCategoryExpiry: "Expiry",
    hedgeLabelNoHedge: "No hedge",
    hedgeLabelFuturesOverlay: "Futures overlay",
    hedgeLabelProtectivePut: "Protective put",
    hedgeLabelCollar: "Cost-controlled collar",
    hedgeTypeNone: "Baseline",
    hedgeTypeFuturesOverlay: "Futures hedge",
    hedgeTypeProtectivePut: "Protective put",
    hedgeTypeCollar: "Collar",
    hedgeSummaryNoHedge: "Keep the current book unchanged as the baseline reference.",
    hedgeSummaryFuturesOverlayNeutralize:
      "Use a linear futures overlay to neutralize most directional exposure.",
    hedgeSummaryFuturesOverlayBeta:
      "Use a linear futures overlay to compress most market beta efficiently.",
    hedgeSummaryProtectivePutTail:
      "Buy downside convexity to improve crash protection while keeping upside open.",
    hedgeSummaryProtectivePutGeneral:
      "Buy downside convexity to reduce drawdown while retaining more upside participation.",
    hedgeSummaryCollar:
      "Pair a protective put with a covered upside call sale to lower hedge carry while capping some upside.",
    hedgeLabRecommendationTitle: "Recommended hedge",
    hedgeUniverseExcludesTitle: "Excluded by current universe",
    hedgeStrategyPrimerTitle: "What it means",
    hedgeTargetDeltaSummary:
      "Use this when your first problem is directional exposure. Linear hedges usually move to the front.",
    hedgeTargetBetaSummary:
      "Use this when you want to compress market beta efficiently without paying too much carry.",
    hedgeTargetTailSummary:
      "Use this when your first concern is left-tail protection rather than perfect delta neutrality.",
    hedgePrimerFutures:
      "Futures overlays are the cleanest way to cut linear market exposure, but they also suppress upside participation.",
    hedgePrimerProtectivePut:
      "Protective puts cost premium, but they improve drawdown shape and keep more upside open.",
    hedgePrimerCollar:
      "Collars trade away some upside to reduce hedge carry, sitting between pure futures hedges and outright puts.",
    hedgeRationaleFuturesWhy:
      "Fastest way to cut linear delta and beta with relatively low implementation friction.",
    hedgeRationaleFuturesTradeOff:
      "It reduces upside participation almost as much as downside sensitivity.",
    hedgeRationaleFuturesResidual:
      "Gamma, vega, and event-driven gap risk still remain in the book.",
    hedgeRationalePutWhy:
      "Best fit when downside convexity matters more than perfect delta neutrality.",
    hedgeRationalePutTradeOff:
      "Premium cost creates negative carry and heavier theta bleed.",
    hedgeRationalePutResidual:
      "Upside remains open, but net delta and beta are only partially reduced.",
    hedgeRationaleCollarWhy:
      "Balances lower carry with better downside shape than a pure futures hedge.",
    hedgeRationaleCollarTradeOff:
      "Upside is surrendered beyond the short call strike.",
    hedgeRationaleCollarResidual:
      "Residual downside remains below the put strike and above any unhedged notional.",
    hedgeLabOverviewSummary:
      "Use this page to understand what each hedge structure is good at. Compare all of them before narrowing down in Strategy Compare.",
    strategyCompareBestProtection: "Strongest protection",
    strategyCompareLowestCost: "Lowest carry cost",
    dashboardInterpretationTitle: "Read this first",
    dashboardInterpretationHeadline: "Start with the whole book, not with an instrument.",
    dashboardInterpretationBody:
      "This page should tell you whether the portfolio needs attention before you open chain views or contract-level details.",
    dashboardDrilldownTitle: "Drill-down path",
    dashboardDrilldownHeadline: "Follow risk first, hedge second, instruments last.",
    dashboardDrilldownBody:
      "Use the dashboard as the first summary layer, then move toward explanation and raw data only when a signal matters.",
    dashboardDrilldownRisk:
      "Open Risks when you need to know what is driving drawdown, concentration, or Greek pressure.",
    dashboardDrilldownHedge:
      "Open Hedges when you already know the problem and need to compare hedge trade-offs.",
    dashboardDrilldownInstrument:
      "Open Instruments only after you know which underlying or contract family deserves inspection.",
    riskInterpretationTitle: "Risk reading",
    riskInterpretationBody:
      "This page should separate directional pressure, concentration, and scenario damage so you know what deserves action first.",
    riskInterpretationDirectional:
      "Directional risk tells you how much the whole book still behaves like a market bet.",
    riskInterpretationConcentration:
      "Concentration tells you whether one underlying, expiry, or bucket dominates the risk story.",
    riskInterpretationScenario:
      "Scenario loss shows how quickly the book can break when the market moves against you.",
    riskDecisionTitle: "Decision frame",
    riskDecisionHeadline: "Escalate only the risk that can materially change the book.",
    riskDecisionBody:
      "Use the worst scenario and the top concentration bucket to decide whether you need a hedge or only a closer review.",
    hedgeInterpretationTitle: "Hedge reading",
    hedgeInterpretationBody:
      "The point is not to find the prettiest structure. The point is to understand what risk each hedge removes and what cost it introduces.",
    hedgeInterpretationLinear:
      "Linear hedges are efficient when the main problem is market direction or beta.",
    hedgeInterpretationConvex:
      "Convex hedges matter when drawdown shape and crash protection matter more than perfect neutrality.",
    hedgeInterpretationCarry:
      "Carry decides whether a hedge is realistic to keep on, not just whether it looks attractive on paper.",
    hedgeDecisionHeadline: "Compare protection, carry, and residual risk together.",
    hedgeDecisionBody:
      "Read the leading hedge candidate as a proposal, then use strategy comparison to judge whether the protection is worth the carry and lost upside.",
    instrumentInterpretationTitle: "Instrument reading",
    instrumentInterpretationBody:
      "Use this page to inspect the contracts that support a decision already made at book level, not to start from raw chain noise.",
    instrumentInterpretationChain:
      "Chain view is for fast comparison across strikes, expiries, and liquidity.",
    instrumentInterpretationProfile:
      "Risk profile is for understanding one contract's Greeks and local sensitivity.",
    instrumentInterpretationSurface:
      "Surface views are for checking whether the contract is expensive or cheap relative to nearby structure.",
    instrumentDecisionTitle: "Current focus",
    instrumentDecisionBody:
      "Once the focus underlying is clear, keep the contract context stable while you compare chain, profile, and surface together.",
  },
  zh: {
    appEyebrow: "组合风险平台",
    appTitle: "期权风险界面应该像控制台，而不是电子表格。",
    appLede:
      "这是一个静态 TypeScript 风险面板，隐含波动率模型通过通用接口接入。当前先用 Black-Scholes，后续可替换而不重写前端契约。",
    controlTowerTitle: "组合风险面板",
    status: "状态",
    recommendedAction: "建议动作",
    underlying: "标的",
    spot: "现价",
    snapshot: "快照时间",
    model: "模型",
    theme: "主题",
    language: "语言",
    palette: "调色板",
    light: "日间",
    dark: "夜间",
    english: "English",
    chinese: "中文",
    settingsTitle: "设置",
    settingsDesc:
      "留空 API 基础地址即可使用静态日更快照；只有在切换到后端实时模式时才需要填写。",
    currentBookTitle: "当前持仓簿",
    currentBookDesc: "先把当前持仓标准化成组合持仓簿，再去比较不同对冲方案。",
    riskMapTitle: "风险地图",
    riskMapDesc: "从组合层总结集中度、方向暴露和主要风险提示。",
    riskControlTitle: "风险控制",
    riskControlDesc: "先读主要风险、集中度和情景压力，再决定是否继续下钻到原始数据。",
    hedgeLabTitle: "对冲实验室",
    hedgeLabDesc: "在执行前比较最简单的对冲覆盖方案。",
    hedgeDecisionTitle: "对冲决策",
    hedgeDecisionDesc: "把对冲候选方案当成决策路径来看，而不是只看 payoff 结构。",
    strategyCompareTitle: "策略比较",
    strategyCompareDesc: "并排查看基准方案和对冲候选方案的成本与剩余风险。",
    instrumentWorkbenchTitle: "工具工作台",
    instrumentWorkbenchDesc: "先完成组合层判断，再下钻到链、曲面和单合约风险剖面。",
    apiBaseUrl: "API 基础地址",
    symbol: "标的代码",
    focusUnderlying: "焦点标的",
    focusUnderlyingPlaceholder: "可选。仅用于期权链、skew、风险剖面等单标的页面。",
    autoDetect: "自动识别",
    provider: "数据提供方",
    advisorMode: "建议引擎模式",
    saveSettings: "保存设置",
    quoteCount: "当前合约数",
    focusUnderlyingEmpty: "使用组合中自动识别的标的作为曲面视图上下文。",
    overviewTitle: "组合总览",
    overviewDesc:
      "先看最关键的组合信号，再按风险、对冲和工具页面逐层下钻，而不是直接面对原始数据。",
    dashboardSignal: "组合状态",
    dashboardSignalHealthy: "相对平衡",
    dashboardSignalWatch: "需要关注",
    dashboardSignalDefensive: "偏防御",
    dashboardActionHealthy: "继续监控即可，只有在集中度上升时再下钻。",
    dashboardActionWatch: "优先检查集中度，并比较更轻量的对冲覆盖方案。",
    dashboardActionDefensive: "立即查看风险集中，并打开对冲候选方案。",
    dashboardTopRisksTitle: "主要风险",
    dashboardHedgeIdeasTitle: "对冲思路",
    dashboardScenarioWatchTitle: "情景观察",
    dashboardInstrumentFocusTitle: "工具视角",
    dashboardOpenRiskMap: "进入风险地图",
    dashboardOpenHedgeLab: "进入对冲实验室",
    dashboardOpenScenarios: "进入情景分析",
    dashboardOpenChain: "进入期权链",
    dashboardOpenBook: "进入持仓簿",
    dashboardOpenGroupedExposure: "进入分组暴露",
    dashboardOpenGreeks: "进入 Greeks",
    dashboardOpenStrategyCompare: "进入策略比较",
    dashboardOpenProfile: "进入风险剖面",
    dashboardOpenSurface: "进入曲面",
    dashboardOpenSettings: "进入设置",
    dataWorkspaceDesc: "在完成上层风险判断后，再回到这些页面配置 provider 与导入原始持仓。",
    dataWorkspaceTitle: "数据工作区",
    dataWorkspaceImportTitle: "持仓导入",
    dataWorkspaceImportDesc:
      "粘贴或上传原始持仓，检查解析错误与未匹配合约，再进入风险聚合流程。",
    dataWorkspaceConnectionTitle: "数据连接",
    dataWorkspaceConnectionDesc:
      "配置 provider、焦点标的和后端连接选项，但不要让这些配置淹没主面板。",
    dataWorkspaceConnectionHealthDesc:
      "连接配置应该留在这里处理，让分析页始终聚焦在组合判断，而不是基础设施细节。",
    dataWorkspaceDatasetTitle: "数据状态",
    dataWorkspaceProviderTitle: "快照来源",
    dataWorkspaceFailureCount: "失败标的数",
    dataWorkspaceFailedSymbols: "刷新失败标的",
    dataWorkspaceLiveModeBody:
      "后端实时模式可以获取更及时的快照并执行更重的分析，但工作流仍应从持仓簿和风险判断开始。",
    dataWorkspaceImportHealthTitle: "导入健康度",
    dataWorkspaceImportHealthDesc:
      "在阅读风险结论之前，先确保持仓能被正确解析，未匹配腿尽量少，否则后续图表和对冲建议都会失真。",
    dataWorkspacePositionsCount: "导入行数",
    dataWorkspaceImportReady: "已就绪",
    dataWorkspaceImportPartial: "部分可用",
    dataWorkspaceImportReview: "需要复核",
    dataWorkspaceImportEmpty: "尚未导入",
    dataWorkspaceReviewBook: "查看标准化持仓簿",
    dataWorkspaceChecklistImport: "先导入或粘贴原始持仓，再去相信后面的风险图表。",
    dataWorkspaceChecklistMatch: "尽量解决未匹配符号，否则分组风险和对冲方案会失真。",
    dataWorkspaceChecklistReview: "至少先看一眼标准化持仓簿，再回到风险和对冲页面。",
    dataWorkspaceChecklistMode: "静态 T-1 模式下请保持 API 基础地址为空。",
    dataWorkspaceChecklistUniverse: "焦点标的只服务于曲面与单合约页面，不应替代整本组合。",
    dataWorkspaceChecklistProvider: "provider 切换和连接配置应在这里处理，而不是在分析页里处理。",
    primaryActionsTitle: "下一步动作",
    modeTitle: "模式",
    modeStaticDaily: "静态日更演示",
    modeLiveBackend: "后端实时模式",
    asOfTitle: "数据时点",
    universeTitle: "标的范围",
    defaultSymbolTitle: "默认标的",
    symbolCountTitle: "覆盖标的数",
    staticDataNoticeTitle: "数据说明",
    staticDataNoticeBody:
      "静态日更模式使用 GitHub Actions 生成的 T-1 快照。组合分析和对冲比较仍可使用，但不提供盘中实时定价与 provider 联机能力。",
    statusDelayed: "延迟数据",
    topConcentration: "最高集中度",
    greeksSummaryTitle: "Greeks 风险快照",
    greeksSummaryDesc: "当前先做链级别聚合，用于展示平台形态。真实组合模式应聚合实际持仓。",
    netDelta: "净 Delta",
    netGamma: "净 Gamma",
    netVega: "净 Vega",
    netTheta: "净 Theta",
    termTitle: "IV 期限结构",
    termDesc: "按到期日汇总平均隐含波动率。实际风控应优先看这种图，而不是先翻表格。",
    callIv: "Call IV",
    putIv: "Put IV",
    skewTitle: "按到期日查看 Skew",
    skewDesc: "横轴是行权价，纵轴是隐含波动率。这更接近交易者阅读期权链的真实方式。",
    optionRiskProfileTitle: "期权风险剖面",
    optionRiskProfileDesc: "单独查看某一张合约，把 Greeks 和简单 PnL 敏感度放在一起看。",
    contractSelector: "合约",
    chainTitle: "期权链卡片视图",
    chainDesc: "用紧凑卡片浏览行权价、IV、Greeks 和持仓兴趣度，避免退回到传统表格思维。",
    chainView: "视图",
    chainViewCards: "卡片",
    chainViewTable: "对比表",
    sortBy: "排序字段",
    sortAscending: "升序",
    sortDescending: "降序",
    sortExpiry: "到期日",
    sortStrike: "行权价",
    sortIv: "隐含波动率",
    sortOi: "持仓量",
    sortMid: "中间价",
    sortDelta: "Delta",
    sortGamma: "Gamma",
    sortVega: "Vega",
    sortTheta: "Theta",
    sortType: "方向",
    strike: "行权价",
    mid: "中间价",
    delta: "Delta",
    deltaName: "delta",
    gamma: "Gamma",
    gammaName: "gamma",
    vega: "Vega",
    vegaName: "vega",
    theta: "Theta",
    thetaName: "theta",
    oi: "持仓量",
    loading: "正在加载期权快照...",
    failedLoad: "期权快照加载失败",
    call: "看涨",
    put: "看跌",
    paletteUs: "海外：绿涨红跌",
    paletteCn: "内地：红涨绿跌",
    paletteAmber: "琥珀 / 蓝中性",
    positionsTitle: "组合持仓导入",
    positionsDesc:
      "粘贴简单 CSV：symbol,quantity。标的现货按 delta=1 处理；期权合约按链上 Greeks 乘 100 股乘数聚合。",
    positionsPlaceholder: "510050,20000\n510300,10000\n510050C2604M02800,-2\n510050P2604M02800,3",
    portfolioDelta: "组合 Delta",
    portfolioGamma: "组合 Gamma",
    portfolioVega: "组合 Vega",
    portfolioTheta: "组合 Theta",
    notional: "市值",
    unmatchedSymbols: "未匹配符号",
    parseErrors: "解析错误",
    quantity: "数量",
    scenarioTitle: "场景 PnL",
    scenarioDesc:
      "在保持隐含波动率和剩余期限不变的前提下，观察导入组合在不同标的价格冲击下的重定价结果。",
    spotChange: "标的变动",
    portfolioPnl: "组合 PnL",
    groupedExposureTitle: "分组暴露拆解",
    groupedExposureDesc:
      "按分组 bucket 拆开组合风险，帮助你看清到底是哪一组 symbol、expiry 或期权方向在主导风险。",
    bucket: "分组",
    marketValue: "市值",
    none: "无",
    groupBy: "分组方式",
    groupBySymbol: "按标的",
    groupByExpiry: "按到期日",
    groupByOptionType: "按期权方向",
    groupBySymbolExpiry: "按标的 + 到期日",
    groupByFull: "按标的 + 到期日 + 方向",
    impliedVolatility: "隐含波动率",
    uploadCsv: "上传 CSV",
    volScenarioTitle: "波动率冲击 PnL",
    volScenarioDesc:
      "在保持标的价格和剩余期限不变的前提下，对隐含波动率做平行移动并重定价组合。",
    volChange: "波动率变动",
    worstSpotScenario: "最差 Spot 场景",
    worstVolScenario: "最差波动率场景",
    topRiskBucket: "最高风险分组",
    timeScenarioTitle: "时间衰减冲击 PnL",
    timeScenarioDesc:
      "在保持标的价格和隐含波动率不变的前提下，把时间向前推进后重新定价组合。",
    daysForward: "向前推进天数",
    worstTimeScenario: "最差时间场景",
    providerMock: "Mock 提供方",
    providerYahooSynthetic: "Yahoo 现价 + 合成期权链",
    advisorRules: "仅规则",
    advisorLlm: "LLM 接口",
    connectionStatus: "连接状态",
    statusConnected: "已连接",
    statusDegraded: "连接降级",
    providerCapabilities: "提供方能力",
    providerCapabilitiesDesc: "当前后端链路可获取快照，并执行组合风险分析。",
    
    capabilitySnapshot: "快照拉取",
    capabilityGreeks: "Greeks 富化",
    capabilityScenarios: "场景分析",
    capabilityGroupedRisk: "分组风险拆解",
    testConnection: "测试连接",
    testingConnection: "测试中...",
    connectionError: "连接错误",
    providerNotes: "提供方说明",
    apiKeyPlaceholder: "API Key 占位",
    apiKeyRequired: "该提供方未来需要 API Key。",
    apiKeyOptional: "当前提供方不需要 API Key。",
    grossExposure: "总暴露",
    netExposure: "净暴露",
    instrumentType: "工具类型",
    markPrice: "标记价格",
    topRisksTitle: "主要风险",
    navDashboard: "总览",
    navBook: "持仓簿",
    navRisk: "风险",
    navHedge: "对冲",
    navInstruments: "工具",
    navData: "数据",
    navSurface: "曲面",
    hedgeCost: "对冲成本",
    hedgeInstrument: "对冲工具",
    strategyLabel: "方案",
    upsideRetention: "上涨保留",
    downsideProtection: "下跌保护",
    carryTheta: "持有成本 / Theta",
    hedgeTarget: "目标",
    hedgeTargetDelta: "中和 Delta",
    hedgeTargetBeta: "压低 Beta",
    hedgeTargetTail: "尾部保护",
    hedgeUniverse: "工具范围",
    hedgeUniverseAll: "全部工具（期货 + 期权）",
    hedgeUniverseFutures: "仅期货对冲",
    hedgeUniverseOptions: "仅期权对冲",
    hedgeWhy: "适用原因",
    hedgeTradeOffs: "主要取舍",
    hedgeResidualRisks: "残余风险",
    strategyExplanationTitle: "决策说明",
    riskSummaryDirectionalBetaElevated: "方向性 Beta 暴露偏高。",
    riskDetailsDirectionalBetaElevated: "当前 Beta 代理值为 {value}。",
    riskSummaryVegaExposureElevated: "净 Vega 暴露偏高。",
    riskDetailsVegaExposureElevated: "当前 Vega 为 {value}。",
    riskSummaryTopSymbolConcentration: "组合在 {bucket} 上集中度偏高。",
    riskDetailsTopSymbolConcentration: "{bucket} 当前贡献了最大的市值权重。",
    riskSummaryExpiryConcentration: "{bucket} 的到期集中度偏高。",
    riskDetailsExpiryConcentration: "{bucket} 当前主导了到期维度的风险暴露。",
    riskCategoryDirectional: "方向风险",
    riskCategoryConcentration: "集中度",
    riskCategoryVolatility: "波动率",
    riskCategoryExpiry: "到期结构",
    hedgeLabelNoHedge: "不对冲",
    hedgeLabelFuturesOverlay: "期货对冲覆盖",
    hedgeLabelProtectivePut: "保护性看跌期权",
    hedgeLabelCollar: "领口策略",
    hedgeTypeNone: "基准方案",
    hedgeTypeFuturesOverlay: "期货对冲",
    hedgeTypeProtectivePut: "保护性看跌",
    hedgeTypeCollar: "领口",
    hedgeSummaryNoHedge: "保持当前组合不变，作为对冲比较的基准方案。",
    hedgeSummaryFuturesOverlayNeutralize: "用线性期货覆盖层中和大部分方向暴露。",
    hedgeSummaryFuturesOverlayBeta: "用线性期货覆盖层高效压缩市场 Beta。",
    hedgeSummaryProtectivePutTail: "买入下行凸性，在保留上涨空间的同时改善尾部保护。",
    hedgeSummaryProtectivePutGeneral: "买入下行凸性，在保留更多上涨参与的同时减小回撤。",
    hedgeSummaryCollar: "用保护性 put 配合备兑 call 构造领口，以降低对冲持有成本并限制部分上行。",
    hedgeLabRecommendationTitle: "当前优先方案",
    hedgeUniverseExcludesTitle: "当前工具范围排除了",
    hedgeStrategyPrimerTitle: "策略含义",
    hedgeTargetDeltaSummary:
      "当你最先想处理的是方向暴露时，用这个目标。线性对冲通常会排到最前面。",
    hedgeTargetBetaSummary:
      "当你想更高效地压低市场 Beta，同时尽量控制持有成本时，用这个目标。",
    hedgeTargetTailSummary:
      "当你最担心的是左尾风险，而不是严格中和 Delta 时，用这个目标。",
    hedgePrimerFutures:
      "期货对冲最适合快速削减线性市场暴露，但上涨参与度也会一起被压低。",
    hedgePrimerProtectivePut:
      "保护性看跌期权需要支付权利金，但能改善回撤形状，并保留更多上涨空间。",
    hedgePrimerCollar:
      "领口策略通过牺牲部分上涨，换取更低的对冲成本，处在纯期货和纯 put 之间。",
    hedgeRationaleFuturesWhy:
      "这是削减线性 Delta 和 Beta 最直接、实现摩擦较低的方法。",
    hedgeRationaleFuturesTradeOff:
      "它会几乎等比例地削弱上涨参与和下跌敏感度。",
    hedgeRationaleFuturesResidual:
      "Gamma、Vega 和事件驱动的跳空风险仍会留在组合里。",
    hedgeRationalePutWhy:
      "当下行凸性比严格的 Delta 中和更重要时，它通常更合适。",
    hedgeRationalePutTradeOff:
      "支付权利金会带来更明显的负 carry 和 Theta 损耗。",
    hedgeRationalePutResidual:
      "上涨空间保留更多，但净 Delta 和 Beta 只能部分压低。",
    hedgeRationaleCollarWhy:
      "它在控制 carry 的同时，通常能提供比纯期货更好的下行形状。",
    hedgeRationaleCollarTradeOff:
      "一旦价格突破卖出 call 的行权价，上方收益会被牺牲。",
    hedgeRationaleCollarResidual:
      "在 put 行权价以下，以及未完全覆盖的名义敞口上，残余下行仍然存在。",
    hedgeLabOverviewSummary:
      "这一页的重点是先看清每种对冲结构擅长解决什么问题，再去策略比较里做更细的权衡。",
    strategyCompareBestProtection: "保护最强",
    strategyCompareLowestCost: "成本最低",
    dashboardInterpretationTitle: "先看这一层",
    dashboardInterpretationHeadline: "先读整本组合，再去看单个工具。",
    dashboardInterpretationBody:
      "首页的任务不是展示更多图，而是先判断整本组合是否需要处理，再决定是否继续下钻。",
    dashboardDrilldownTitle: "下钻路径",
    dashboardDrilldownHeadline: "先看风险，再看对冲，最后才看工具。",
    dashboardDrilldownBody:
      "把首页当成总览层，只有当某个信号足够重要时，才继续进入解释层和原始数据层。",
    dashboardDrilldownRisk:
      "当你需要知道回撤、集中度或 Greek 压力由谁主导时，进入风险页。",
    dashboardDrilldownHedge:
      "当你已经知道问题是什么，只差比较不同对冲取舍时，进入对冲页。",
    dashboardDrilldownInstrument:
      "只有当你已经明确要看哪个标的或哪类合约时，再进入工具页。",
    riskInterpretationTitle: "风险怎么读",
    riskInterpretationBody:
      "这一页应该把方向压力、集中度和情景损失分开，让你知道该先处理哪一类风险。",
    riskInterpretationDirectional:
      "方向风险告诉你，这本书整体上还有多大程度像一个市场方向押注。",
    riskInterpretationConcentration:
      "集中度告诉你，是否有某个标的、到期日或分组在主导整个风险故事。",
    riskInterpretationScenario:
      "情景损失告诉你，当市场对你不利时，组合会以多快的速度恶化。",
    riskDecisionTitle: "判断框架",
    riskDecisionHeadline: "只升级那些会实质改变组合结果的风险。",
    riskDecisionBody:
      "用最差情景和最高集中度分组来判断，是需要立刻对冲，还是只需要继续监控。",
    hedgeInterpretationTitle: "对冲怎么读",
    hedgeInterpretationBody:
      "重点不是找一个看起来最花哨的结构，而是搞清楚每种对冲到底消掉了什么风险，又引入了什么成本。",
    hedgeInterpretationLinear:
      "线性对冲更适合解决市场方向或 Beta 这类一阶暴露。",
    hedgeInterpretationConvex:
      "凸性对冲更适合在意尾部保护和收益分布形状的场景。",
    hedgeInterpretationCarry:
      "持有成本决定一个对冲能不能长期保留，而不只是纸面上看起来好看。",
    hedgeDecisionHeadline: "把保护、持有成本和残余风险放在一起比较。",
    hedgeDecisionBody:
      "先把领先的对冲候选方案当成提案，再去策略比较页判断这份保护是否值得付出持有成本和上涨放弃。",
    instrumentInterpretationTitle: "工具怎么读",
    instrumentInterpretationBody:
      "这一页应该服务于组合层已经做出的判断，而不是让你从原始链噪声重新开始。",
    instrumentInterpretationChain:
      "期权链用于在行权价、到期日和流动性之间做快速横向比较。",
    instrumentInterpretationProfile:
      "风险剖面用于理解单张合约的 Greeks 和局部敏感度。",
    instrumentInterpretationSurface:
      "曲面视图用于判断一张合约在附近结构里是贵还是便宜。",
    instrumentDecisionTitle: "当前焦点",
    instrumentDecisionBody:
      "一旦焦点标的明确，就保持合约上下文稳定，再联合比较期权链、风险剖面和曲面。",
  },
};

export function createTranslator(language: Language) {
  return (key: I18nKey): string => translations[language][key];
}

const backendMessageCatalog = {
  "Directional beta exposure is elevated.": "riskSummaryDirectionalBetaElevated",
  "Net vega exposure is elevated.": "riskSummaryVegaExposureElevated",
} as const satisfies Record<string, I18nKey>;

export function translateBackendMessage(
  language: Language,
  message: string,
): string {
  const match = backendMessageCatalog[message as keyof typeof backendMessageCatalog];
  if (match) {
    return translations[language][match];
  }

  const directionalDetails = message.match(/^Current beta proxy is ([\d.-]+)\.$/);
  if (directionalDetails) {
    return translations[language].riskDetailsDirectionalBetaElevated.replace(
      "{value}",
      directionalDetails[1],
    );
  }

  const vegaDetails = message.match(/^Current vega is ([\d.-]+)\.$/);
  if (vegaDetails) {
    return translations[language].riskDetailsVegaExposureElevated.replace(
      "{value}",
      vegaDetails[1],
    );
  }

  const symbolConcentration = message.match(/^The book is concentrated in (.+)\.$/);
  if (symbolConcentration) {
    return translations[language].riskSummaryTopSymbolConcentration.replace(
      "{bucket}",
      symbolConcentration[1],
    );
  }

  const symbolConcentrationDetails = message.match(
    /^(.+) contributes the largest market value slice\.$/,
  );
  if (symbolConcentrationDetails) {
    return translations[language].riskDetailsTopSymbolConcentration.replace(
      "{bucket}",
      symbolConcentrationDetails[1],
    );
  }

  const expiryConcentration = message.match(/^Expiry concentration is elevated in (.+)\.$/);
  if (expiryConcentration) {
    return translations[language].riskSummaryExpiryConcentration.replace(
      "{bucket}",
      expiryConcentration[1],
    );
  }

  const expiryConcentrationDetails = message.match(
    /^(.+) currently dominates expiry-level risk\.$/,
  );
  if (expiryConcentrationDetails) {
    return translations[language].riskDetailsExpiryConcentration.replace(
      "{bucket}",
      expiryConcentrationDetails[1],
    );
  }

  return message;
}

export function translateRiskCategory(language: Language, category: string): string {
  const normalized = category.toLowerCase();
  if (normalized === "directional") return translations[language].riskCategoryDirectional;
  if (normalized === "concentration") return translations[language].riskCategoryConcentration;
  if (normalized === "volatility") return translations[language].riskCategoryVolatility;
  if (normalized === "expiry") return translations[language].riskCategoryExpiry;
  return category;
}

export function translateHedgeLabel(language: Language, label: string): string {
  if (label === "No hedge") return translations[language].hedgeLabelNoHedge;
  if (label === "Futures overlay") return translations[language].hedgeLabelFuturesOverlay;
  if (label === "Protective put") return translations[language].hedgeLabelProtectivePut;
  if (label === "Cost-controlled collar") return translations[language].hedgeLabelCollar;
  return label;
}

export function translateHedgeType(language: Language, hedgeType: string): string {
  if (hedgeType === "none") return translations[language].hedgeTypeNone;
  if (hedgeType === "futuresOverlay") return translations[language].hedgeTypeFuturesOverlay;
  if (hedgeType === "protectivePut") return translations[language].hedgeTypeProtectivePut;
  if (hedgeType === "collar") return translations[language].hedgeTypeCollar;
  return hedgeType;
}

export function translateHedgeSummary(language: Language, summary: string): string {
  if (summary === "Keep the current book unchanged as the baseline reference.") {
    return translations[language].hedgeSummaryNoHedge;
  }
  if (summary === "Use a linear futures overlay to neutralize most directional exposure.") {
    return translations[language].hedgeSummaryFuturesOverlayNeutralize;
  }
  if (summary === "Use a linear futures overlay to compress most market beta efficiently.") {
    return translations[language].hedgeSummaryFuturesOverlayBeta;
  }
  if (
    summary ===
    "Buy downside convexity to improve crash protection while keeping upside open."
  ) {
    return translations[language].hedgeSummaryProtectivePutTail;
  }
  if (
    summary ===
    "Buy downside convexity to reduce drawdown while retaining more upside participation."
  ) {
    return translations[language].hedgeSummaryProtectivePutGeneral;
  }
  if (
    summary ===
    "Pair a protective put with a covered upside call sale to lower hedge carry while capping some upside."
  ) {
    return translations[language].hedgeSummaryCollar;
  }
  return summary;
}
