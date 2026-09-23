#!/usr/bin/env bash
# Self-check after completing the lab steps (run from this folder):
#   ./verify.sh
set -euo pipefail

LAB_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../../scripts/lab_verify_lib.sh
source "${LAB_ROOT}/../../scripts/lab_verify_lib.sh"

commit_message_is_clear() {
  local msg
  msg="$(git_pg log -1 --pretty=%s | tr '[:upper:]' '[:lower:]')"
  case "${msg}" in
    fix|update|asdf|wip|temp|test|"") return 1 ;;
    *) return 0 ;;
  esac
}

latest_commit_is_only_index_html() {
  local files
  mapfile -t files < <(git_pg diff-tree --no-commit-id --name-only -r HEAD)
  [[ ${#files[@]} -eq 1 && ${files[0]} == index.html ]]
}

dark_mode_is_wip() {
  [[ -f "${LAB_PG}/dark-mode.css" ]] || return 1
  if git_pg ls-files --error-unmatch dark-mode.css >/dev/null 2>&1; then
    ! git_pg diff --quiet -- dark-mode.css || ! git_pg diff --cached --quiet -- dark-mode.css
  else
    return 0
  fi
}

notes_still_unstaged() {
  ! git_pg diff --quiet -- notes.md
}

lab_begin "02-staging"
lab_use_playground "${LAB_ROOT}"

lab_check "playground is a git repo" test -d "${LAB_PG}/.git"
lab_check "at least two commits" test "$(commit_count)" -ge 2
lab_check "latest commit message is not vague" commit_message_is_clear
lab_check "latest commit touches only index.html" latest_commit_is_only_index_html
lab_check "dark-mode.css is still WIP (unstaged or untracked)" dark_mode_is_wip
lab_check "notes.md still has unstaged edits" notes_still_unstaged

lab_finish
