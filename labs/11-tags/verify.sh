#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "11-tags"
lab_use_playground "${LAB_ROOT}"

lab_check "working tree is clean" is_clean_tree
lab_check "on main branch" test "$(git_pg branch --show-current)" = "main"
lab_check "annotated tag v1.0.0 exists" tag_is_annotated v1.0.0
lab_check "annotated tag v1.0.1 exists" tag_is_annotated v1.0.1
lab_check "patch commit on main" log_matches "Patch content"

lab_finish
