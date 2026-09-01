#!/usr/bin/env bash
# Build a completed playground for labs/11-interactive-rebase.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "11-interactive-rebase"
cd "${FIXTURE_PG}"

printf 'start\n' > file.txt
fixture_commit "Start"
printf 'a\n' >> file.txt
fixture_commit "wip"
printf 'b\n' >> file.txt
fixture_commit "typo"
printf 'c\n' >> file.txt
fixture_commit "actually done"

export GIT_SEQUENCE_EDITOR="sed -i -e '2,\$s/^pick/squash/'"
export GIT_EDITOR="sh -c 'printf \"%s\\n\" \"Implement file updates\" > \"\$1\"' --"
fixture_git rebase -i HEAD~3 >/dev/null
unset GIT_SEQUENCE_EDITOR GIT_EDITOR
