#!/usr/bin/env bash
# Build a completed playground for labs/15-worktrees.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "15-worktrees"
cd "${FIXTURE_PG}"

LAB_DIR="$(cd .. && pwd)"
REVIEW_DIR="${LAB_DIR}/review"
rm -rf "${REVIEW_DIR}"

printf 'main app\n' > app.txt
fixture_commit "Start app on main"
fixture_git tag -a v0.1.0 -m "Checkpoint" >/dev/null
fixture_switch -c feat/notes
printf 'notes wip\n' > notes.txt
fixture_commit "Add notes draft"
fixture_switch main

fixture_git switch --detach v0.1.0 >/dev/null
printf 'hotfix line\n' >> app.txt
fixture_commit "Hotfix while detached"
fixture_switch -c hotfix/from-tag
fixture_switch main

printf 'local scratch on main\n' >> app.txt
fixture_git worktree add "${REVIEW_DIR}" feat/notes >/dev/null

(
  cd "${REVIEW_DIR}"
  git config user.name "Lab Fixture"
  git config user.email "fixture@rean-git.test"
  printf 'notes ready\n' > notes.txt
  git add notes.txt
  git commit -m "Finish notes draft" >/dev/null
)

cd "${FIXTURE_PG}"
fixture_git worktree remove "${REVIEW_DIR}" >/dev/null
fixture_switch feat/notes
fixture_git restore app.txt >/dev/null
