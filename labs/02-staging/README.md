# Lab 02 — Staging

## Goal

Stage only related changes, write a clear commit message, and tell the working tree apart from the index.

## Setup

```bash
cd labs/02-staging
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
printf '%s\n' '<h1>Welcome</h1>' > index.html
printf '%s\n' 'personal scratch pad' > notes.md
git add index.html notes.md
git commit -m "Add starter homepage and notes"
```

## Steps

### 1. Make three kinds of edits

```bash
printf '%s\n' '<h1>Welcome home</h1>' > index.html
printf '%s\n' 'draft dark mode styles' > dark-mode.css
echo "buy milk" >> notes.md
git status
git diff
```

→ Homepage typo fix (ship it), dark-mode WIP (not ready), and personal notes (unrelated).

### 2. Stage only the homepage fix

```bash
git add index.html
git diff --staged
git status
```

→ Staged changes should show only `index.html`. Leave `dark-mode.css` and `notes.md` unstaged.

### 3. Practice unstage, then stage again

```bash
git restore --staged index.html
git status
git add index.html
```

### 4. Commit with a searchable message

```bash
git commit -m "Fix homepage welcome heading typo"
git log --oneline
git show HEAD
```

Prefer a message future-you can search — not `fix`, `update`, or `asdf`.

### 5. Leave WIP uncommitted (on purpose)

```bash
git status
git diff
```

→ `dark-mode.css` and `notes.md` should still be unstaged. That is the point of staging: ship the typo without dumping everything.

Optional (interactive): `git add -p` lets you pick hunks inside one file. Skip it if your terminal cannot answer prompts; file-level `git add` is enough for this lab.

## Success criteria

- [ ] Latest commit changes only `index.html`
- [ ] Commit message describes the homepage fix (not a vague `fix` / `update`)
- [ ] `dark-mode.css` and `notes.md` edits are still unstaged
- [ ] You used `git diff --staged` before committing

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
