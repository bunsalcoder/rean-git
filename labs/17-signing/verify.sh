#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "17-signing"
lab_use_playground "${LAB_ROOT}"

lab_check "gpg.format is ssh" config_equals gpg.format ssh
lab_check "commit.gpgsign is enabled" config_equals commit.gpgsign true
lab_check "allowedSignersFile is set" test -n "$(git_pg config --get gpg.ssh.allowedSignersFile)"
lab_check "working tree is clean" is_clean_tree
lab_check "signed note committed" log_matches "Add signed note"
lab_check "HEAD commit verifies" commit_is_signed HEAD

lab_finish
