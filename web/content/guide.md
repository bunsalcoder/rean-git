# Git From First Commit to Team Workflow

> **Project:** `rean-git`  
> **Audience:** Beginners and juniors who use Git but don’t fully get it yet  
> **Style:** Real problems first, then the simple commands that fix them — plus labs in this repo

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

### Real-world problem

You’re building a school project website with a friend.

- You break the homepage, and want yesterday’s version back
- Your friend also edited `index.html` — whose zip is “final”?
- Friday’s deploy failed — what changed since Monday?

Without Git, people invent `project-v2-FINAL-really.zip`. That doesn’t scale.

### Git’s answer (simple)

**Git is a version control system.** It saves snapshots of your project so you can:

- Go back in time
- Work on ideas in parallel (branches)
- Combine work from more than one person
- Undo mistakes without guessing which zip to open

### Git vs GitHub (don’t mix them up)

| | What it is |
|--|------------|
| **Git** | The tool on your computer that tracks history |
| **GitHub** | A website that *hosts* Git repos, PRs, and reviews |

Git works offline. GitHub is where you share and collaborate.

### Lab link

After chapters 3–5 → [Lab 01 — First repo](./lab.html?id=01-first-repo)

---

## 2. Core mental model

### Real-world picture

Think of packing for a trip:

1. Clothes on the bed = files you edited (**working tree**)
2. Suitcase you’re filling = what you chose for *this* trip (**staging**)
3. Zipped suitcase with a label = a saved trip (**commit**)
4. Photo album of every trip = **history**

You don’t shove the whole room into every suitcase — you pick what belongs in *this* commit.

### The four words that matter

| Word | Meaning |
|------|---------|
| **Working tree** | The files you see and edit |
| **Staging** | Holding zone for the *next* commit (`git add`) |
| **Commit** | A saved snapshot with a message |
| **Branch** | A sticky note pointing at a commit (usually `main`) |

```
edit files  →  git add  →  staging  →  git commit  →  history
                                              ↓
                                        git push → remote (GitHub)
```

### Why this matters at work

You fixed a login bug *and* started a messy experiment in the same folder. Staging lets you commit **only the login fix** and leave the experiment out. That one idea clears half of “Git confusion.”

---

## 3. Install & first config

### Real-world problem

You try to commit, and Git says it doesn’t know who you are. Every commit needs an author — like signing a change log at work.

### Install

