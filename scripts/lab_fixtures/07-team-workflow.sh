#!/usr/bin/env bash
# Build a completed playground for labs/07-team-workflow (local bare remote stands in for GitHub).
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

LAB_ID="07-team-workflow"
fixture_lab_root "${LAB_ID}"
LAB_DIR="${FIXTURE_LAB_ROOT}"
SANDBOX="${LAB_DIR}/sandbox"
PLAYGROUND="${LAB_DIR}/playground"

rm -rf "${SANDBOX}" "${PLAYGROUND}"
mkdir -p "${SANDBOX}"

# Shared bare origin with an initial main commit.
git init -b main "${SANDBOX}/seed" >/dev/null
git -C "${SANDBOX}/seed" config user.name "Lab Learner"
git -C "${SANDBOX}/seed" config user.email "lab@example.com"
git -C "${SANDBOX}/seed" config commit.gpgsign false
printf '# Lab 07\n' > "${SANDBOX}/seed/README.md"
git -C "${SANDBOX}/seed" add README.md
git -C "${SANDBOX}/seed" commit -m "Initial commit" >/dev/null
git clone --bare "${SANDBOX}/seed" "${SANDBOX}/origin.git" >/dev/null
rm -rf "${SANDBOX}/seed"

git clone "${SANDBOX}/origin.git" "${PLAYGROUND}" >/dev/null
git -C "${PLAYGROUND}" config user.name "Lab Learner"
git -C "${PLAYGROUND}" config user.email "lab@example.com"
git -C "${PLAYGROUND}" config commit.gpgsign false

printf '.DS_Store\n.env\n*.log\nscratch/\n' > "${PLAYGROUND}/.gitignore"
mkdir -p "${PLAYGROUND}/scratch"
printf 'secret-demo\n' > "${PLAYGROUND}/.env"
printf 'temp\n' > "${PLAYGROUND}/scratch/tmp.txt"
git -C "${PLAYGROUND}" add .gitignore
git -C "${PLAYGROUND}" commit -m "Add gitignore for local secrets and scratch" >/dev/null
git -C "${PLAYGROUND}" push >/dev/null

git -C "${PLAYGROUND}" switch -c chore/team-checklist >/dev/null
cat > "${PLAYGROUND}/WORKFLOW.md" << 'EOF'
# Team checklist

- Branch from latest main
- Keep PRs small
- Never commit .env
EOF
git -C "${PLAYGROUND}" add WORKFLOW.md
git -C "${PLAYGROUND}" commit -m "Add lightweight team checklist" >/dev/null
git -C "${PLAYGROUND}" push -u origin chore/team-checklist >/dev/null

# Simulate main moving while the feature branch is open.
git clone "${SANDBOX}/origin.git" "${SANDBOX}/main-work" >/dev/null
git -C "${SANDBOX}/main-work" config user.name "Teammate"
git -C "${SANDBOX}/main-work" config user.email "teammate@example.com"
git -C "${SANDBOX}/main-work" config commit.gpgsign false
git -C "${SANDBOX}/main-work" switch main >/dev/null
printf 'Main moved while you worked.\n' >> "${SANDBOX}/main-work/README.md"
git -C "${SANDBOX}/main-work" add README.md
git -C "${SANDBOX}/main-work" commit -m "Document main movement" >/dev/null
git -C "${SANDBOX}/main-work" push origin main >/dev/null
rm -rf "${SANDBOX}/main-work"

git -C "${PLAYGROUND}" fetch origin >/dev/null
git -C "${PLAYGROUND}" rebase origin/main >/dev/null
git -C "${PLAYGROUND}" push --force-with-lease >/dev/null

# Simulate merging the PR on the remote.
git clone "${SANDBOX}/origin.git" "${SANDBOX}/merge-work" >/dev/null
git -C "${SANDBOX}/merge-work" config user.name "Lab Learner"
git -C "${SANDBOX}/merge-work" config user.email "lab@example.com"
git -C "${SANDBOX}/merge-work" config commit.gpgsign false
git -C "${SANDBOX}/merge-work" switch main >/dev/null
git -C "${SANDBOX}/merge-work" merge --no-ff origin/chore/team-checklist -m "Merge pull request: Add team checklist" >/dev/null
git -C "${SANDBOX}/merge-work" push origin main >/dev/null
git -C "${SANDBOX}/origin.git" branch -D chore/team-checklist >/dev/null || true
rm -rf "${SANDBOX}/merge-work"

git -C "${PLAYGROUND}" switch main >/dev/null
git -C "${PLAYGROUND}" pull >/dev/null
git -C "${PLAYGROUND}" branch -d chore/team-checklist >/dev/null

# Leave ignored junk in the tree so verify can confirm it stays untracked.
mkdir -p "${PLAYGROUND}/scratch"
printf 'secret-demo\n' > "${PLAYGROUND}/.env"
printf 'temp\n' > "${PLAYGROUND}/scratch/tmp.txt"
