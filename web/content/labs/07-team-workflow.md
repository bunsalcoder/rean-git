# Lab 07 — Team workflow

## Goal

Practice the habits you’ll use on a real team: ignore junk, short branches, sync with `main`, and write a clear PR description.

## Setup

Use the same GitHub repo from Lab 06, or create another empty repo.

```bash
cd labs/07-team-workflow
mkdir -p playground && cd playground
git clone https://github.com/YOU/rean-git-lab06.git .
# or init + remote as in lab 06
git switch main
git pull
```

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

In another terminal (or GitHub UI), add a harmless commit on `main` (edit README). Then update your branch:

```bash
git fetch origin
git rebase origin/main
# if conflict: fix, git add, git rebase --continue
git push --force-with-lease
```

(`--force-with-lease` is for *your* feature branch only — never force-push shared `main`.)

### 4. Open a PR with a real description

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

Merge it, then clean up locally:

```bash
git switch main
git pull
git branch -d chore/team-checklist
```

## Success criteria

- [ ] Secrets/scratch files were ignored
- [ ] Feature branch rebased (or merged) onto latest `main` before review
- [ ] PR description explains *why* and how to test
- [ ] Local branches cleaned up after merge

## Cleanup (optional)

Delete the throwaway GitHub repo when finished.
