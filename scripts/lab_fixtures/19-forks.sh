#!/usr/bin/env bash
# Build a completed playground for labs/19-forks.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

LAB_ID="19-forks"
fixture_lab_root "${LAB_ID}"
LAB_DIR="${FIXTURE_LAB_ROOT}"
SANDBOX="${LAB_DIR}/sandbox"
PLAYGROUND="${LAB_DIR}/playground"

rm -rf "${SANDBOX}" "${PLAYGROUND}"
mkdir -p "${SANDBOX}"

git init -b main "${SANDBOX}/original-work" >/dev/null
git -C "${SANDBOX}/original-work" config user.name "Upstream Maintainer"
git -C "${SANDBOX}/original-work" config user.email "upstream@example.com"
printf '# Shared project\n' > "${SANDBOX}/original-work/README.md"
git -C "${SANDBOX}/original-work" add README.md
git -C "${SANDBOX}/original-work" commit -m "Initial project" >/dev/null

git clone --bare "${SANDBOX}/original-work" "${SANDBOX}/original.git" >/dev/null
git -C "${SANDBOX}/original-work" remote add origin "${SANDBOX}/original.git"
git -C "${SANDBOX}/original-work" push -u origin main >/dev/null

git clone --bare "${SANDBOX}/original.git" "${SANDBOX}/my-fork.git" >/dev/null
git clone "${SANDBOX}/my-fork.git" "${PLAYGROUND}" >/dev/null
git -C "${PLAYGROUND}" config user.name "Lab Learner"
git -C "${PLAYGROUND}" config user.email "lab@example.com"
git -C "${PLAYGROUND}" config commit.gpgsign false

git -C "${PLAYGROUND}" remote add upstream "${SANDBOX}/original.git"
git -C "${PLAYGROUND}" switch -c feat/thanks >/dev/null
printf 'Thanks from a contributor.\n' >> "${PLAYGROUND}/README.md"
git -C "${PLAYGROUND}" add README.md
git -C "${PLAYGROUND}" commit -m "Add contributor thanks" >/dev/null
git -C "${PLAYGROUND}" push -u origin feat/thanks >/dev/null

printf 'Maintainer note.\n' >> "${SANDBOX}/original-work/README.md"
git -C "${SANDBOX}/original-work" add README.md
git -C "${SANDBOX}/original-work" commit -m "Maintainer update" >/dev/null
git -C "${SANDBOX}/original-work" push origin main >/dev/null

git -C "${PLAYGROUND}" fetch upstream >/dev/null
git -C "${PLAYGROUND}" switch main >/dev/null
git -C "${PLAYGROUND}" merge upstream/main >/dev/null
