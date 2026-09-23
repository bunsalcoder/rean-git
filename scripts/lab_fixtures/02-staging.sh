#!/usr/bin/env bash
# Build a completed playground for labs/02-staging.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "02-staging"
cd "${FIXTURE_PG}"

printf '%s\n' '<h1>Welcome</h1>' > index.html
printf '%s\n' 'personal scratch pad' > notes.md
fixture_commit "Add starter homepage and notes"

printf '%s\n' '<h1>Welcome home</h1>' > index.html
printf '%s\n' 'draft dark mode styles' > dark-mode.css
echo "buy milk" >> notes.md

# Stage and commit only the homepage fix — leave WIP unstaged.
git add index.html
git commit -m "Fix homepage welcome heading typo" >/dev/null
