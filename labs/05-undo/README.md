# Lab 05 — Undo

## Goal

Practice safe undos: restore, unstage, amend, soft reset, and revert.

## Setup

```bash
cd labs/05-undo
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "v1" > file.txt
git add file.txt
git commit -m "Add file"
```

## Steps

### 1. Discard an unstaged edit

```bash
echo "oops" >> file.txt
git status
git restore file.txt
cat file.txt
```

→ Back to `v1`.

### 2. Unstage

```bash
echo "v2" >> file.txt
git add file.txt
git restore --staged file.txt
git status
```

→ Change is still in the file, but not staged.

Stage and commit it for real:

```bash
git add file.txt
git commit -m "Bump to v2"
```

### 3. Amend the message (local only)

```bash
git commit --amend -m "Bump file to v2"
git log --oneline
```

### 4. Soft reset the last commit

```bash
git reset --soft HEAD~1
git status
git commit -m "Bump file to v2 (recommitted)"
```

### 5. Revert (safe for shared history)

```bash
git revert HEAD --no-edit
cat file.txt
git log --oneline
```

→ A new commit undoes the previous change; history stays.

## Success criteria

- [ ] `git restore` discarded a bad edit
- [ ] You unstaged without losing work
- [ ] You amended a local commit message
- [ ] You used `revert` and still have a clean log story

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
