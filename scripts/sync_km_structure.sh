#!/usr/bin/env bash
# Scaffold missing Khmer markdown from English structure (headings + placeholders).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

python3 ./scripts/sync_km_structure.py "$@"

if [[ " $* " != *" --dry-run "* ]]; then
  echo
  ./scripts/check_km_content_sync.sh
fi
