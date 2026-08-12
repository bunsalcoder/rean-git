#!/usr/bin/env bash
# Run locale / content / link quality checks.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 ./scripts/check_site_quality.py
