#!/usr/bin/env bash
# Build a completed playground for labs/15-inspect-history.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "15-inspect-history"
cd "${FIXTURE_PG}"

mkdir -p auth
printf 'def login():\n    return "ok"\n' > auth/login.py
fixture_commit "Add login helper"
printf 'def login():\n    return "redirect"\n' > auth/login.py
fixture_commit "Change login to redirect"
fixture_switch -c feat/banner
printf 'banner\n' > banner.txt
fixture_commit "Add homepage banner"
printf 'banner v2\n' > banner.txt
fixture_commit "Tweak banner copy"
fixture_switch main
