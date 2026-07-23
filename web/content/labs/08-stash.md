# Lab 08 — Stash

## Goal

Shelf unfinished work, switch context, then bring the changes back.

## Setup

```bash
cd labs/08-stash
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "v1" > notes.txt
git add notes.txt
git commit -m "Add notes"
```

## Steps

### 1. Make messy WIP

```bash
echo "draft idea" >> notes.txt
echo "scratch" > idea.md
git status
```

### 2. Stash including untracked files

```bash
git stash push -u -m "wip notes and idea"
git status
git stash list
```

→ Working tree should be clean; stash list shows your entry.

### 3. Do a “hotfix” on a clean tree

```bash
echo "hotfix line" >> notes.txt
git add notes.txt
git commit -m "Hotfix typo"
```

### 4. Restore the stash

```bash
git stash pop
git status
cat notes.txt
```

→ Your draft edits return. Resolve any overlap if Git reports a conflict, then finish or stash again.

## Success criteria

- [ ] You stashed tracked + untracked changes with a message
- [ ] You committed something else on a clean tree
- [ ] `git stash pop` restored your WIP

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
