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
lab_check ".gitignore ignores scratch/" file_contains .gitignore "scratch/"
lab_check "WORKFLOW.md committed" file_exists WORKFLOW.md
lab_check "WORKFLOW.md mentions .env" file_contains WORKFLOW.md ".env"
lab_check ".env is not tracked" file_not_tracked .env
lab_check "scratch/tmp.txt is not tracked" file_not_tracked scratch/tmp.txt
lab_check "working tree is clean" is_clean_tree
lab_check "feature branch cleaned up" branch_gone chore/team-checklist
lab_check "origin/main is reachable" ref_exists "origin/main"
lab_check "local main matches origin/main" test "$(git_pg rev-parse HEAD)" = "$(git_pg rev-parse origin/main)"
lab_check "team checklist commit present" log_matches "Add lightweight team checklist"

origin_url="$(git_pg remote get-url origin 2>/dev/null || true)"
if [[ "${origin_url}" == *github.com* ]]; then
  lab_warn "Rebase onto latest main and PR quality are manual — confirm on GitHub if unsure."
fi

lab_finish
