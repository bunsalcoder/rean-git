#!/usr/bin/env bash
# Optional git hook: keep web/content/en/ in sync when English sources are staged.
# Install with: ./scripts/install_git_hooks.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

needs_en_sync=0
while IFS= read -r path; do
  case "$path" in
    docs/GIT_FROM_ZERO.md|labs/*/README.md)
      needs_en_sync=1
      break
      ;;
  esac
done < <(git diff --cached --name-only --diff-filter=ACMR)

if [[ "$needs_en_sync" -eq 0 ]]; then
  exit 0
fi

echo "pre-commit: English sources staged — running ./scripts/sync_en_content.sh"
./scripts/sync_en_content.sh

# Stage regenerated copies so the commit stays self-consistent.
mapfile -t synced < <(git diff --name-only -- web/content/en/)
if [[ "${#synced[@]}" -gt 0 ]]; then
  git add -- "${synced[@]}"
fi

exit 0
