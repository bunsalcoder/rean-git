# Lab 11 — Interactive rebase

## Goal

Squash messy local commits into one clear commit before “review.”

## Setup

```bash
cd labs/11-interactive-rebase
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "start" > file.txt
git add file.txt
git commit -m "Start"
```

## Steps

### 1. Make three noisy commits

```bash
echo "a" >> file.txt && git add file.txt && git commit -m "wip"
echo "b" >> file.txt && git add file.txt && git commit -m "typo"
echo "c" >> file.txt && git add file.txt && git commit -m "actually done"
git log --oneline
```

### 2. Squash with a scripted interactive rebase

This avoids fighting vim during the lab. It turns every commit after the first into `squash`, then sets a clean message:

```bash
export GIT_SEQUENCE_EDITOR="sed -i -e '2,\$s/^pick/squash/'"
export GIT_EDITOR="sh -c 'printf \"%s\\n\" \"Implement file updates\" > \"\$1\"' --"
git rebase -i HEAD~3
unset GIT_SEQUENCE_EDITOR GIT_EDITOR
git log --oneline
```

On macOS, if `sed -i` complains, use:

```bash
export GIT_SEQUENCE_EDITOR="sed -i '' -e '2,\$s/^pick/squash/'"
export GIT_EDITOR="sh -c 'printf \"%s\\n\" \"Implement file updates\" > \"\$1\"' --"
git rebase -i HEAD~3
unset GIT_SEQUENCE_EDITOR GIT_EDITOR
```

→ You should see `Start` plus one clean commit instead of three noisy ones.

### 3. Know what you just did

| Todo | Meaning |
|------|---------|
| `pick` | Keep the commit |
| `squash` | Fold into the previous commit |

Only rewrite **local** commits nobody else has built on.

## Success criteria

- [ ] Three WIP commits became one clean commit (plus `Start`)
- [ ] You understand `pick` vs `squash`
- [ ] You only rewrote *local* history

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
