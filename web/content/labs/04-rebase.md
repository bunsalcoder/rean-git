# Lab 04 — Rebase

## Goal

Rebase a feature branch onto an updated `main` and see a linear history.

## Setup

```bash
cd labs/04-rebase
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "base" > app.txt
git add app.txt
git commit -m "Base commit"
```

## Steps

### 1. Feature work

```bash
git switch -c feature/tweak
echo "feature change" >> app.txt
git add app.txt
git commit -m "Feature tweak"
```

### 2. New commit on main (meanwhile)

```bash
git switch main
echo "main update" >> app.txt
git add app.txt
git commit -m "Main update"
git log --oneline --graph --all
```

### 3. Rebase the feature

```bash
git switch feature/tweak
git rebase main
```

If Git reports a conflict:

1. Fix `app.txt` (include both changes sensibly)
2. `git add app.txt`
3. `git rebase --continue`

To cancel: `git rebase --abort`.

### 4. Compare history

```bash
git log --oneline --graph --all
```

→ Prefer a straight line with your feature commit *after* `Main update`.

### 5. Fast-forward main (optional)

```bash
git switch main
git merge feature/tweak
git log --oneline --graph --all
```

## Success criteria

- [ ] Rebase completed (with or without a conflict fix)
- [ ] Graph looks linear compared to a merge commit workflow
- [ ] You can say when *not* to rebase (shared published commits)

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
