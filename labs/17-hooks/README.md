# Lab 17 — Hooks

## Goal

Install a local `pre-commit` hook that blocks a bad pattern, watch it fail, then commit successfully.

## Setup

```bash
cd labs/17-hooks
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "hello" > README.md
git add README.md
git commit -m "Start project"
```

## Steps

### 1. Add a simple pre-commit hook

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Block commits that stage the word SECRET
if git diff --cached | grep -q 'SECRET'; then
  echo "pre-commit: remove SECRET before committing"
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

### 2. Prove the hook blocks a bad commit

```bash
echo "token=SECRET-demo" > config.env
git add config.env
git commit -m "Add config" || true
git status
```

→ The commit should fail; `config.env` stays staged.

### 3. Fix the file and commit cleanly

```bash
echo "token=demo" > config.env
git add config.env
git commit -m "Add config without secret"
git log --oneline -2
```

### 4. Remember the limit

Hooks in `.git/hooks/` are **local** — they are not shared when someone clones the repo. Teams usually commit a `scripts/hooks/` folder (or use Husky / pre-commit) and still run CI.

## Success criteria

- [ ] A commit containing `SECRET` was rejected by the hook
- [ ] A clean commit succeeded afterward
- [ ] You can explain why teammates do not get your `.git/hooks/` automatically

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
