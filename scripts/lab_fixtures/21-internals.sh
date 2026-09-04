#!/usr/bin/env bash
# Build a completed playground for labs/21-internals.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "21-internals"
cd "${FIXTURE_PG}"

printf 'hello\n' > hello.txt
fixture_commit "Add hello"
