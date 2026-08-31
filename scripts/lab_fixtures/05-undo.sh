#!/usr/bin/env bash
# Build a completed playground for labs/05-undo.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "05-undo"
cd "${FIXTURE_PG}"

printf 'v1\n' > file.txt
fixture_commit "Add file"
printf 'v2\n' >> file.txt
fixture_commit "Bump file to v2"
fixture_git revert HEAD --no-edit >/dev/null
