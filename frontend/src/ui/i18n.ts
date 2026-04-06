import type { Language } from "./config";

export type I18nKey =
  | "appEyebrow"
  | "appTitle"
  | "appLede"
  | "controlTowerTitle"
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
  | "hedgeLabTitle"
  | "hedgeLabDesc"
  | "strategyCompareTitle"
  | "strategyCompareDesc"
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
  | "dashboardTopRisksTitle"
  | "dashboardHedgeIdeasTitle"
  | "dashboardScenarioWatchTitle"
  | "dashboardInstrumentFocusTitle"
  | "dashboardOpenRiskMap"
  | "dashboardOpenHedgeLab"
  | "dashboardOpenScenarios"
  | "dashboardOpenChain"
  | "dashboardOpenBook"
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
  | "strategyExplanationTitle";

const translations: Record<Language, Record<I18nKey, string>> = {
  en: {
    appEyebrow: "Static Options Risk Platform",
    appTitle: "Option Risk Should Read Like a Control Panel, Not a Spreadsheet.",
    appLede:
      "A static TypeScript dashboard with pluggable implied-volatility modeling. Today it uses Black-Scholes. Tomorrow it can swap models without rewriting the UI contract.",
    controlTowerTitle: "Portfolio Risk Control Tower",
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
      "Configure the backend endpoint, data provider, and optional focus underlying for surface-level views.",
    currentBookTitle: "Current Book",
    currentBookDesc:
      "Normalize the current holdings into a portfolio book before comparing hedge overlays.",
    riskMapTitle: "Risk Map",
    riskMapDesc:
      "Summarize concentration, directional exposure, and top risk flags at the portfolio level.",
    hedgeLabTitle: "Hedge Lab",
    hedgeLabDesc:
      "Compare simple hedge overlays before committing to execution.",
    strategyCompareTitle: "Strategy Compare",
    strategyCompareDesc:
      "Review baseline and hedge candidates side by side across cost and residual exposure.",
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
    overviewTitle: "Dashboard",
    overviewDesc:
      "Start with the most important portfolio signals, then drill into risks, hedges, and instruments only when needed.",
    dashboardSignal: "Book signal",
    dashboardSignalHealthy: "Balanced",
    dashboardSignalWatch: "Watchlist",
    dashboardSignalDefensive: "Defensive",
    dashboardTopRisksTitle: "Primary Risks",
    dashboardHedgeIdeasTitle: "Hedge Ideas",
    dashboardScenarioWatchTitle: "Scenario Watch",
    dashboardInstrumentFocusTitle: "Instrument Focus",
    dashboardOpenRiskMap: "Open risk map",
    dashboardOpenHedgeLab: "Open hedge lab",
    dashboardOpenScenarios: "Open scenarios",
    dashboardOpenChain: "Open chain",
    dashboardOpenBook: "Open book",
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
    positionsPlaceholder: "SPY,100\nSPY260515P00525000,2\nSPY260417C00540000,-1",
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
      "Current backend path can fetch snapshots and run portfolio analytics.",
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
    hedgeUniverseAll: "Futures + options",
    hedgeUniverseFutures: "Futures only",
    hedgeUniverseOptions: "Options only",
    hedgeWhy: "Why",
    hedgeTradeOffs: "Trade-offs",
    hedgeResidualRisks: "Residual risks",
    strategyExplanationTitle: "Decision notes",
  },
  zh: {
    appEyebrow: "静态期权风险平台",
    appTitle: "期权风险界面应该像控制台，而不是电子表格。",
    appLede:
      "这是一个静态 TypeScript 风险面板，隐含波动率模型通过通用接口接入。当前先用 Black-Scholes，后续可替换而不重写前端契约。",
    controlTowerTitle: "组合风险控制塔",
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
      "配置前端请求数据的 API 地址、数据提供方，以及仅用于曲面类页面的可选焦点标的。",
    currentBookTitle: "当前持仓簿",
    currentBookDesc: "先把当前持仓标准化成组合持仓簿，再去比较不同对冲方案。",
    riskMapTitle: "风险地图",
    riskMapDesc: "从组合层总结集中度、方向暴露和主要风险提示。",
    hedgeLabTitle: "对冲实验室",
    hedgeLabDesc: "在执行前比较最简单的对冲覆盖方案。",
    strategyCompareTitle: "策略比较",
    strategyCompareDesc: "并排查看基准方案和对冲候选方案的成本与剩余风险。",
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
    overviewTitle: "控制塔",
    overviewDesc:
      "先看最关键的组合信号，再按风险、对冲和工具页面逐层下钻，而不是直接面对原始数据。",
    dashboardSignal: "组合状态",
    dashboardSignalHealthy: "相对平衡",
    dashboardSignalWatch: "需要关注",
    dashboardSignalDefensive: "偏防御",
    dashboardTopRisksTitle: "主要风险",
    dashboardHedgeIdeasTitle: "对冲思路",
    dashboardScenarioWatchTitle: "情景观察",
    dashboardInstrumentFocusTitle: "工具视角",
    dashboardOpenRiskMap: "进入风险地图",
    dashboardOpenHedgeLab: "进入对冲实验室",
    dashboardOpenScenarios: "进入情景分析",
    dashboardOpenChain: "进入期权链",
    dashboardOpenBook: "进入持仓簿",
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
    positionsPlaceholder: "SPY,100\nSPY260515P00525000,2\nSPY260417C00540000,-1",
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
    hedgeUniverseAll: "期货 + 期权",
    hedgeUniverseFutures: "仅期货",
    hedgeUniverseOptions: "仅期权",
    hedgeWhy: "适用原因",
    hedgeTradeOffs: "主要取舍",
    hedgeResidualRisks: "残余风险",
    strategyExplanationTitle: "决策说明",
  },
};

export function createTranslator(language: Language) {
  return (key: I18nKey): string => translations[language][key];
}
