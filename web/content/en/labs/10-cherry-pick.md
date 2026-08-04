# Lab 10 — Cherry-pick

## Goal

Copy one commit from a feature branch onto `main` without merging the whole branch.

## Setup

```bash
cd labs/10-cherry-pick
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "base" > app.txt
git add app.txt
git commit -m "Base"
```

## Steps

### 1. Feature branch with two commits

```bash
git switch -c feat/experiment
echo "experiment" >> app.txt
git add app.txt
git commit -m "Experiment WIP"

echo "critical fix" > fix.txt
git add fix.txt
git commit -m "Fix: critical patch"
FIX=$(git rev-parse HEAD)
echo "Fix SHA: $FIX"
```

### 2. Cherry-pick only the fix onto main

```bash
git switch main
git cherry-pick "$FIX"
git log --oneline --graph --all
ls
```

→ `main` has `fix.txt`, but not the experiment edit (unless you merge later).

## Success criteria

- [ ] Feature branch still has both commits
- [ ] `main` gained only the fix commit via cherry-pick
- [ ] Graph shows the pick clearly

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
