#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "04-rebase"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "app.txt has feature and main changes" file_contains app.txt "feature change"
lab_check "app.txt includes main update" file_contains app.txt "main update"
lab_check "rebase finished (main or feature/tweak)" on_branch_any main feature/tweak

lab_finish
