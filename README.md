# Options Risk Platform

这是一个前后端分离的期权与组合风险工作台。

## 架构

- `frontend`
  静态 React 面板，负责可视化、交互和工作流页面
- `backend`
  负责 provider adapter、期权链富化、组合分析和对冲逻辑
- `docker-compose.yml`
  作为最终面向用户的交付入口

## 产品形态

当前希望交付给用户的是：

- 用户自己运行整套系统
- 用户自己提供 API key
- 用户自己导入持仓
- 平台负责：
  - 可视化
  - 风险拆解
  - 对冲比较
  - 决策辅助

路线图见：

- `ROADMAP.md`

## 当前后端职责

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

## 当前前端职责

- route-based dashboard UI
- positions import
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
