#!/usr/bin/env bash
# Build a completed playground for labs/02-branch-merge.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "02-branch-merge"
cd "${FIXTURE_PG}"

printf '# Branch lab\n' > README.md
fixture_commit "Initial commit"
fixture_switch -c feature/greeting
printf 'Hello from a branch.\n' >> README.md
fixture_commit "Add greeting line"
fixture_switch main
fixture_git merge --no-ff feature/greeting -m "Merge feature/greeting" >/dev/null
fixture_git branch -d feature/greeting >/dev/null
