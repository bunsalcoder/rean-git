#!/usr/bin/env bash
# Shared helpers for labs/*/verify.sh self-check scripts.
set -euo pipefail

LAB_NAME=""
LAB_PG=""
LAB_CHECKS=0
LAB_FAILURES=0

lab_begin() {
  LAB_NAME="$1"
  echo "== Lab verify: ${LAB_NAME} =="
}

lab_use_playground() {
  local lab_root="$1"
  LAB_PG="${lab_root}/playground"
  if [[ ! -d "${LAB_PG}/.git" ]]; then
    lab_die "No git repo at ${LAB_PG}. Finish the lab steps in playground/ first."
  fi
}

lab_die() {
  echo "FAIL: $*" >&2
  exit 1
}

lab_warn() {
  echo "WARN: $*" >&2
}

lab_check() {
  local desc="$1"
  shift
  LAB_CHECKS=$((LAB_CHECKS + 1))
  if "$@"; then
    echo "  ok  ${desc}"
  else
    echo "  FAIL  ${desc}" >&2
    LAB_FAILURES=$((LAB_FAILURES + 1))
  fi
}

lab_must() {
  local desc="$1"
  shift
  LAB_CHECKS=$((LAB_CHECKS + 1))
  if "$@"; then
    echo "  ok  ${desc}"
  else
    lab_die "${desc}"
  fi
}

lab_finish() {
  if (( LAB_FAILURES > 0 )); then
    echo ""
    lab_die "${LAB_FAILURES} check(s) failed for ${LAB_NAME}."
  fi
  echo ""
  echo "All ${LAB_CHECKS} checks passed for ${LAB_NAME}."
}

git_pg() {
  git -C "${LAB_PG}" "$@"
}

is_clean_tree() {
  git_pg diff --quiet && git_pg diff --cached --quiet
}

commit_count() {
  git_pg rev-list --count HEAD 2>/dev/null || echo 0
}

branch_exists() {
  git_pg show-ref --verify --quiet "refs/heads/$1"
}

branch_gone() {
  ! branch_exists "$1"
}

tag_exists() {
  git_pg show-ref --verify --quiet "refs/tags/$1"
}

tag_is_annotated() {
  [[ "$(git_pg cat-file -t "refs/tags/$1" 2>/dev/null || echo "")" == "tag" ]]
}

file_exists() {
  [[ -f "${LAB_PG}/$1" ]]
}

file_contains() {
  grep -q "$2" "${LAB_PG}/$1"
}

file_lacks_conflict_markers() {
  ! grep -q '^<<<<<<<' "${LAB_PG}/$1" 2>/dev/null
}

file_lacks_line() {
  ! grep -q "$2" "${LAB_PG}/$1" 2>/dev/null
}

no_conflict_markers() {
  local hits
  hits="$(git_pg grep -l '^<<<<<<<' -- . 2>/dev/null || true)"
  [[ -z "${hits}" ]]
}

stash_is_empty() {
  [[ -z "$(git_pg stash list)" ]]
}

worktree_count() {
  git_pg worktree list | wc -l | tr -d ' '
}

remote_exists() {
  git_pg remote get-url origin &>/dev/null
}

hook_executable() {
  [[ -x "${LAB_PG}/.git/hooks/pre-commit" ]]
}

log_matches() {
  git_pg log --oneline | grep -q "$1"
}

file_not_tracked() {
  ! git_pg ls-files --error-unmatch "$1" &>/dev/null
}

bisect_inactive() {
  [[ ! -f "${LAB_PG}/.git/BISECT_LOG" ]]
}

branch_ahead_count() {
  local base="$1"
  local topic="$2"
  git_pg rev-list --count "${base}..${topic}" 2>/dev/null || echo 0
}

on_branch_any() {
  local current branch
  current="$(git_pg branch --show-current)"
  for branch in "$@"; do
    [[ "${current}" == "${branch}" ]] && return 0
  done
  return 1
}
