#!/usr/bin/env bash
# Build a completed playground for labs/08-stash.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "08-stash"
cd "${FIXTURE_PG}"

printf 'v1\n' > notes.txt
fixture_commit "Add notes"
printf 'draft idea\n' >> notes.txt
printf 'scratch\n' > idea.md
fixture_git stash push -u -m "wip notes and idea" >/dev/null
printf 'hotfix line\n' >> notes.txt
fixture_commit "Hotfix typo"

# Hotfix and stash both touch notes.txt — resolve like a careful learner.
set +e
fixture_git stash pop >/dev/null 2>&1
pop_status=$?
set -e
if (( pop_status != 0 )); then
  printf 'v1\nhotfix line\ndraft idea\n' > notes.txt
  fixture_git add notes.txt idea.md
  if [[ -n "$(fixture_git stash list)" ]]; then
    fixture_git stash drop >/dev/null
  fi
fi

# Commit restored WIP so verify sees a clean tree with draft content present.
fixture_git add notes.txt idea.md
fixture_commit "Restore stashed draft"
