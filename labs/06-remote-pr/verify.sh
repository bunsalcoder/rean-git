#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "06-remote-pr"
lab_use_playground "${LAB_ROOT}"

lab_check "origin remote configured" remote_exists
lab_check "on main branch" test "$(git_pg branch --show-current)" = "main"
lab_check "working tree is clean" is_clean_tree
lab_check "PR practice line on main" file_contains README.md "Opened from a PR"
lab_check "feat/hello-pr branch deleted locally" branch_gone feat/hello-pr
lab_check "origin/main is reachable" ref_exists "origin/main"
lab_check "local main matches origin/main" test "$(git_pg rev-parse HEAD)" = "$(git_pg rev-parse origin/main)"

origin_url="$(git_pg remote get-url origin 2>/dev/null || true)"
if [[ "${origin_url}" == *github.com* ]]; then
  lab_warn "Remote PR merge on GitHub cannot be verified offline — confirm the PR was merged in the browser."
fi

lab_finish
