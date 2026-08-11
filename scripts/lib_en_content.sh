#!/usr/bin/env bash
# Shared helpers for English content sync / drift checks.
# Rewrite repo-relative lab folder links to site lab reader URLs.
rewrite_handbook_links() {
  local src="${1:?handbook source path}"
  sed -E 's|\]\(\.\./labs/([^/]+)/\)|](./lab.html?id=\1)|g' "$src"
}
