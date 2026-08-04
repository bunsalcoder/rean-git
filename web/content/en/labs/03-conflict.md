# Lab 03 — Conflict

## Goal

Create a merge conflict on purpose, resolve it, and finish the merge.

## Setup

```bash
cd labs/03-conflict
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
printf "line one\nshared line\nline three\n" > notes.txt
git add notes.txt
git commit -m "Add notes"
```

## Steps

### 1. Change the same line on main

```bash
git switch -c feature/alt
# edit shared line:
printf "line one\nshared line from feature\nline three\n" > notes.txt
git add notes.txt
git commit -m "Change shared line on feature"
```

### 2. Change it differently on main

```bash
git switch main
printf "line one\nshared line from main\nline three\n" > notes.txt
git add notes.txt
git commit -m "Change shared line on main"
```

### 3. Merge and hit the conflict

```bash
git merge feature/alt
cat notes.txt
git status
```

→ Look for `<<<<<<<`, `=======`, `>>>>>>>`.

### 4. Resolve

Edit `notes.txt` to the final version you want, for example:

```text
line one
shared line resolved
line three
```

Remove every conflict marker. Then:

```bash
git add notes.txt
git commit -m "Merge feature/alt; resolve shared line"
git log --oneline --graph --all
```

### Abort practice (optional alternative)

If you want to bail out during a conflict:

```bash
git merge --abort
```

## Success criteria

- [ ] You triggered a conflict (Git refused to auto-merge)
- [ ] Markers are gone and the file reads correctly
- [ ] Merge completed with a clean `git status`

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
