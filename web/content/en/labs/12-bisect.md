# Lab 12 — Bisect

## Goal

Binary-search history to find the commit that introduced a bug.

## Setup

```bash
cd labs/12-bisect
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"

# Good commits
for i in 1 2 3; do
  echo "ok $i" > state.txt
  git add state.txt
  git commit -m "Good $i"
done

# Bad commit (bug introduced)
echo "BROKEN" > state.txt
git add state.txt
git commit -m "Bad: break state"

# More commits after the bug
for i in 4 5 6; do
  echo "still broken $i" >> other.txt
  git add other.txt
  git commit -m "After $i"
done

git log --oneline
```

## Steps

### 1. Start bisect

```bash
git bisect start
git bisect bad HEAD
git bisect good HEAD~6
```

### 2. Mark each midpoint

Check `state.txt`. If it contains `BROKEN`, the commit is bad:

```bash
if grep -q BROKEN state.txt; then git bisect bad; else git bisect good; fi
```

Repeat the same `if grep…` line until Git prints the first bad commit.

### 3. Reset

```bash
git bisect reset
git log --oneline
```

## Success criteria

- [ ] Bisect identified the commit that introduced `BROKEN`
- [ ] You returned to your branch with `git bisect reset`

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
