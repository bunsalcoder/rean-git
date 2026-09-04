#!/usr/bin/env bash
# Build a completed playground for labs/04-conflict.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "04-conflict"
cd "${FIXTURE_PG}"

printf 'line one\nshared line\nline three\n' > notes.txt
fixture_commit "Add notes"
fixture_switch -c feature/alt
printf 'line one\nshared line from feature\nline three\n' > notes.txt
fixture_commit "Change shared line on feature"
fixture_switch main
printf 'line one\nshared line from main\nline three\n' > notes.txt
fixture_commit "Change shared line on main"
set +e
fixture_git merge feature/alt >/dev/null 2>&1
set -e
printf 'line one\nshared line resolved\nline three\n' > notes.txt
fixture_git add notes.txt
fixture_git commit -m "Merge feature/alt; resolve shared line" >/dev/null
