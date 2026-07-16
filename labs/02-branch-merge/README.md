# Lab 02 — Branch & merge

## Goal

Create a feature branch, commit on it, and merge it back into `main`.

## Setup

```bash
cd labs/02-branch-merge
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Branch lab" > README.md
git add README.md
git commit -m "Initial commit"
```

## Steps

### 1. Create a branch

```bash
git switch -c feature/greeting
echo "Hello from a branch." >> README.md
git add README.md
git commit -m "Add greeting line"
git log --oneline --graph --all
```

### 2. Switch back and confirm isolation

```bash
git switch main
cat README.md
```

→ `main` should **not** have the greeting yet.

### 3. Merge

```bash
git merge feature/greeting
cat README.md
git log --oneline --graph --all
```

### 4. Delete the feature branch

```bash
git branch -d feature/greeting
git branch
```

## Success criteria

- [ ] You saw different file contents on `main` vs `feature/greeting`
- [ ] Merge brought the greeting into `main`
- [ ] Feature branch is deleted locally

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
