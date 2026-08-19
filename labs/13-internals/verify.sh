#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "13-internals"
lab_use_playground "${LAB_ROOT}"

lab_check "hello.txt tracked" file_exists hello.txt
lab_check "HEAD is a commit object" test "$(git_pg cat-file -t HEAD)" = "commit"
lab_check "main ref exists" test -f "${LAB_PG}/.git/refs/heads/main"
lab_check "tree object reachable from HEAD" git_pg rev-parse --verify HEAD^{tree} >/dev/null
lab_check "blob readable via git cat-file" git_pg cat-file -p HEAD:hello.txt >/dev/null

lab_finish
