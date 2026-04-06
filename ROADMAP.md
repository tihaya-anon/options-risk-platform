# 路线图

这个文档用于跟踪产品从“单标的期权风险工作台”演进为“组合风险与对冲决策平台”的迭代计划。

## 产品方向

当前产品正在从：

- `single-underlying options risk workbench`

演进到：

- `portfolio risk and hedge decision workbench`

希望最终形成的主流程是：

1. `Current Book`
2. `Risk Map`
3. `Hedge Lab`
4. `Strategy Compare`
5. `Surface / Option Risk Profile`

## 当前产品策略

当前优先级已经调整为：

1. 先做 `pure frontend + GitHub Actions daily snapshots` 的可用宣传版
2. 再做 `optional backend live mode` 作为增强能力

这意味着：

- 默认体验应当不依赖在线后端
- 用户持仓导入与解析应尽量在前端完成
- 组合风险聚合优先基于每日快照中预计算好的 Greeks 做线性叠加
- 后端主要承担实时抓取、重计算、更高精度模型和未来 LLM / copilot 能力

## 当前状态

- [x] 前后端分离架构
- [x] OpenAPI 契约与 Orval 生成链
- [x] MSW mock 开发链
- [x] 固定侧边栏 + 固定顶部工具条 + 主区内滚的 panel 布局
- [x] 统一 `PanelSection` 外壳与滚动容器
- [x] `Overview`
- [x] `Current Book`
- [x] `Risk Map`
- [x] `Hedge Lab` 最小版
- [x] `Strategy Compare` 最小版
- [x] `Surface` 分组下的 `Term Structure / Skew / Chain / Option Risk Profile`
- [x] `Provider Connection` 基础页面
- [x] `Chain -> Option Risk Profile` 联动
- [x] `Chain` 双视图、排序与 sticky table header
- [x] 统一 Greeks 视觉组件与主要页面接入
- [x] `Option Risk Profile` 分层筛选

## 近期功能

### Static Daily Demo

- [ ] 新增 `daily snapshot pipeline`
  - [ ] 通过 GitHub Actions 每日抓取 top universe
  - [ ] 产出 `latest manifest`
  - [ ] 按 symbol 产出静态 snapshot JSON

- [ ] 在 daily pipeline 中预计算 Greeks
  - [ ] delta
  - [ ] gamma
  - [ ] vega
  - [ ] theta

- [ ] 前端本地完成持仓簿解析
  - [ ] CSV / 文本导入
  - [ ] instrument normalization
  - [ ] 合约匹配与 unmatched 提示

- [ ] 前端基于静态快照做组合风险计算
  - [ ] 通过已知 Greeks 做线性叠加
  - [ ] 生成 current book / risk map / hedge lab / strategy compare 所需结果

- [ ] 页面明确展示数据时效
  - [ ] `as of previous close`
  - [ ] delayed data disclaimer

### Provider Connection

- [x] 新增 `provider-aware connection test`
  - 目标：不只测服务是否存活，而是真正测试当前 provider 和当前 symbol
  - 预期返回：
    - 是否成功
    - provider id
    - symbol
    - 响应耗时
    - 错误详情

- [x] 在后端新增 `POST /providers/test`

- [ ] 在前端 `Provider Connection` 页展示连接测试结果面板

- [x] 根据 provider metadata 展示更明确的能力边界
  - [x] 是否需要 API key
  - [x] 是否支持真实期权链
  - [x] 是否支持 Greeks
  - [x] 是否支持场景分析
  - [x] provider 说明与 notes
  - [x] API key 占位输入

### Hedge Lab

- [x] 增加 `hedge universe` 控制
  - [x] `futures only`
  - [x] `options only`
  - [x] `futures + options`

- [x] 增加 `hedge target`
  - [x] `neutralize delta`
  - [x] `reduce beta`
  - [x] `tail protection`

- [x] 让 `Hedge Lab` 的 proposal 更贴近决策页面
  - [x] 显示为什么推荐该方案
  - [x] 显示该方案主要 trade-off
  - [x] 显示主要残余风险

### Strategy Compare

- [x] 增加 explanation block
  - [x] 解释 upside retention
  - [x] 解释 downside protection
  - [x] 解释 carry / theta
  - [x] 解释 residual beta / delta / vega

- [ ] 支持 comparison row 的排序和筛选

### Option Risk Profile

- [x] 合约分层筛选
  - [x] expiry
  - [x] option type
  - [x] strike

- [ ] 增加更真实的单合约场景视图
  - [ ] vol shock
  - [ ] time decay
  - [ ] 更明确的单合约 PnL 解释

