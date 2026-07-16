# Lab 01 — First repo

## Goal

Create a Git repository, make your first commits, and read your history.

## Setup

```bash
cd labs/01-first-repo
# If this folder is inside the rean-git repo already, work in a subfolder:
mkdir -p playground && cd playground
```

Use a **fresh folder** so you don’t confuse this practice history with the handbook repo.

## Steps

### 1. Initialize

```bash
git init
git status
```

→ You should see an empty repo on branch `main` (or `master` if defaults differ).

### 2. Create a file and commit

```bash
echo "# Lab 01 notes" > README.md
git status
git add README.md
git status
git commit -m "Add README"
git log --oneline
```

### 3. Change and commit again

```bash
echo "Practicing my first commits." >> README.md
git diff
git add README.md
git commit -m "Document the practice goal"
git log --oneline
```

### 4. Inspect

```bash
git show HEAD
git status
```

## Success criteria

- [ ] `git status` shows a clean working tree
- [ ] `git log --oneline` shows at least two commits
- [ ] You can explain what `git add` did before each commit

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
