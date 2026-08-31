#!/usr/bin/env bash
# Build a completed playground for labs/04-rebase.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "04-rebase"
cd "${FIXTURE_PG}"

printf 'base\n' > app.txt
fixture_commit "Base commit"
fixture_switch -c feature/tweak
printf 'feature change\n' >> app.txt
fixture_commit "Feature tweak"
fixture_switch main
printf 'main update\n' >> app.txt
fixture_commit "Main update"
fixture_switch feature/tweak
set +e
fixture_git rebase main >/dev/null 2>&1
set -e
# Resolve overlapping appends into both lines after base.
printf 'base\nmain update\nfeature change\n' > app.txt
fixture_git add app.txt
GIT_EDITOR=true fixture_git rebase --continue >/dev/null 2>&1
fixture_switch main
fixture_git merge --ff-only feature/tweak >/dev/null
