#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "07-team-workflow"
lab_use_playground "${LAB_ROOT}"

lab_check "origin remote configured" remote_exists
lab_check ".gitignore exists" file_exists .gitignore
lab_check ".gitignore ignores .env" file_contains .gitignore ".env"
lab_check "WORKFLOW.md committed" file_exists WORKFLOW.md
lab_check ".env is not tracked" file_not_tracked .env
lab_check "working tree is clean" is_clean_tree
lab_check "feature branch cleaned up" branch_gone chore/team-checklist

if remote_exists; then
  lab_warn "Rebase onto latest main and PR quality are manual — confirm on GitHub if unsure."
fi

lab_finish
