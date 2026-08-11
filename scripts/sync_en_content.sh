#!/usr/bin/env bash
# Copy canonical English handbook + lab READMEs into web/content/en/.
# Handbook lab links are rewritten for the site reader:
#   ../labs/<id>/  →  ./lab.html?id=<id>
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck source=lib_en_content.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib_en_content.sh"

mkdir -p web/content/en/labs

rewrite_handbook_links docs/GIT_FROM_ZERO.md > web/content/en/guide.md
echo "Synced handbook → web/content/en/guide.md"

for lab_dir in labs/*/; do
  name="$(basename "$lab_dir")"
  src="labs/${name}/README.md"
  dst="web/content/en/labs/${name}.md"
  if [[ ! -f "$src" ]]; then
    echo "Skip (no README): $name"
    continue
  fi
  cp -f "$src" "$dst"
  echo "Synced $src → $dst"
done

echo
./scripts/check_content_sync.sh
