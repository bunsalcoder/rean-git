#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "15-inspect-history"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "login.py uses redirect" file_contains auth/login.py redirect
lab_check "feat/banner branch exists" branch_exists feat/banner
lab_check "two commits on feat/banner not on main" test "$(branch_ahead_count main feat/banner)" -ge 2
lab_check "redirect change is in history" log_matches "Change login to redirect"

lab_finish
