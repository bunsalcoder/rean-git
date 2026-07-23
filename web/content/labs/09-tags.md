# Lab 09 — Tags

## Goal

Create annotated tags for releases and inspect them.

## Setup

```bash
cd labs/09-tags
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "app v1" > app.txt
git add app.txt
git commit -m "App v1 content"
```

## Steps

### 1. Annotated release tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git tag -l
git show v1.0.0
```

### 2. Another commit, then a patch tag

```bash
echo "app v1.0.1" > app.txt
git add app.txt
git commit -m "Patch content"
git tag -a v1.0.1 -m "Release v1.0.1"
git log --oneline --decorate
```

### 3. Check out a tag (detached HEAD)

```bash
git switch --detach v1.0.0
cat app.txt
git switch main
```

→ Detached HEAD is normal on a tag; switch back to a branch when done.

## Success criteria

- [ ] You created annotated tags with messages
- [ ] `git show` displays tag metadata
- [ ] You visited a tag and returned to `main`

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
