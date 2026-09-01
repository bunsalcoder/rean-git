#!/usr/bin/env bash
# Build completed playground fixtures and run labs/*/verify.sh against them.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=lab_fixtures/common.sh
source "${ROOT}/scripts/lab_fixtures/common.sh"

KEEP=0
ONLY=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep)
      KEEP=1
      shift
      ;;
    --only)
      shift
      ONLY+=("${1:?lab id after --only}")
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--keep] [--only <lab-id>]..."
      echo "Build fixture playgrounds and run verify.sh for covered labs."
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 2
      ;;
  esac
done

mapfile -t FIXTURES < <(
  find "${ROOT}/scripts/lab_fixtures" -maxdepth 1 -type f -name '*.sh' ! -name 'common.sh' \
    | sed 's|.*/||; s|\.sh$||' \
    | sort
)

if ((${#ONLY[@]} > 0)); then
  filtered=()
  for lab_id in "${ONLY[@]}"; do
    if [[ ! -f "${ROOT}/scripts/lab_fixtures/${lab_id}.sh" ]]; then
      echo "No fixture builder for ${lab_id}" >&2
      exit 1
    fi
    filtered+=("${lab_id}")
  done
  FIXTURES=("${filtered[@]}")
fi

if ((${#FIXTURES[@]} == 0)); then
  echo "No lab fixtures found under scripts/lab_fixtures/" >&2
  exit 1
fi

fail=0
passed=0

cleanup_all() {
  if (( KEEP == 0 )); then
    for lab_id in "${FIXTURES[@]}"; do
      rm -rf "${ROOT}/labs/${lab_id}/playground"
      rm -rf "${ROOT}/labs/${lab_id}/sandbox"
      rm -rf "${ROOT}/labs/${lab_id}/review"
    done
  fi
}
trap cleanup_all EXIT

echo "== Lab verifier fixtures (${#FIXTURES[@]} labs) =="
echo

for lab_id in "${FIXTURES[@]}"; do
  builder="${ROOT}/scripts/lab_fixtures/${lab_id}.sh"
  verifier="${ROOT}/labs/${lab_id}/verify.sh"

  if [[ ! -x "${builder}" && ! -f "${builder}" ]]; then
    echo "FAIL: missing builder ${builder}"
    fail=1
    continue
  fi
  if [[ ! -f "${verifier}" ]]; then
    echo "FAIL: missing verifier labs/${lab_id}/verify.sh"
    fail=1
    continue
  fi

  echo "-- ${lab_id}"
  if ! bash "${builder}"; then
    echo "FAIL: fixture build failed for ${lab_id}"
    fail=1
    echo
    continue
  fi

  if ! (
    cd "${ROOT}/labs/${lab_id}"
    ./verify.sh
  ); then
    echo "FAIL: verify.sh failed for ${lab_id}"
    fail=1
    echo
    continue
  fi

  passed=$((passed + 1))
  echo
done

echo "== Summary =="
echo "Passed: ${passed}/${#FIXTURES[@]}"
if (( fail != 0 )); then
  echo "Lab verifier fixture run failed."
  exit 1
fi
echo "Lab verifier fixture run passed."
