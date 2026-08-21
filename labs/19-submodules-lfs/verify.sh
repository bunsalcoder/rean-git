#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "19-submodules-lfs"
lab_use_playground "${LAB_ROOT}"

lab_check ".gitmodules exists" file_exists .gitmodules
lab_check ".gitmodules points at libs/design" file_contains .gitmodules "libs/design"
lab_check "design submodule is checked out" submodule_dir_present libs/design
lab_check "design tokens file exists" file_exists libs/design/tokens.css
lab_check "submodule bump committed" log_matches "Bump design-lib"
lab_check "working tree is clean" is_clean_tree

if command -v git-lfs >/dev/null 2>&1; then
  lab_check ".gitattributes uses LFS" file_contains .gitattributes "filter=lfs"
  lab_check "hero.bin exists" file_exists hero.bin
else
  lab_warn "git-lfs not installed — submodule checks ran; install git-lfs to practice the LFS step."
fi

lab_finish
