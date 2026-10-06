# Lab 09 — Remote & PR

## Goal

Push a feature branch and merge it like a pull request. A **local bare remote** is enough — no GitHub account required. Use GitHub afterward if you want the real PR UI.

## Setup

```bash
cd labs/09-remote-pr
mkdir -p playground sandbox
cd playground
git init -b main
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Lab 09" > README.md
git add README.md
git commit -m "Initial commit"
```

Create a bare remote (stand-in for GitHub), then connect and push `main`:

```bash
cd ..
git clone --bare playground sandbox/origin.git
cd playground
git remote add origin ../sandbox/origin.git
git remote -v
git push -u origin main
```

## Steps

### 1. Feature branch and push

```bash
git switch -c feat/hello-pr
echo "Opened from a PR." >> README.md
git add README.md
git commit -m "Add PR practice line"
git push -u origin feat/hello-pr
```

### 2. Merge like a pull request (offline)

On GitHub this would be “Compare & pull request” → Merge. Offline, use a second clone to merge into `main` with a merge commit:

```bash
cd ..
git clone sandbox/origin.git sandbox/merge-work
cd sandbox/merge-work
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git merge --no-ff origin/feat/hello-pr -m "Merge pull request: Practice PR"
git push origin main
cd ../sandbox/origin.git
git branch -D feat/hello-pr
cd ../../playground
```

→ Remote `main` now includes the feature. The feature branch tip is gone from the bare remote (same idea as deleting the branch after a GitHub merge).

### 3. Sync local main

```bash
git switch main
git pull
git branch -d feat/hello-pr
git log --oneline --graph --all
cat README.md
```

→ Local `main` matches `origin/main` and includes `Opened from a PR.`

## Alternative: GitHub (optional)

If you already have a GitHub account and want the real PR UI:

1. Create a **new empty** repository named `rean-git-lab09` (no README).
2. Point `origin` at it instead of the bare remote (or start a fresh `playground/`):

```bash
git remote remove origin
git remote add origin https://github.com/YOU/rean-git-lab09.git
git push -u origin main
```

3. Push `feat/hello-pr` as in step 1, then open a PR with `gh pr create` or the GitHub “Compare & pull request” prompt.
4. Merge on GitHub, then run step 3 (`git pull` on `main` and delete the local feature branch).

`./verify.sh` still checks local Git state. Confirm the GitHub PR/merge in the browser (or with `gh pr view`).

## Success criteria

- [ ] `origin` points at a remote (`sandbox/origin.git` or GitHub)
- [ ] Feature branch was pushed, then merged into `main` (offline merge or GitHub PR)
- [ ] Local `main` matches `origin/main` after `git pull`
- [ ] `feat/hello-pr` is deleted locally

From the lab folder (not inside `playground/`), run `./verify.sh` to self-check.

## Cleanup (optional)

```bash
cd ..
rm -rf playground sandbox
```

If you used GitHub, delete the throwaway repo when finished.
