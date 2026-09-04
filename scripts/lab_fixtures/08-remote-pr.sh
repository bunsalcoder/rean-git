#!/usr/bin/env bash
# Build a completed playground for labs/08-remote-pr (local bare remote stands in for GitHub).
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

LAB_ID="08-remote-pr"
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
printf '# Lab 06\n' > "${PLAYGROUND}/README.md"
git -C "${PLAYGROUND}" add README.md
git -C "${PLAYGROUND}" commit -m "Initial commit" >/dev/null

git clone --bare "${PLAYGROUND}" "${SANDBOX}/origin.git" >/dev/null
git -C "${PLAYGROUND}" remote add origin "${SANDBOX}/origin.git"
git -C "${PLAYGROUND}" push -u origin main >/dev/null

git -C "${PLAYGROUND}" switch -c feat/hello-pr >/dev/null
printf 'Opened from a PR.\n' >> "${PLAYGROUND}/README.md"
git -C "${PLAYGROUND}" add README.md
git -C "${PLAYGROUND}" commit -m "Add PR practice line" >/dev/null
git -C "${PLAYGROUND}" push -u origin feat/hello-pr >/dev/null

# Simulate merging the PR on the remote.
git -C "${SANDBOX}/origin.git" symbolic-ref HEAD refs/heads/main >/dev/null
git clone "${SANDBOX}/origin.git" "${SANDBOX}/merge-work" >/dev/null
git -C "${SANDBOX}/merge-work" config user.name "Lab Learner"
git -C "${SANDBOX}/merge-work" config user.email "lab@example.com"
git -C "${SANDBOX}/merge-work" config commit.gpgsign false
git -C "${SANDBOX}/merge-work" merge --no-ff origin/feat/hello-pr -m "Merge pull request: Practice PR" >/dev/null
git -C "${SANDBOX}/merge-work" push origin main >/dev/null
git -C "${SANDBOX}/origin.git" branch -D feat/hello-pr >/dev/null || true
rm -rf "${SANDBOX}/merge-work"

git -C "${PLAYGROUND}" switch main >/dev/null
git -C "${PLAYGROUND}" pull >/dev/null
git -C "${PLAYGROUND}" branch -d feat/hello-pr >/dev/null
