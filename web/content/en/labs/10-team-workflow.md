# Lab 10 — Team workflow

## Goal

Practice habits you’ll use on a real team: ignore junk, short branches, sync with `main`, and land work through a PR-style merge. A **local bare remote** is enough — GitHub is optional.

## Setup

Fresh offline playground (works even if you skipped Lab 09’s GitHub path):

```bash
cd labs/10-team-workflow
mkdir -p playground sandbox
cd sandbox
git init -b main seed
cd seed
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Lab 10" > README.md
git add README.md
git commit -m "Initial commit"
cd ..
git clone --bare seed origin.git
rm -rf seed
cd ..
git clone sandbox/origin.git playground
cd playground
git config user.name "Lab Learner"
git config user.email "lab@example.com"
```

Already finished Lab 09 offline? You can instead clone that bare remote (or your GitHub throwaway) into this lab’s `playground/` and `git pull` on `main`.

## Steps

### 1. Add a `.gitignore`

```bash
printf ".DS_Store\n.env\n*.log\nscratch/\n" > .gitignore
mkdir -p scratch
echo "secret-demo" > .env
echo "temp" > scratch/tmp.txt
git status
```

→ `.env` and `scratch/` should **not** appear as files to commit (they’re ignored). Stage only `.gitignore`:

```bash
git add .gitignore
git commit -m "Add gitignore for local secrets and scratch"
git push
```

### 2. Short-lived feature branch

```bash
git switch -c chore/team-checklist
cat > WORKFLOW.md << 'EOF'
# Team checklist

- Branch from latest main
- Keep PRs small
- Never commit .env
EOF
git add WORKFLOW.md
git commit -m "Add lightweight team checklist"
git push -u origin chore/team-checklist
```

### 3. Simulate “main moved”

While your feature is open, someone else lands on `main`. Offline, do that in a second clone:

```bash
cd ..
git clone sandbox/origin.git sandbox/main-work
cd sandbox/main-work
git config user.name "Teammate"
git config user.email "teammate@example.com"
echo "Main moved while you worked." >> README.md
git add README.md
git commit -m "Document main movement"
git push origin main
cd ../../playground
```

Update your branch:

```bash
git fetch origin
git rebase origin/main
# if conflict: fix, git add, git rebase --continue
git push --force-with-lease
```

(`--force-with-lease` is for *your* feature branch only — never force-push shared `main`.)

### 4. Merge like a pull request (offline)

```bash
cd ..
git clone sandbox/origin.git sandbox/merge-work
cd sandbox/merge-work
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git switch main
git merge --no-ff origin/chore/team-checklist -m "Merge pull request: Add team checklist"
git push origin main
cd ../sandbox/origin.git
git branch -D chore/team-checklist
cd ../../playground
```

### 5. Sync and clean up

```bash
git switch main
git pull
git branch -d chore/team-checklist
```

Leave ignored junk in the tree so `./verify.sh` can confirm it stays untracked:

```bash
mkdir -p scratch
echo "secret-demo" > .env
echo "temp" > scratch/tmp.txt
```

## Alternative: GitHub (optional)

Use the same throwaway repo from Lab 09 (or another empty repo). Clone it into `playground/`, follow steps 1–3 with GitHub as `origin`, open a real PR with a full description (`gh pr create` or the browser), merge it, then finish step 5.

Example PR body:

```bash
gh pr create --title "Add team checklist" --body "$(cat <<'EOF'
## Summary
- Add WORKFLOW.md with a short team checklist
- Keep secrets out via .gitignore

## Test plan
- [ ] Clone fresh and confirm .env is not tracked
- [ ] Read WORKFLOW.md renders on GitHub

EOF
)"
```

## Success criteria

- [ ] Secrets/scratch files were ignored
- [ ] Feature branch rebased onto latest `main` before merge
- [ ] Work landed on `main` through a PR-style merge (offline or GitHub)
- [ ] Local feature branch cleaned up; `main` matches `origin/main`

From the lab folder (not inside `playground/`), run `./verify.sh` to self-check.

## Cleanup (optional)

```bash
cd ..
rm -rf playground sandbox
```

If you used GitHub, delete the throwaway repo when finished.
