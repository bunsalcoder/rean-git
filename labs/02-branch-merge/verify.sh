#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "02-branch-merge"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "greeting merged into README.md" file_contains README.md "Hello from a branch"
lab_check "feature/greeting branch deleted" branch_gone feature/greeting
lab_check "at least three commits on main" test "$(commit_count)" -ge 3

lab_finish
