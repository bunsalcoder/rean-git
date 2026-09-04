#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "02-branching"
lab_use_playground "${LAB_ROOT}"

lab_check "on main branch" test "$(git_pg branch --show-current)" = "main"
lab_check "working tree is clean" is_clean_tree
lab_check "feat/contact-page exists" branch_exists feat/contact-page
lab_check "fix/homepage-crash exists" branch_exists fix/homepage-crash
lab_check "main lacks contact draft" file_lacks_line README.md "Contact page draft"
lab_check "main lacks crash fix line" file_lacks_line README.md "Homepage crash fix"
lab_check "contact branch has its commit" log_all_matches "Draft contact page"
lab_check "fix branch has its commit" log_all_matches "Fix homepage crash"

lab_finish
