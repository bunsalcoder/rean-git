#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "15-worktrees"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "extra worktree removed" test "$(worktree_count)" -eq 1
lab_check "hotfix/from-tag rescue branch exists" branch_exists hotfix/from-tag
lab_check "feat/notes has finished notes commit" log_matches "Finish notes draft"

lab_finish
