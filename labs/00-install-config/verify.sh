#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "00-install-config"
lab_use_playground "${LAB_ROOT}"

lab_check "git is available" git --version
lab_check "playground is a git repo" test -d "${LAB_PG}/.git"
lab_check "local user.name is set" test -n "$(git_pg config --local --get user.name 2>/dev/null || true)"
lab_check "local user.email is set" test -n "$(git_pg config --local --get user.email 2>/dev/null || true)"
lab_check "at least one commit" test "$(commit_count)" -ge 1
lab_check "working tree is clean" is_clean_tree

lab_finish
