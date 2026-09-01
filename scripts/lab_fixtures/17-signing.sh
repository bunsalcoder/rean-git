#!/usr/bin/env bash
# Build a completed playground for labs/17-signing.
set -euo pipefail
# shellcheck source=common.sh
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

fixture_reset_playground "17-signing"
cd "${FIXTURE_PG}"

fixture_git config user.name "Lab Learner"
fixture_git config user.email "lab@example.com"

printf '# Signed notes\n' > README.md
fixture_commit "Start unsigned"

ssh-keygen -t ed25519 -f ./lab-signing-key -N "" -C "lab@example.com" >/dev/null
fixture_git config gpg.format ssh
fixture_git config user.signingkey "$(pwd)/lab-signing-key.pub"
fixture_git config commit.gpgsign true
{
  printf 'lab@example.com namespaces="git" '
  cat lab-signing-key.pub
} > allowed_signers
fixture_git config gpg.ssh.allowedSignersFile "$(pwd)/allowed_signers"

printf 'This commit is signed.\n' >> README.md
fixture_commit "Add signed note"
