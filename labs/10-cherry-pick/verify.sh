#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "10-cherry-pick"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "feat/experiment branch still exists" branch_exists feat/experiment
lab_check "main has fix.txt from cherry-pick" file_exists fix.txt
lab_check "main app.txt lacks experiment edit" file_lacks_line app.txt experiment

lab_finish
