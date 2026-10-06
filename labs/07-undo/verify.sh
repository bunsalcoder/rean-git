#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

blob_on_ref() {
  git_pg cat-file -e "$1:$2" 2>/dev/null
}

main_file_is_v1() {
  [[ "$(git_pg show main:file.txt 2>/dev/null || true)" == "v1" ]]
}

lab_begin "07-undo"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "recover branch exists" branch_exists recover
lab_check "keep.txt recovered on recover" blob_on_ref recover keep.txt
lab_check "recover has Keep this commit" log_all_matches "Keep this commit"
lab_check "revert commit still in history" log_all_matches Revert
lab_check "main tip still has file.txt as v1" main_file_is_v1

lab_finish
