# Lab 06 — Remote & PR

## Goal

Push a branch to GitHub and open a pull request.

## Prerequisites

- GitHub account
- Auth working (`gh auth login` **or** HTTPS/SSH already set up)
- Optional but nice: [GitHub CLI](https://cli.github.com/) (`gh`)

## Steps

### 1. Fork or use a throwaway repo

Easiest: create a **new empty** repository on GitHub named `rean-git-lab06` (no README).

### 2. Local project

```bash
cd labs/06-remote-pr
mkdir -p playground && cd playground
git init
git config user.name "Your Name"
git config user.email "you@example.com"
echo "# Lab 06" > README.md
git add README.md
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOU/rean-git-lab06.git
git push -u origin main
```

Replace `YOU` with your GitHub username (or use your SSH remote URL).

### 3. Feature branch and push

```bash
git switch -c feat/hello-pr
echo "Opened from a PR." >> README.md
git add README.md
git commit -m "Add PR practice line"
git push -u origin feat/hello-pr
```

### 4. Open the pull request

**With GitHub CLI:**

```bash
gh pr create --title "Practice PR" --body "Lab 06 for rean-git."
```

**Or in the browser:** open the repo → Prompt to compare & open a PR for `feat/hello-pr` → create it.

### 5. Merge and sync

Merge on GitHub (or `gh pr merge`), then:

```bash
git switch main
git pull
git branch -d feat/hello-pr
```

## Success criteria

- [ ] `main` exists on GitHub
- [ ] Feature branch was pushed
- [ ] A PR was opened (and ideally merged)
- [ ] Local `main` matches remote after `git pull`

## Cleanup (optional)

Delete the throwaway GitHub repo when finished.
