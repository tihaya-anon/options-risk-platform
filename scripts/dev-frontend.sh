#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"
env PNPM_HOME=../.pnpm-home PNPM_STORE_DIR=../.pnpm-store npm_config_cache=../.npm-cache pnpm dev
