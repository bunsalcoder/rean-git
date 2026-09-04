#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "14-bisect"
lab_use_playground "${LAB_ROOT}"

lab_check "bisect session reset" bisect_inactive
lab_check "working tree is clean" is_clean_tree
lab_check "bad commit still in history" log_matches "Bad: break state"

lab_finish
