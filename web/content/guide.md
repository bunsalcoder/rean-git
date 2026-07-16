# Git From First Commit to Team Workflow

> **Project:** `rean-git`  
> **Audience:** Beginners and juniors who use Git but don’t fully get it yet  
> **Style:** Step-by-step, with commands you can run, explanations of *why*, and labs in this repo

---

## How to use this guide

1. Read each chapter in order (they build on each other).
2. Type the commands yourself — do not only read them.
3. After core chapters, complete the matching lab under `labs/`.
4. Keep a terminal open in this project root (wherever you cloned the repo):

```bash
cd path/to/rean-git
```

**Conventions used here**

| Symbol | Meaning |
|--------|---------|
| `$` | Run in your host terminal |
| `#` | Comment / explanation |
| `→` | Expected idea / outcome |

**Before you start**

- Git installed (`git --version`)
- A text editor you’re comfortable with
- A free [GitHub](https://github.com) account (needed from remotes onward)

---

## Table of contents

1. [What problem does Git solve?](#1-what-problem-does-git-solve)
2. [Core mental model](#2-core-mental-model)
3. [Install & first config](#3-install--first-config)
4. [Your first repository](#4-your-first-repository)
5. [Staging, commits, and history](#5-staging-commits-and-history)
6. [Branching](#6-branching)
7. [Merging](#7-merging)
8. [Conflicts](#8-conflicts)
9. [Rebase (carefully)](#9-rebase-carefully)
10. [Undoing mistakes](#10-undoing-mistakes)
11. [Remotes & GitHub](#11-remotes--github)
12. [Pull requests](#12-pull-requests)
13. [Team workflows](#13-team-workflows)
14. [Cheat sheet](#14-cheat-sheet)
15. [Learning path checklist](#15-learning-path-checklist)

---

## 1. What problem does Git solve?

### The classic pain

You edit code. Then:

- You want yesterday’s version back
- Two people change the same file
- “Which zip is the final final?”
- A deploy broke — what changed since last week?

Folders, emails, and `project-v2-FINAL.zip` don’t scale.

### Git’s answer

**Git is a version control system.** It records snapshots of your project over time so you can:

- Travel through history
- Work on parallel ideas (branches)
- Combine work from multiple people
- Recover from mistakes

### What Git is (and is not)

**Git is:**

- A tool that tracks changes in a folder (a *repository*)
- Local-first — your laptop has the full history
- The foundation of GitHub, GitLab, Bitbucket, etc.

**Git is not:**

- The same thing as GitHub (GitHub *hosts* Git repos + PRs + CI)
- Automatic backup to the cloud (you push for that)
- A substitute for good commit messages and reviews

### Lab link

After chapters 3–5 → [Lab 01 — First repo](./lab.html?id=01-first-repo)

---

## 2. Core mental model

Memorize these words:

### Working tree

The files you see and edit — your normal project folder.

### Staging area (index)

A holding zone for “what will go into the *next* commit.”  
You choose pieces with `git add`.

### Commit

A saved snapshot of the staged files, plus metadata (author, message, parent commit).  
Commits form a chain — that’s your history.

### Repository (repo)

The project folder **plus** the hidden `.git/` directory that stores all history and metadata.

### Branch

A movable label pointing at a commit. `main` is usually your default branch. Creating a branch means “start a new line of work from here.”

### Remote

A copy of the repo somewhere else (often GitHub) named `origin` by default.

```
edit files  →  git add  →  staging  →  git commit  →  history
                                              ↓
                                        git push → remote
```

### Three places your file can live

| Place | Command that moves it there |
|-------|-----------------------------|
| Working tree only (modified) | you edited the file |
| Staging area | `git add` |
| A commit | `git commit` |

Understanding this triangle solves half of “Git confusion.”

---

## 3. Install & first config

### Install

- **macOS:** `xcode-select --install` (includes Git) or [git-scm.com](https://git-scm.com)
- **Windows:** [Git for Windows](https://git-scm.com/download/win)
- **Linux:** `sudo apt install git` / `sudo dnf install git`

Verify:

```bash
git --version
```

### Identity (required before commits)

Git stamps every commit with your name and email:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use the **same email** as your GitHub account if you want commits linked to your profile.

### Helpful defaults

```bash
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.editor "code --wait"   # or nano / vim
```

Check everything:

```bash
git config --list --show-origin
```

---

## 4. Your first repository

Two ways to start:

### A) Create locally

```bash
mkdir my-notes && cd my-notes
git init
```

→ Creates `.git/`. You now have a repo.

### B) Clone an existing remote

```bash
git clone https://github.com/bunsalcoder/rean-git.git
cd rean-git
```

→ Downloads the project **and** its history.

### Status is your friend

```bash
git status
```

Read it every time you’re unsure. It tells you:

- Which branch you’re on
- What’s modified / staged / untracked
- What to do next

### First commit ritual

```bash
echo "# My notes" > README.md
git status
git add README.md
git status
git commit -m "Add README"
git log --oneline
```

### Lab

Complete **[Lab 01 — First repo](./lab.html?id=01-first-repo)** before continuing.

---

## 5. Staging, commits, and history

### Why staging exists

You can commit *some* changes and leave others for later. That’s intentional.

```bash
git add path/to/file.txt     # one file
git add .                    # everything in this folder (careful)
git add -p                   # stage hunks interactively
```

Unstage (keep your edits):

```bash
git restore --staged FILE
```

### Good commit messages

Prefer:

```text
Fix login redirect after password reset
```

Over:

```text
fix
update
asdf
```

A useful pattern:

- **Subject:** what changed (imperative mood, ~50 characters)
- Optional body: why / context

```bash
git commit -m "Explain the change in one line"
```

### Reading history

```bash
git log
git log --oneline
git log --oneline --graph --all
git show HEAD
```

`HEAD` means “the commit I’m currently on.”

### Diffs

```bash
git diff              # unstaged changes
git diff --staged     # staged vs last commit
```

---

## 6. Branching

Branches let you try ideas without breaking `main`.

### Create and switch

```bash
git branch feature/hello        # create
git switch feature/hello        # move HEAD there
# or in one step:
git switch -c feature/hello
```

Older synonym: `git checkout -b feature/hello`.

### See branches

```bash
git branch          # local
git branch -a       # local + remote-tracking
```

### Mental picture

```
main:    A---B---C
                  \
feature:           D---E
```

Each letter is a commit. Branches are just pointers.

### Rules of thumb

- Keep `main` deployable / reviewable
- Name branches for the work: `fix/login-crash`, `feat/signup-form`
- Don’t leave experimental work half-merged

### Lab

**[Lab 02 — Branch & merge](./lab.html?id=02-branch-merge)**

---

## 7. Merging

Merging combines one branch’s history into another.

```bash
git switch main
git merge feature/hello
```

### Fast-forward

If `main` has no new commits since you branched, Git simply moves the `main` pointer forward. History stays a straight line.

### Three-way merge

If both branches moved, Git creates a **merge commit** with two parents.

```bash
git log --oneline --graph --all
```

### Delete a finished branch

```bash
git branch -d feature/hello
```

Use `-D` only when you intend to discard it.

---

## 8. Conflicts

A conflict means Git can’t automatically combine two edits to the same lines.

### How to cause one (then fix it)

Both branches edit the same part of a file, then you merge.

Git marks the file:

```text
<<<<<<< HEAD
your version
=======
their version
>>>>>>> feature/other
```

### Resolve calmly

1. Open the file
2. Keep the correct final content (remove markers)
3. Stage and finish:

```bash
git add FILE
git commit          # completes the merge (message pre-filled)
```

Or abort:

```bash
git merge --abort
```

### Tips

- Pull / merge often so conflicts stay small
- Talk to teammates when the same hotspot is busy
- `git status` tells you which files are still unmerged

### Lab

**[Lab 03 — Conflict](./lab.html?id=03-conflict)**

---

## 9. Rebase (carefully)

**Rebase** replays your commits on top of another branch — rewriting history to look linear.

```bash
git switch feature/hello
git fetch origin
git rebase main
```

### Merge vs rebase

| | Merge | Rebase |
|--|-------|--------|
| History | Keeps true branch junctions | Linear, as if you started later |
| Safety on shared branches | Safer | Dangerous if others already pulled your commits |
| Typical use | Integrate feature → main | Update your feature onto latest main |

### Golden rule

**Do not rebase commits that other people already based work on** (especially `main` on a shared remote).

### Interactive rebase (later)

```bash
git rebase -i HEAD~3
```

Lets you squash / reword local commits before a PR. Powerful — practice in a throwaway branch first.

### Lab

**[Lab 04 — Rebase](./lab.html?id=04-rebase)**

---

## 10. Undoing mistakes

Pick the tool by *what you want to keep*.

### Discard unstaged edits in a file

```bash
git restore FILE
```

### Unstage

```bash
git restore --staged FILE
```

### Fix the last commit message (not pushed yet)

```bash
git commit --amend -m "Better message"
```

### Add forgotten files to the last commit (not pushed)

```bash
git add forgotten.txt
git commit --amend --no-edit
```

### Soft reset — move branch back, keep changes staged

```bash
git reset --soft HEAD~1
```

### Mixed reset (default) — move back, keep changes unstaged

```bash
git reset HEAD~1
```

### Hard reset — move back and wipe working tree changes

```bash
git reset --hard HEAD~1
```

⚠️ Hard reset destroys uncommitted work. Be sure.

### Revert — safe undo on shared history

Creates a *new* commit that undoes an old one:

```bash
git revert COMMIT_SHA
```

Prefer `revert` over `reset --hard` once commits are on the remote.

### Find lost commits

```bash
git reflog
```

Then `git switch -c recover HASH` if you need them back.

### Lab

**[Lab 05 — Undo](./lab.html?id=05-undo)**

---

## 11. Remotes & GitHub

### See remotes

```bash
git remote -v
```

### Add a remote (new project)

1. Create an empty repo on GitHub (no README if you already have local commits)
2. Connect and push:

```bash
git remote add origin https://github.com/YOU/REPO.git
git push -u origin main
```

`-u` sets upstream so later you can `git push` / `git pull` without extra args.

### Daily sync

```bash
git fetch origin          # download updates (don’t merge yet)
git pull                  # fetch + merge (or rebase, per config)
git push                  # upload your commits
```

### Tracking branches

`origin/main` is a local *picture* of the remote. `fetch` updates that picture; `merge`/`rebase` brings those commits into your branch.

### Auth notes

- HTTPS + personal access token, or
- SSH keys (`git@github.com:YOU/REPO.git`)

### Lab

**[Lab 06 — Remote & PR](./lab.html?id=06-remote-pr)** (needs a GitHub account)

---

## 12. Pull requests

A **pull request (PR)** asks: “Please review my branch and merge it into `main`.”

### Typical flow

```bash
git switch main
git pull
git switch -c feat/short-name
# …commits…
git push -u origin feat/short-name
```

Then on GitHub: **Compare & pull request**.

### What makes a good PR

- Small and focused (one purpose)
- Clear title and description (*why*, how to test)
- Linked issue if you have one
- Green checks / no surprise files

### Review habits

- Read the diff, not only the description
- Ask questions; suggest, don’t demand when tone matters
- Approve when it’s good enough — perfect is optional

### After merge

```bash
git switch main
git pull
git branch -d feat/short-name
git push origin --delete feat/short-name   # optional cleanup
```

---

## 13. Team workflows

### Trunk-based / short branches

- Branch from latest `main`
- Open PRs often
- Prefer small diffs

### Protected `main`

Common rules on GitHub:

- Require PR reviews
- Require CI to pass
- No direct pushes to `main`

### Commit hygiene

- Don’t commit secrets (`.env`, keys) — use `.gitignore`
- Don’t commit build junk (`node_modules/`, `dist/`) unless intentional
- One logical change per commit when you can

### `.gitignore` starter

```gitignore
.DS_Store
.env
*.log
node_modules/
```

### Communication

- Branch names that explain the work
- PR descriptions for future-you
- Rebase or merge main into your feature *before* asking for review

### Lab

**[Lab 07 — Team workflow](./lab.html?id=07-team-workflow)**

---

## 14. Cheat sheet

### Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git init
git clone URL
```

### Daily

```bash
git status
git add FILE
git commit -m "message"
git log --oneline --graph --all
git diff
git diff --staged
```

### Branches

```bash
git switch -c branch-name
git switch main
git branch -d branch-name
git merge branch-name
```

### Undo

```bash
git restore FILE
git restore --staged FILE
git commit --amend
git reset --soft HEAD~1
git reset --hard HEAD~1
git revert HASH
git reflog
```

### Remotes

```bash
git remote -v
git fetch
git pull
git push
git push -u origin branch-name
```

---

## 15. Learning path checklist

Use this as your progress board.

### Foundations

- [ ] Git installed and `user.name` / `user.email` set
- [ ] You can explain working tree vs staging vs commit
- [ ] Lab 01 complete

### Local collaboration with yourself

- [ ] Create branches confidently
- [ ] Merge without fear
- [ ] Resolve a conflict once on purpose
- [ ] Labs 02–03 complete

### History skills

- [ ] Rebase a local feature onto `main`
- [ ] Amend / reset / revert with intent
- [ ] Labs 04–05 complete

### Remote & team

- [ ] Push a branch and open a PR
- [ ] Use `.gitignore` and short-lived branches
- [ ] Labs 06–07 complete

---

You’re ready to treat Git as a tool you control — not a roulette wheel. Keep the terminal open, read `git status`, and practice in the labs.
