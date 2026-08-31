#!/usr/bin/env bash
# Build a completed playground for labs/16-hooks.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "16-hooks"
cd "${FIXTURE_PG}"

printf 'hello\n' > README.md
fixture_commit "Start project"

cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Block commits that stage the word SECRET
if git diff --cached | grep -q 'SECRET'; then
  echo "pre-commit: remove SECRET before committing"
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit

printf 'token=demo\n' > config.env
fixture_commit "Add config without secret"
