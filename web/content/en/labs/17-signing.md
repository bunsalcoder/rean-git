# Lab 17 — Signing commits

## Goal

Sign a commit with a throwaway SSH key, then verify the signature locally.

## Prerequisites

- Git **2.34+** (`git version`)
- `ssh-keygen` (OpenSSH)

This lab uses **local** Git config so it will not change your global signing setup. On a real machine you would use `--global` and add the same public key as a signing key on GitHub.

## Setup

```bash
cd labs/17-signing
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "# Signed notes" > README.md
git add README.md
git commit -m "Start unsigned"
```

## Steps

### 1. Make a throwaway SSH key

```bash
ssh-keygen -t ed25519 -f ./lab-signing-key -N "" -C "lab@example.com"
```

→ Two files: `lab-signing-key` (private) and `lab-signing-key.pub`. Keep both **untracked**.

### 2. Turn on SSH signing in this repo only

```bash
git config gpg.format ssh
git config user.signingkey "$(pwd)/lab-signing-key.pub"
git config commit.gpgsign true
```

### 3. Tell Git which keys to trust for verify

```bash
{
  printf 'lab@example.com namespaces="git" '
  cat lab-signing-key.pub
} > allowed_signers
git config gpg.ssh.allowedSignersFile "$(pwd)/allowed_signers"
```

The email in `allowed_signers` must match `user.email`.

### 4. Sign a commit and inspect it

```bash
echo "This commit is signed." >> README.md
git add README.md
git commit -m "Add signed note"
git log --show-signature -1
git verify-commit HEAD
```

→ `verify-commit` should exit 0. `git log --show-signature` should report a good signature.

### 5. Compare with the unsigned commit

```bash
git log --show-signature --oneline -2
```

The first commit (`Start unsigned`) has no signature. Rewriting history (amend, rebase) drops or re-signs commits — that is expected.

## Success criteria

- [ ] `gpg.format` is `ssh` and `commit.gpgsign` is on in this repo
- [ ] `git verify-commit HEAD` succeeds
- [ ] You can explain why GitHub still needs the public key added as a signing key

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
