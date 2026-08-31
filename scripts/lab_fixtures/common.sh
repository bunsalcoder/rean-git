#!/usr/bin/env bash
# Shared helpers for building completed lab playground fixtures.
set -euo pipefail

FIXTURE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FIXTURE_LAB_ROOT=""
FIXTURE_PG=""

fixture_lab_root() {
  local lab_id="${1:?lab id}"
  FIXTURE_LAB_ROOT="${FIXTURE_ROOT}/labs/${lab_id}"
  if [[ ! -d "${FIXTURE_LAB_ROOT}" ]]; then
    echo "Missing lab folder: ${FIXTURE_LAB_ROOT}" >&2
    exit 1
  fi
}

fixture_reset_playground() {
  local lab_id="${1:?lab id}"
  fixture_lab_root "${lab_id}"
  FIXTURE_PG="${FIXTURE_LAB_ROOT}/playground"
  rm -rf "${FIXTURE_PG}"
  mkdir -p "${FIXTURE_PG}"
  git -C "${FIXTURE_PG}" init -b main >/dev/null
  git -C "${FIXTURE_PG}" config user.name "Lab Fixture"
  git -C "${FIXTURE_PG}" config user.email "fixture@rean-git.test"
  git -C "${FIXTURE_PG}" config commit.gpgsign false
}

fixture_git() {
  git -C "${FIXTURE_PG}" "$@"
}

fixture_switch() {
  fixture_git switch "$@" >/dev/null 2>&1
}

fixture_commit() {
  local message="${1:?commit message}"
  fixture_git add -A
  fixture_git commit -m "${message}" >/dev/null
}

fixture_cleanup_playground() {
  if [[ -n "${FIXTURE_LAB_ROOT}" ]]; then
    rm -rf "${FIXTURE_LAB_ROOT}/playground"
  fi
}
