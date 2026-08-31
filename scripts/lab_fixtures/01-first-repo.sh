#!/usr/bin/env bash
# Build a completed playground for labs/01-first-repo.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "01-first-repo"
cd "${FIXTURE_PG}"

printf '# Lab 01 notes\n' > README.md
fixture_commit "Add README"
printf 'Practicing my first commits.\n' >> README.md
fixture_commit "Document the practice goal"
