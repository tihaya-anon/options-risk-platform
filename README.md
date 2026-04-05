# Options Risk Platform

Options risk workbench delivered as a frontend + backend product.

## Architecture

- `frontend`:
  Static React dashboard focused on visualization and decision support
- `backend`:
  Provider adapters, option-chain enrichment, and portfolio analysis
- `docker-compose.yml`:
  Bundles both services for end users

## Product Model

The intended delivery model is:

- users run the stack themselves
- users provide their own API keys in backend configuration
- users import their own position data
- the platform provides visualization, risk decomposition, and analysis

## Current Backend Responsibilities

- provider selection
- snapshot retrieval
- IV / Greeks enrichment
- portfolio risk aggregation
- scenario analysis:
  - spot shock
  - volatility shock
  - time decay shock
- rule-based advisory output

## Current Frontend Responsibilities

- route-based dashboard UI
- positions import
- grouped exposure views
- scenario charts
- overview workflow page

## Local Development

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Backend:

```bash
cd backend
node --watch src/server.mjs
```

## Docker Compose

```bash
docker compose up --build
```

Then open:

- frontend: `http://localhost:8080`
- backend: `http://localhost:8787/api/health`

## Provider Notes

The backend currently ships with:

- `mock`
- `yahooSynthetic`

`yahooSynthetic` fetches a live underlying spot and generates a synthetic option chain around it. This is useful for architecture validation, but it is not a production-grade chain source.

The next step is to add real provider adapters that read user-supplied API keys from backend configuration.