- [ ] 增加与 `Chain` 的更强联动
  - [x] 点击 chain 卡片跳转到 profile
  - [ ] 选中高亮
  - [ ] 返回链上保留上下文

## 数据模型与契约

### 已完成

- [x] `Position`
- [x] `BookSnapshot`
- [x] `ExposureSummary`
- [x] `RiskMap`
- [x] `HedgeProposal`
- [x] `StrategyComparison`

### 下一步

- [ ] 让前端 `book parse` 支持更明确的 instrument type 输入格式
- [ ] 让 `risk-map` 输出更丰富的 concentration / factor 风险摘要
- [x] 让 `hedge-lab` 输出更丰富的 rationale 字段
- [x] 让 `strategy-compare` 输出 explanation 字段

## UI 与信息架构

### Sidebar

- [x] 改为按工作流分组
  - [x] `Book`
  - [x] `Risk`
  - [x] `Hedge`
  - [x] `Surface`

- [x] 增加更清晰的当前路径提示
- [ ] 增加折叠态设计

### Greeks 展示规则

- [x] 抽出统一 Greeks 视觉组件
- [x] 单合约和组合层共享同一套视觉语言
- [x] 希腊字母主视觉 + 英文小号说明

- [x] 主要页面接入统一 Greeks 视觉
  - [x] `Greeks Summary`
  - [x] `Option Risk Profile`
  - [x] `Current Book`
  - [x] `Risk Map`
  - [x] `Grouped Exposure`
  - [x] `Quote / Chain`
- [ ] 清查剩余边角信息，确认没有遗漏的旧样式

### Chain / Surface

- [x] `Chain` 双视图
  - [x] cards
  - [x] compare table

- [x] cards 视图基础排序
- [x] table 视图全字段排序
- [x] sticky table header
- [x] 卡片/表格行点击联动到 `Option Risk Profile`

- [ ] 考虑是否加入“固定列”或“更多列可配置”

### Panel / 滚动体验

- [x] 页面不依赖浏览器原生滚动
- [x] 左侧 sidebar 外壳固定、内部滚动
- [x] 主区 panel 外壳固定、内部滚动
- [x] 自定义滚动条样式
- [ ] 继续校正 header 与主区的精确对齐

## LLM 悬浮助手

### 目标

- [ ] 做成一个全局悬浮球入口
- [ ] 让助手理解“当前页面上下文”
- [ ] 尽量减少幻觉，避免让 LLM 成为核心逻辑依赖

### 设计原则

- [ ] 不先做通用聊天框
- [ ] 优先做 `page-aware copilot`
- [ ] 不通过 DOM 文本抓取作为主数据来源
- [ ] 通过结构化 page context 向助手提供数据

### 实施阶段

- [ ] Phase 1：悬浮球 + 空面板 + 页面上下文框架
- [ ] Phase 2：读取当前页面结构化上下文
- [ ] Phase 3：接 mock / placeholder reasoning layer
- [ ] Phase 4：接真实 LLM 后端

### 页面上下文计划

- [ ] `Current Book` 上下文
- [ ] `Risk Map` 上下文
- [ ] `Hedge Lab` 上下文
- [ ] `Strategy Compare` 上下文
- [ ] `Option Risk Profile` 上下文

## 推荐实现顺序

- [ ] 1. `daily snapshot pipeline + manifest`
- [ ] 2. 前端本地 `book parse + matching`
- [ ] 3. 前端基于预计算 Greeks 做组合聚合
- [ ] 4. `option risk profile` 更真实的场景分析
- [ ] 5. `optional backend live mode` 收敛职责边界
- [ ] 6. 全局 page context 基础设施
- [ ] 7. LLM 悬浮球 UI
- [ ] 8. 真实 LLM 接入

## 当前前端进展摘要

- [x] 已从“单标的期权面板”迈到“组合风险与对冲决策工作台”的信息架构
- [x] 已形成 `Current Book -> Risk Map -> Hedge Lab -> Strategy Compare -> Surface` 主路径
- [x] 单合约层与组合层已经开始明确分层
- [x] mock 开发链可以在无后端情况下演示主要页面
- [ ] 下一阶段重点转向：provider 实测、hedge 决策解释、LLM 页面上下文基础设施

## 暂不做

- [ ] broker execution / 下单路由
- [ ] 实时流式行情
- [ ] 复杂期权策略编辑器
- [ ] 让宣传版依赖在线后端
- [ ] 让用户持仓在宣传版中上传到服务端
- [ ] 超出以下范围的广义多资产支持：
  - [ ] equities
  - [ ] futures overlays
  - [ ] listed options

当前阶段最重要的是：

- 范围清晰
- 决策路径清晰
- 数据契约稳定
- 页面之间不是功能堆砌，而是工作流闭环
