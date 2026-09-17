#!/usr/bin/env bash
# Install repo git hooks (pre-commit auto-syncs English site content).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$ROOT/.git/hooks"
SRC="$ROOT/scripts/pre-commit.sh"
DST="$HOOKS_DIR/pre-commit"

if [[ ! -d "$HOOKS_DIR" ]]; then
  echo "No .git/hooks directory found (not a git checkout?)."
  exit 1
fi

if [[ ! -f "$SRC" ]]; then
  echo "Missing hook script: $SRC"
  exit 1
fi

if [[ -e "$DST" && ! -L "$DST" ]]; then
  backup="${DST}.bak.$(date +%Y%m%d%H%M%S)"
  echo "Existing pre-commit hook found — backing up to $backup"
  mv "$DST" "$backup"
fi

ln -sfn "$SRC" "$DST"
chmod +x "$SRC"
echo "Installed pre-commit hook → $DST"
echo "Staged edits to docs/GIT_FROM_ZERO.md or labs/*/README.md will run: ./scripts/sync_en_content.sh"
