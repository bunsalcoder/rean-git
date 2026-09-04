#!/usr/bin/env bash
# Build a completed playground for labs/12-cherry-pick.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "12-cherry-pick"
cd "${FIXTURE_PG}"

printf 'base\n' > app.txt
fixture_commit "Base"
fixture_switch -c feat/experiment
printf 'experiment\n' >> app.txt
fixture_commit "Experiment WIP"
printf 'critical fix\n' > fix.txt
fixture_commit "Fix: critical patch"
FIX="$(fixture_git rev-parse HEAD)"
fixture_switch main
fixture_git cherry-pick "${FIX}" >/dev/null
