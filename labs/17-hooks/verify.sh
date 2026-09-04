#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "17-hooks"
lab_use_playground "${LAB_ROOT}"

lab_check "pre-commit hook installed" hook_executable
lab_check "working tree is clean" is_clean_tree
lab_check "config.env committed without SECRET" file_exists config.env
lab_check "config.env uses safe token" file_contains config.env "token=demo"
lab_check "clean commit succeeded after hook block" log_matches "Add config without secret"

lab_finish
