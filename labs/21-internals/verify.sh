#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "21-internals"
lab_use_playground "${LAB_ROOT}"

lab_check "hello.txt tracked" file_exists hello.txt
lab_check "HEAD is a commit object" test "$(git_pg cat-file -t HEAD)" = "commit"
lab_check "main ref exists" branch_exists main
lab_check "tree object reachable from HEAD" ref_exists "HEAD^{tree}"
lab_check "blob readable via git cat-file" git_pg cat-file -e HEAD:hello.txt

lab_finish
