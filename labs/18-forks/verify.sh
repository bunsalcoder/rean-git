#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "18-forks"
lab_use_playground "${LAB_ROOT}"

lab_check "origin remote configured" remote_named origin
lab_check "upstream remote configured" remote_named upstream
lab_check "feat/thanks branch exists" branch_exists feat/thanks
lab_check "contributor thanks committed" log_all_matches "Add contributor thanks"
lab_check "upstream/main is fetched" ref_exists upstream/main
lab_check "maintainer update is visible" log_all_matches "Maintainer update"

lab_finish
