#!/usr/bin/env bash
# Fail if Khmer handbook/labs drift from English structure or still need translation.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 ./scripts/check_km_content_sync.py
