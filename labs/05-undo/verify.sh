#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "05-undo"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "revert restored file.txt to v1" file_contains file.txt "^v1$"
lab_check "revert commit exists" log_matches Revert

lab_finish
