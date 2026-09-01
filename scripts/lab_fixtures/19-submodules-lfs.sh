#!/usr/bin/env bash
# Build a completed playground for labs/19-submodules-lfs.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

LAB_ID="19-submodules-lfs"
fixture_lab_root "${LAB_ID}"
LAB_DIR="${FIXTURE_LAB_ROOT}"
SANDBOX="${LAB_DIR}/sandbox"

rm -rf "${SANDBOX}" "${LAB_DIR}/playground"
mkdir -p "${SANDBOX}/design-lib"

git init "${SANDBOX}/design-lib" -b main >/dev/null
git -C "${SANDBOX}/design-lib" config user.name "Lab Learner"
git -C "${SANDBOX}/design-lib" config user.email "lab@example.com"
git -C "${SANDBOX}/design-lib" config commit.gpgsign false
printf 'button { color: blue; }\n' > "${SANDBOX}/design-lib/tokens.css"
git -C "${SANDBOX}/design-lib" add tokens.css
git -C "${SANDBOX}/design-lib" commit -m "Add design tokens" >/dev/null

fixture_reset_playground "${LAB_ID}"
cd "${FIXTURE_PG}"

fixture_git config user.name "Lab Learner"
fixture_git config user.email "lab@example.com"

printf '# App\n' > README.md
fixture_commit "Start app"

fixture_git \
  -c protocol.file.allow=always \
  submodule add "${SANDBOX}/design-lib" libs/design >/dev/null
fixture_commit "Add design-lib submodule"

git -C libs/design config user.name "Lab Learner"
git -C libs/design config user.email "lab@example.com"
printf 'button { color: navy; }\n' > libs/design/tokens.css
git -C libs/design add tokens.css
git -C libs/design commit -m "Darken tokens" >/dev/null
fixture_git add libs/design
fixture_commit "Bump design-lib"

if command -v git-lfs >/dev/null 2>&1; then
  git lfs install --local >/dev/null
  git lfs track "*.bin" >/dev/null
  fixture_git add .gitattributes
  printf 'fake-psd-bytes\n' > hero.bin
  fixture_git add hero.bin
  fixture_commit "Track a large asset with LFS"
fi
