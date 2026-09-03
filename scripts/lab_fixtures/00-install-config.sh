#!/usr/bin/env bash
# Build a completed playground for labs/00-install-config.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "00-install-config"
cd "${FIXTURE_PG}"

git config user.name "Lab Learner"
git config user.email "lab@example.com"
git config init.defaultBranch main
printf '# Install lab\n' > README.md
fixture_commit "First configured commit"
