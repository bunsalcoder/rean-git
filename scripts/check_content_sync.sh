#!/usr/bin/env bash
# Fail if English handbook/labs drift from the web content copies.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=lib_en_content.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib_en_content.sh"

fail=0

check_pair() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$src" ]]; then
    echo "MISSING source: $src"
    fail=1
    return
  fi
  if [[ ! -f "$dst" ]]; then
    echo "MISSING copy:   $dst"
    fail=1
    return
  fi
  if ! cmp -s "$src" "$dst"; then
    echo "DRIFT: $src  ≠  $dst"
    fail=1
  else
    echo "OK:    $src  →  $dst"
  fi
}

echo "== Handbook =="
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT
rewrite_handbook_links docs/GIT_FROM_ZERO.md > "$tmp"
if [[ ! -f web/content/en/guide.md ]]; then
  echo "MISSING copy:   web/content/en/guide.md"
  fail=1
elif ! cmp -s "$tmp" web/content/en/guide.md; then
  echo "DRIFT: docs/GIT_FROM_ZERO.md (site links)  ≠  web/content/en/guide.md"
  fail=1
else
  echo "OK:    docs/GIT_FROM_ZERO.md  →  web/content/en/guide.md"
fi

echo
echo "== Labs =="
for lab_dir in labs/*/; do
  name="$(basename "$lab_dir")"
  check_pair \
    "labs/${name}/README.md" \
    "web/content/en/labs/${name}.md"
done

echo
if [[ "$fail" -ne 0 ]]; then
  echo "Content sync check failed."
  echo "Fix drift manually, or run:  ./scripts/sync_en_content.sh"
  exit 1
fi

echo "Content sync check passed."
