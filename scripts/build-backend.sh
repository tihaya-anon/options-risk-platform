#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"
npx tsc -p tsconfig.json
