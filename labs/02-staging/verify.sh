#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

lab_begin "02-staging"
lab_use_playground "${LAB_ROOT}"

lab_check "playground is a git repo" test -d "${LAB_PG}/.git"
lab_check "at least two commits" test "$(commit_count)" -ge 2

head_msg="$(git_pg log -1 --pretty=%s)"
lab_check "latest commit message is not vague" bash -c '
  msg=$(printf "%s" "$1" | tr "[:upper:]" "[:lower:]")
  case "$msg" in
    fix|update|asdf|wip|temp|test|"") exit 1 ;;
    *) exit 0 ;;
  esac
' bash "${head_msg}"

lab_check "latest commit touches only index.html" bash -c '
  mapfile -t files < <(git -C "$1" diff-tree --no-commit-id --name-only -r HEAD)
  [[ ${#files[@]} -eq 1 && ${files[0]} == index.html ]]
' bash "${LAB_PG}"

lab_check "dark-mode.css is still WIP (unstaged or untracked)" bash -c '
  pg="$1"
  [[ -f "$pg/dark-mode.css" ]] || exit 1
  if git -C "$pg" ls-files --error-unmatch dark-mode.css >/dev/null 2>&1; then
    # tracked: must differ in worktree or index vs HEAD for this path... prefer unstaged WIP
    ! git -C "$pg" diff --quiet -- dark-mode.css || ! git -C "$pg" diff --cached --quiet -- dark-mode.css
  else
    # untracked counts as WIP
    exit 0
  fi
' bash "${LAB_PG}"

lab_check "notes.md still has unstaged edits" \
  bash -c '! git -C "$1" diff --quiet -- notes.md' bash "${LAB_PG}"

lab_finish
