#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "11-interactive-rebase"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "squashed to two commits (Start + one clean commit)" test "$(commit_count)" -eq 2
lab_check "file.txt has combined edits" file_contains file.txt "a"
lab_check "noisy wip commits gone" test "$(git_pg log --oneline | grep -c '^[0-9a-f]* wip$' || true)" -eq 0

lab_finish
