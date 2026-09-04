#!/usr/bin/env bash
# Build a completed playground for labs/14-bisect.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "14-bisect"
cd "${FIXTURE_PG}"

for i in 1 2 3; do
  printf 'ok %s\n' "${i}" > state.txt
  fixture_commit "Good ${i}"
done

printf 'BROKEN\n' > state.txt
fixture_commit "Bad: break state"

for i in 4 5 6; do
  printf 'still broken %s\n' "${i}" >> other.txt
  fixture_commit "After ${i}"
done

fixture_git bisect start HEAD HEAD~6 >/dev/null
fixture_git bisect run bash -c 'grep -q BROKEN state.txt && exit 1 || exit 0' >/dev/null
fixture_git bisect reset >/dev/null
