# Options Risk Platform

这是一个期权与组合风险工作台，支持两种运行形态：

- `static daily demo`
  通过 GitHub Actions 每日抓取内地公开行情并生成 `T-1` 快照，前端纯静态部署即可运行
- `live backend mode`
  通过后端接入 provider、实时抓取和更重的定价/Greeks 计算

## 架构

- `frontend`
  静态 React 面板，负责可视化、交互、持仓导入、本地解析和工作流页面
- `backend`
  作为可选增强层，负责 provider adapter、低延迟抓取、期权链富化和更重的定价逻辑
- `GitHub Actions`
  负责低频抓取、清洗、预计算 Greeks，并产出静态 snapshot JSON
- `docker-compose.yml`
  作为带后端模式的交付入口

## 产品形态

当前希望交付给用户的是：

- 默认情况下用户直接打开静态站即可使用
- 用户自己导入持仓
- 平台负责：
  - 可视化
  - 风险拆解
  - 对冲比较
  - 决策辅助
- 在高级模式下，用户也可以自己提供 API key 使用实时 provider

路线图见：

- `ROADMAP.md`

## Static Daily Demo 目标

这个模式下的核心假设是：

- 市场数据使用 `T-1` 或最近一次 GitHub Actions 成功产出的快照
- 每日快照中已经包含 underlying、option chain 和预计算 Greeks
- 用户上传持仓后，前端只需要做：
  - 合约匹配
  - 持仓解析
  - 已知 Greeks 的线性叠加
  - 风险聚合和页面展示

因此，宣传版不要求浏览器实时重新定价每个合约，也不要求在线后端参与主流程。

## 当前后端职责

在 `live backend mode` 下，后端职责是：

- provider 选择
- snapshot 获取
- IV / Greeks 富化
- 组合风险聚合
- 场景分析
  - spot shock
  - volatility shock
  - time decay shock
- 规则型 advisory 输出
- book / risk-map / hedge-lab / strategy-compare 最小接口

在 `static daily demo` 下，上述能力中与实时抓取或重计算无关的部分应尽量前移到 GitHub Actions 或前端。

## 当前前端职责

- route-based dashboard UI
- positions import
- local book parsing
- local contract matching
- local Greeks aggregation from precomputed daily snapshots
- grouped exposure views
- scenario charts
- current book / risk map / hedge lab / strategy compare
- option surface / option risk profile

## 本地开发

前端：

```bash
cd frontend
pnpm install
pnpm dev
```

默认情况下：

- 不填写 `API Base URL`
- 前端会自动进入 `static daily demo` 模式
- 直接读取 `public/data/latest/manifest.json` 与静态快照文件
- 所有组合解析、风险聚合、对冲比较都在浏览器内完成
- 当前静态样例默认覆盖：
  - `510050`
  - `510300`
  - `510500`

如果需要切换到后端模式：

- 在 `Settings` 中填写后端 `API Base URL`
- 前端就会改为调用 backend API

后端：

```bash
cd backend
node --watch src/server.mjs
```

## Docker Compose

```bash
docker compose up --build
```

启动后：

- frontend: `http://localhost:8080`
- backend: `http://localhost:8787/api/health`

## Provider 说明

当前内置：

- `mock`
- `yahooSynthetic`

其中：

- `yahooSynthetic` 会拉取真实标的现价
- 再围绕现价生成一份合成期权链

它适合：

- 架构验证
- 面板开发
- 工作流联调

但它还不是生产级真实期权链数据源。

后续会继续增加：

- 更真实的 provider adapter
- 用户自带 API key 的接入模式

## Daily Snapshot 思路

当前仓库已经预留了一个面向静态部署的 daily data pipeline：

- GitHub Actions 每个交易日收盘后抓取内地公开行情数据
- 当前脚本使用：
  - 上交所公开当日合约列表
  - 新浪公开期权行情接口
  - 上交所公开 ETF 标的行情接口
- 对可覆盖的合约生成静态链数据，前端再基于快照做 Greeks 富化与组合聚合
- 如果公开端点临时失败，workflow 会优先保留上一次成功的静态快照，避免前端部署空数据
- 生成静态文件，例如：
  - `public/data/latest/manifest.json`
  - `public/data/latest/{symbol}.json`
- 前端按 `as of` 时间读取快照
- 用户持仓仅在浏览器内解析，不上传到服务端
- 当前 workflow 文件：
  - `.github/workflows/static-daily-demo.yml`
- 当前静态生成脚本：
  - `scripts/generate-static-snapshots.mjs`

这个模式的定位是：

- 适合宣传、演示、轻量试用
- 不适合盘中实时交易决策

注意：

- 当前静态模式使用内地公开 web 接口，适合 `T-1` 风险面板和演示站，不适合盘中实时交易决策
- 静态演示模式的价值在于：每天自动抓取真实公开数据，生成可直接部署的 `T-1` 风险看板，而不是手写样例 JSON

## 静态构建

如果你只想验证静态模式，可以直接运行：

```bash
make static-generate
make frontend-build
```

或在 `frontend` 下执行：

```bash
pnpm static:generate
pnpm build
```

这会先生成多标的静态快照，再构建纯前端页面。
