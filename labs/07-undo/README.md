# Lab 07 — Undo

## Goal

Practice safe undos: restore, unstage, amend, soft reset, revert, and recover a “lost” commit with reflog.

## Setup

```bash
cd labs/07-undo
mkdir -p playground && cd playground
git init -b main
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

### 6. Lose a commit on purpose — recover with reflog

```bash
echo "keeper" > keep.txt
git add keep.txt
git commit -m "Keep this commit"

# Lab only — dangerous in real life if you still need the tip
git reset --hard HEAD~1
git log --oneline
```

→ `keep.txt` is gone from `main`. The commit is not erased yet.

```bash
git reflog
# Find the line for "Keep this commit" (often HEAD@{1}) and use its hash
git switch -c recover HEAD@{1}
cat keep.txt
git log --oneline
```

→ You are on `recover` with `keep.txt` back. `main` still ends at the revert.

## Success criteria

- [ ] `git restore` discarded a bad edit
- [ ] You unstaged without losing work
- [ ] You amended a local commit message
- [ ] You used `revert` and still have a clean log story
- [ ] You recovered a reset commit on a `recover` branch via `reflog`

From the lab folder (not inside `playground/`), run `./verify.sh` to self-check.

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
