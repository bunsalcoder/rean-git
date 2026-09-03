#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "00-local-remote"
lab_use_playground "${LAB_ROOT}"

lab_check "origin remote configured" remote_exists
lab_check "bare origin exists" test -d "${LAB_ROOT}/sandbox/origin.git"
lab_check "on main branch" test "$(git_pg branch --show-current)" = "main"
lab_check "working tree is clean" is_clean_tree
lab_check "pulled note from other clone" file_contains README.md "Hello from the other clone"
lab_check "other clone commit in history" log_matches "Add note from other clone"

lab_finish
