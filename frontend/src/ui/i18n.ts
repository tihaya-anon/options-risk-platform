import type { Language } from "./config";

export type I18nKey =
  | "appEyebrow"
  | "appTitle"
  | "appLede"
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
  | "apiBaseUrl"
  | "symbol"
  | "provider"
  | "advisorMode"
  | "saveSettings"
  | "overviewTitle"
  | "overviewDesc"
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
  | "chainTitle"
  | "chainDesc"
  | "strike"
  | "mid"
  | "delta"
  | "gamma"
  | "vega"
  | "theta"
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
  | "advisorLlm";

const translations: Record<Language, Record<I18nKey, string>> = {
  en: {
    appEyebrow: "Static Options Risk Platform",
    appTitle: "Option Risk Should Read Like a Control Panel, Not a Spreadsheet.",
    appLede:
      "A static TypeScript dashboard with pluggable implied-volatility modeling. Today it uses Black-Scholes. Tomorrow it can swap models without rewriting the UI contract.",
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
      "Configure where the frontend requests data from, and which default underlying to analyze.",
    apiBaseUrl: "API Base URL",
    symbol: "Symbol",
    provider: "Provider",
    advisorMode: "Advisor mode",
    saveSettings: "Save settings",
    overviewTitle: "Overview",
    overviewDesc:
      "A compact landing page for the most important current risk signals before you drill into detail pages.",
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
    chainTitle: "Chain Cards",
    chainDesc:
      "Compact cards for scanning strikes, IV, Greeks, and open interest without falling back to a spreadsheet grid.",
    strike: "Strike",
    mid: "Mid",
    delta: "Delta",
    gamma: "Gamma",
    vega: "Vega",
    theta: "Theta",
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
  },
  zh: {
    appEyebrow: "静态期权风险平台",
    appTitle: "期权风险界面应该像控制台，而不是电子表格。",
    appLede:
      "这是一个静态 TypeScript 风险面板，隐含波动率模型通过通用接口接入。当前先用 Black-Scholes，后续可替换而不重写前端契约。",
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
      "配置前端请求数据的 API 地址，以及默认分析的标的代码。",
    apiBaseUrl: "API 基础地址",
    symbol: "标的代码",
    provider: "数据提供方",
    advisorMode: "建议引擎模式",
    saveSettings: "保存设置",
    overviewTitle: "总览",
    overviewDesc:
      "打开平台后先看到最关键的风险摘要，再决定是否继续深入到细分页面。",
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
    chainTitle: "期权链卡片视图",
    chainDesc: "用紧凑卡片浏览行权价、IV、Greeks 和持仓兴趣度，避免退回到传统表格思维。",
    strike: "行权价",
    mid: "中间价",
    delta: "Delta",
    gamma: "Gamma",
    vega: "Vega",
    theta: "Theta",
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
  },
};

export function createTranslator(language: Language) {
  return (key: I18nKey): string => translations[language][key];
}
