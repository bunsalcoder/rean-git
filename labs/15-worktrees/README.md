# Lab 15 — Worktrees

## Goal

Practice detached HEAD safely, then use a second worktree so you can work on two branches at once.

## Setup

```bash
cd labs/15-worktrees
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "main app" > app.txt
git add app.txt
git commit -m "Start app on main"
git tag -a v0.1.0 -m "Checkpoint"
git switch -c feat/notes
echo "notes wip" > notes.txt
git add notes.txt
git commit -m "Add notes draft"
git switch main
```

## Steps

### 1. Detached HEAD, then rescue with a branch

```bash
git switch --detach v0.1.0
git status
echo "hotfix line" >> app.txt
git add app.txt
git commit -m "Hotfix while detached"
git switch -c hotfix/from-tag
git log --oneline --decorate -3
git switch main
```

→ Commits made while detached are easy to lose unless you name a branch.

### 2. Add a second worktree for the feature branch

Keep unfinished edits on `main`, then open `feat/notes` in another folder:

```bash
echo "local scratch on main" >> app.txt
git status
git worktree add ../review feat/notes
cd ../review
git status
cat notes.txt
echo "notes ready" > notes.txt
git add notes.txt
git commit -m "Finish notes draft"
cd ../playground
git worktree list
```

### 3. Remove the worktree

```bash
git worktree remove ../review
git worktree list
git branch
git switch feat/notes
git log --oneline -2
git restore app.txt
```

## Success criteria

- [ ] You saw the detached HEAD warning and created a rescue branch
- [ ] `git worktree list` showed two checkouts sharing one repo
- [ ] You removed the extra worktree cleanly

## Cleanup (optional)

```bash
cd ..
rm -rf playground review
```
