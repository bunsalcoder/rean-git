# Install & config

## Goal

Confirm Git works on your machine and set identity for this practice repo (local config only — your global settings stay untouched).

## Setup

```bash
cd labs/00-install-config
mkdir -p playground && cd playground
```

## Steps

### 1. Check that Git is installed

```bash
git --version
```

→ You should see a version number. If the command fails, install Git first (see handbook chapter 3).

### 2. Initialize a practice repo

```bash
git init -b main
git status
```

### 3. Set identity for this repo only

Use **local** config (no `--global`) so you do not change the rest of your machine:

```bash
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git config init.defaultBranch main
git config --local --list
```

→ You should see `user.name`, `user.email`, and `init.defaultBranch` for this repo.

### 4. Prove commits work

```bash
echo "# Install lab" > README.md
git add README.md
git commit -m "First configured commit"
git log --oneline
git status
```

## Success criteria

- [ ] `git --version` prints a version
- [ ] This playground has local `user.name` and `user.email`
- [ ] `git log --oneline` shows one commit and the tree is clean

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
