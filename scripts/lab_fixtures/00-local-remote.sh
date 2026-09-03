#!/usr/bin/env bash
# Build a completed playground for labs/00-local-remote.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

LAB_ID="00-local-remote"
fixture_lab_root "${LAB_ID}"
LAB_DIR="${FIXTURE_LAB_ROOT}"
SANDBOX="${LAB_DIR}/sandbox"
PLAYGROUND="${LAB_DIR}/playground"

rm -rf "${SANDBOX}" "${PLAYGROUND}"
mkdir -p "${SANDBOX}" "${PLAYGROUND}"

git init -b main "${PLAYGROUND}" >/dev/null
git -C "${PLAYGROUND}" config user.name "Lab Learner"
git -C "${PLAYGROUND}" config user.email "lab@example.com"
git -C "${PLAYGROUND}" config commit.gpgsign false
printf '# Local remote lab\n' > "${PLAYGROUND}/README.md"
git -C "${PLAYGROUND}" add README.md
git -C "${PLAYGROUND}" commit -m "Initial commit" >/dev/null

git clone --bare "${PLAYGROUND}" "${SANDBOX}/origin.git" >/dev/null
git -C "${PLAYGROUND}" remote add origin "${SANDBOX}/origin.git"
git -C "${PLAYGROUND}" push -u origin main >/dev/null

git clone "${SANDBOX}/origin.git" "${SANDBOX}/other" >/dev/null
git -C "${SANDBOX}/other" config user.name "Other Learner"
git -C "${SANDBOX}/other" config user.email "other@example.com"
git -C "${SANDBOX}/other" config commit.gpgsign false
printf 'Hello from the other clone.\n' >> "${SANDBOX}/other/README.md"
git -C "${SANDBOX}/other" add README.md
git -C "${SANDBOX}/other" commit -m "Add note from other clone" >/dev/null
git -C "${SANDBOX}/other" push origin main >/dev/null

git -C "${PLAYGROUND}" pull >/dev/null
