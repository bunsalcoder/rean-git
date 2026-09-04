#!/usr/bin/env bash
# Build a completed playground for labs/02-branching.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "02-branching"
cd "${FIXTURE_PG}"

printf '# Branching lab\n' > README.md
fixture_commit "Initial commit"
fixture_switch -c feat/contact-page
printf 'Contact page draft.\n' >> README.md
fixture_commit "Draft contact page"
fixture_switch main
fixture_switch -c fix/homepage-crash
printf 'Homepage crash fix.\n' >> README.md
fixture_commit "Fix homepage crash"
fixture_switch main
