# Options Risk Platform

Static TypeScript options risk dashboard intended for GitHub Pages deployment.

## Goals

- Show a daily options snapshot as a static page
- Keep IV computation behind a pluggable interface
- Start with Black-Scholes for implied volatility and Greeks
- Update snapshot data daily with GitHub Actions

## Current Scope

- Static one-page dashboard
- Underlying summary
- IV surface snapshot by expiry/strike
- Chain-level Greeks table
- Daily JSON snapshot generation

## Why This Is Structured This Way

- `src/lib/bs.ts`
  Black-Scholes implementation through a generic `IvModel` interface
- `src/lib/enrich.ts`
  Turns raw quotes into IV + Greeks enriched rows
- `public/data/latest.json`
  Static snapshot consumed by the app
- `scripts/update-data.mjs`
  Daily snapshot writer for local runs and GitHub Actions

## Local Usage

```bash
pnpm install
pnpm update-data
pnpm dev
```

## Build

```bash
pnpm build
```

## Data Update Notes

The action currently tries to fetch the underlying spot from Yahoo Finance and then generates a synthetic option chain around that spot.

This is deliberate:

- keeps the platform deployable without paid data
- keeps the UI and risk plumbing testable
- leaves a clean seam to replace the chain source later

You can later swap `scripts/update-data.mjs` to use:

- broker API snapshots
- Polygon / Tradier / Alpaca / ThetaData
- your own backend pipeline

without changing the frontend contract.
