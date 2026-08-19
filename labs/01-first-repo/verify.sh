#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "01-first-repo"
lab_use_playground "${LAB_ROOT}"

lab_check "playground is a git repo" test -d "${LAB_PG}/.git"
lab_check "working tree is clean" is_clean_tree
lab_check "at least two commits" test "$(commit_count)" -ge 2

lab_finish
