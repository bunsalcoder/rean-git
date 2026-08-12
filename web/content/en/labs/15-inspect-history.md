# Lab 15 — Inspect history

## Goal

Use `blame`, pickaxe search, and branch ranges to answer “who changed this?” and “what landed on the feature?”

## Setup

```bash
cd labs/15-inspect-history
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main

mkdir -p auth
printf 'def login():\n    return "ok"\n' > auth/login.py
git add auth/login.py
git commit -m "Add login helper"

printf 'def login():\n    return "redirect"\n' > auth/login.py
git add auth/login.py
git commit -m "Change login to redirect"

git switch -c feat/banner
echo "banner" > banner.txt
git add banner.txt
git commit -m "Add homepage banner"
echo "banner v2" > banner.txt
git add banner.txt
git commit -m "Tweak banner copy"
git switch main
```

## Steps

### 1. Blame a file (and a line range)

```bash
git blame auth/login.py
git blame -L 1,2 auth/login.py
```

→ Each line shows the commit and author that last touched it.

### 2. Pickaxe and path filters

```bash
git log -S "redirect" -p --oneline
git log -- auth/login.py
git show HEAD:auth/login.py
```

### 3. Compare branch ranges

```bash
git log --oneline main..feat/banner
git diff --stat main...feat/banner
git shortlog -sn --all
```

→ `main..feat/banner` is commits on the feature that `main` does not have.

## Success criteria

- [ ] `git blame` shows which commit owns the redirect line
- [ ] `git log -S "redirect"` finds the change commit
- [ ] You listed only the feature commits with `main..feat/banner`

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