- **macOS:** `xcode-select --install` or [git-scm.com](https://git-scm.com)
- **Windows:** [Git for Windows](https://git-scm.com/download/win)
- **Linux:** `sudo apt install git` / `sudo dnf install git`

```bash
git --version
```

### Set your identity (do this once)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use the **same email** as GitHub so your commits show on your profile.

### Helpful defaults

```bash
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.editor "code --wait"   # or nano / vim
```

```bash
git config --list --show-origin
```

---

## 4. Your first repository

### Real-world problem

You start a personal notes site (or homework folder). You want history from day one — not after you’ve already lost a good draft.

### A) Brand new project on your laptop

```bash
mkdir my-notes && cd my-notes
git init
```

→ Creates a hidden `.git/` folder. You’re in a repo.

### B) Join an existing project (clone)

```bash
git clone https://github.com/bunsalcoder/rean-git.git
cd rean-git
```

→ Downloads the files **and** the full history. This is how you join a team repo at work.

### When you’re lost: ask `git status`

```bash
git status
```

It always answers: which branch, what’s changed, what to do next. Make it a habit — same as checking the build status before you leave for the day.

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

### Real-world problem

You changed three things today:

1. Fixed a typo on the homepage (ship it)
2. Started a half-finished dark mode (not ready)
3. Tweaked your personal notes (unrelated)

You want **one clean commit** for the typo — not a dump of everything. That’s why staging exists.

### Stage only what belongs together

```bash
git add index.html            # just the typo fix
git add -p                    # pick hunks interactively
git restore --staged FILE     # oops — unstage, keep edits
```

`git add .` stages *everything*. Useful, but careful when the folder is messy.

### Commit messages that help future-you

At work, people search history for “when did login break?” A vague message wastes hours.

Prefer:

```text
Fix login redirect after password reset
```

Not:

```text
fix
update
asdf
```

```bash
git commit -m "Fix login redirect after password reset"
```

### See what changed / what you saved

```bash
git diff              # edits not staged yet
git diff --staged     # what the next commit will include
git log --oneline
git log --oneline --graph --all
git show HEAD         # latest commit details
```

`HEAD` = “the commit I’m on right now.”

---

## 6. Branching

### Real-world problem

`main` is the live site. Your teammate asks you to add a “Contact” page — but a hot bug just came in on the homepage.

If you edit `main` directly, unfinished Contact work might ship with the bugfix. **Branches** let you isolate work.

### Create a safe line of work

```bash
git switch -c feat/contact-page     # new branch + switch
# older style: git checkout -b feat/contact-page
```

Later, for the bug:

```bash
git switch main
git switch -c fix/homepage-crash
```

### See where you are

```bash
git branch          # local branches (* = current)
git branch -a       # include remotes
```

### Mental picture

```
main:              A---B---C
                            \
feat/contact-page:           D---E
```

Each letter is a commit. A branch is just a pointer with a name.

### Rules that match real jobs

- Keep `main` safe to deploy
- Name branches for the job: `fix/login-crash`, `feat/signup-form`
- One purpose per branch

### Lab

**[Lab 02 — Branch & merge](./lab.html?id=02-branch-merge)**

---

## 7. Merging

### Real-world problem

Your Contact page is done and reviewed. You need those commits on `main` so the site can go live. **Merge** = “bring this finished work into the branch we ship from.”

### The basic move

```bash
git switch main
git merge feat/contact-page
```

### What you’ll see

**Fast-forward** — `main` had no new commits while you worked. Git just moves the `main` pointer forward. History stays a straight line.

**Merge commit** — someone else merged to `main` while you worked. Git joins both lines and may create a commit with two parents.

```bash
git log --oneline --graph --all
```

### Clean up the finished branch

```bash
git branch -d feat/contact-page
```

Use `-D` only when you mean “throw this branch away.”

---

## 8. Conflicts

### Real-world problem

You and a teammate both change the homepage button text:

- You: `Sign up`
- They: `Get started`

Git cannot guess which wording to keep. That’s a **conflict** — not an error, a decision.

### What the file looks like

```text
<<<<<<< HEAD
Sign up
=======
Get started
>>>>>>> feat/other
```

### Resolve calmly (same as at work)

1. Open the file
2. Pick the final text (or combine ideas) and **delete the markers**
3. Finish the merge:

```bash
git add index.html
git commit          # message is often pre-filled
```

Panic button:

```bash
git merge --abort
```

### Stay out of big fights

- Pull / merge often so conflicts stay small
- Talk when two people own the same hot file
- `git status` lists files still unmerged

### Lab

**[Lab 03 — Conflict](./lab.html?id=03-conflict)**

---

## 9. Rebase (carefully)

### Real-world problem

Your feature branch has three commits. Meanwhile `main` got a security fix. Before you open a PR, you want your work to sit **on top of** the latest `main` — clean history, fewer surprises in review.

**Rebase** = replay *your* commits on top of another branch.

```bash
git switch feat/contact-page
git fetch origin
git rebase main
```

### Merge vs rebase (when to use which)

| | Merge | Rebase |
|--|-------|--------|
| History | Keeps the real branch join | Looks like a straight line |
| Shared branches | Safer | Risky if others already pulled your commits |
| Typical use | Merge feature → `main` | Update *your* feature onto latest `main` |

### Golden rule (memorize this)

**Do not rebase commits other people already built on** — especially shared `main`.

Rebase your *local* feature branch. Prefer merge (or revert) for history everyone shares.

### Optional: clean commits before a PR

```bash
git rebase -i HEAD~3
```

Squash “oops” commits into one clear story. Practice on a throwaway branch first.

### Lab

**[Lab 04 — Rebase](./lab.html?id=04-rebase)**

---

## 10. Undoing mistakes

### Real-world problem

You commit the wrong file, typo a message, or wipe good code by accident. Panic is optional — pick the tool by **what you still want to keep**.

### “I edited the wrong file — throw my edits away”

```bash
git restore FILE                 # discard unstaged edits in that file
```

### “I staged too much”

```bash
git restore --staged FILE        # unstage; keep the edits
```

### “Last commit message is wrong” (not pushed yet)

```bash
git commit --amend -m "Better message"
```

### “I forgot a file in the last commit” (not pushed)

```bash
git add forgotten.txt
git commit --amend --no-edit
```

### “Undo the last commit, keep my work”

```bash
git reset --soft HEAD~1          # back one commit; changes stay staged
git reset HEAD~1                 # back one; changes stay unstaged
```

### “Nuke everything back to last commit” (dangerous)

```bash
git reset --hard HEAD~1
```

⚠️ Destroys uncommitted work. Only when you’re sure.

### “We already pushed — don’t rewrite history”

```bash
git revert COMMIT_SHA            # new commit that undoes an old one
```

At work, **prefer `revert` on shared branches**. `reset --hard` on remote history makes teammates suffer.

### “I think I lost a commit”

```bash
git reflog
git switch -c recover HASH       # bring it back on a new branch
```

### Lab

**[Lab 05 — Undo](./lab.html?id=05-undo)**

---

## 11. Remotes & GitHub

### Real-world problem

Your laptop dies — or a teammate needs the code. Local Git alone is not a backup. A **remote** (usually GitHub, named `origin`) is the shared copy.

### See remotes

```bash
git remote -v
```

### New project → GitHub

1. Create an empty repo on GitHub (skip the README if you already have local commits)
2. Connect and push:

```bash
git remote add origin https://github.com/YOU/REPO.git
git push -u origin main
```

`-u` remembers the upstream so later `git push` / `git pull` are shorter.

### Daily sync (same as most jobs)

```bash
git fetch origin          # download updates; don’t change your files yet
git pull                  # fetch + merge into your current branch
git push                  # upload your commits
```

`origin/main` is your laptop’s *picture* of GitHub’s `main`. `fetch` updates the picture; `pull` brings those commits into your branch.

### Auth

- HTTPS + personal access token, or
- SSH (`git@github.com:YOU/REPO.git`)

### Lab

**[Lab 06 — Remote & PR](./lab.html?id=06-remote-pr)** (needs a GitHub account)

---

## 12. Pull requests

### Real-world problem

You fixed a login bug. You should **not** push straight to `main` on a team. A **pull request (PR)** says: “Please review this branch, then merge it.”

That’s how real teams ship: review first, then land on `main`.

### Typical flow

```bash
git switch main
git pull
git switch -c fix/login-redirect
# …make commits…
git push -u origin fix/login-redirect
```

On GitHub: **Compare & pull request**.

### What reviewers actually want

- Small PR — one purpose
- Title that states the fix (`Fix login redirect after password reset`)
- Short description: *why*, how to test
- No surprise files (no `.env`, no `node_modules`)

### After it’s merged

```bash
git switch main
git pull
git branch -d fix/login-redirect
git push origin --delete fix/login-redirect   # optional cleanup
```

---

## 13. Team workflows

### Real-world problem

Five people push random commits to `main`. Deploys break. Nobody knows what shipped. Workflows exist so the team stays fast *and* safe.

### Habits that scale

| Habit | Why |
|-------|-----|
| Short-lived branches | Less drift from `main`, smaller conflicts |
| Open PRs often | Feedback early, not a 2,000-line surprise |
| Protect `main` | Reviews + CI required; no direct pushes |
| Ignore junk | Secrets and build output never hit the repo |

### Protect `main` on GitHub (common rules)

- Require PR reviews
- Require CI to pass
- Block direct pushes to `main`

### Commit hygiene

```gitignore
.DS_Store
.env
*.log
node_modules/
```

Don’t commit secrets or `node_modules/`. One logical change per commit when you can.

### Before you ask for review

```bash
git switch main && git pull
git switch feat/your-branch
git merge main                 # or: git rebase main (local only)
```

Update your branch with latest `main` first — reviewers shouldn’t fix your merge conflicts for you.

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
- [ ] You can explain working tree vs staging vs commit (suitcase story)
- [ ] Lab 01 complete

### Local collaboration with yourself

- [ ] Create branches for features and bug fixes
- [ ] Merge finished work into `main`
- [ ] Resolve one conflict on purpose
- [ ] Labs 02–03 complete

### History skills

- [ ] Rebase a *local* feature onto latest `main`
- [ ] Choose restore / reset / revert for the situation
- [ ] Labs 04–05 complete

### Remote & team

- [ ] Push a branch and open a PR
- [ ] Use `.gitignore` and short-lived branches
- [ ] Labs 06–07 complete

---

You’re ready to treat Git as a tool you control — not a roulette wheel. Keep the terminal open, read `git status`, and practice in the labs.
