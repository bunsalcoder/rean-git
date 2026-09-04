#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "10-stash"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "hotfix commit exists" log_matches Hotfix
lab_check "draft edits restored to notes.txt" file_contains notes.txt "draft idea"
lab_check "idea.md restored from stash" file_exists idea.md
lab_check "stash list is empty after pop" stash_is_empty

lab_finish
