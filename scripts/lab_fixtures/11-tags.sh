#!/usr/bin/env bash
# Build a completed playground for labs/11-tags.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "11-tags"
cd "${FIXTURE_PG}"

printf 'app v1\n' > app.txt
fixture_commit "App v1 content"
fixture_git tag -a v1.0.0 -m "Release v1.0.0"
printf 'app v1.0.1\n' > app.txt
fixture_commit "Patch content"
fixture_git tag -a v1.0.1 -m "Release v1.0.1"
