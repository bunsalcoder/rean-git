# Lab 19 — Forks & multiple remotes

## Goal

Practice the fork workflow **locally**: clone your copy (`origin`), add the original as `upstream`, push a feature, then fetch when upstream moves.

No GitHub account is required. Bare repos under `sandbox/` stand in for GitHub.

## Setup

```bash
cd labs/19-forks
mkdir -p sandbox playground

# Original project (the repo you do not write to)
git init sandbox/original-work
cd sandbox/original-work
git config user.name "Upstream Maintainer"
git config user.email "upstream@example.com"
git checkout -b main
echo "# Shared project" > README.md
git add README.md
git commit -m "Initial project"
cd ../..

git clone --bare sandbox/original-work sandbox/original.git
cd sandbox/original-work
git remote add origin ../original.git
git push -u origin main
cd ../..

# Fork = a copy of original
git clone --bare sandbox/original.git sandbox/my-fork.git

# Clone YOUR fork — this is the working copy
git clone sandbox/my-fork.git playground
cd playground
git config user.name "Lab Learner"
git config user.email "lab@example.com"
```

## Steps

### 1. Add upstream and list remotes

```bash
git remote add upstream ../sandbox/original.git
git remote -v
```

→ `origin` points at your fork; `upstream` points at the original.

On GitHub the same names are used after you fork in the UI and `git remote add upstream https://github.com/ORIGINAL/project.git`.

### 2. Feature branch, push to origin

```bash
git switch -c feat/thanks
echo "Thanks from a contributor." >> README.md
git add README.md
git commit -m "Add contributor thanks"
git push -u origin feat/thanks
git remote show origin
```

You would open a pull request from `origin/feat/thanks` into `upstream` (Lab 06 practiced the GitHub PR itself).

### 3. Upstream moves

```bash
cd ../sandbox/original-work
echo "Maintainer note." >> README.md
git add README.md
git commit -m "Maintainer update"
git push origin main
cd ../../playground
```

### 4. Fetch upstream and update local main

```bash
git fetch upstream
git log --oneline --all --decorate --graph
git switch main
git merge upstream/main
git log --oneline -2
```

(`git rebase upstream/main` is the other common choice.) Stay on `feat/thanks` if you still want to rebase the feature later.

## Success criteria

- [ ] `git remote -v` shows both `origin` and `upstream`
- [ ] `feat/thanks` was pushed to origin
- [ ] `git fetch upstream` brought in `Maintainer update`
- [ ] You can explain origin = your fork, upstream = the original

## Cleanup (optional)

```bash
cd ..
rm -rf playground sandbox
```
