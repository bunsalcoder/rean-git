# Git From Zero to Hero

> **Project:** `rean-git`  
> **Audience:** Absolute beginners through advanced — build real skill, not superstition  
> **Style:** Real problems first, then the commands that fix them — plus labs in this repo

---

## How to use this guide

1. Read each chapter in order (they build on each other).
2. Type the commands yourself — do not only read them.
3. After core chapters, complete the matching lab under `labs/`.
4. Keep a terminal open in this project root (wherever you cloned the repo):

```bash
cd path/to/rean-git
```

**Path shape**

| Stage | Chapters | Goal |
|-------|----------|------|
| Foundations | 1–5 | Think in commits |
| Collaboration | 6–13 | Branch, merge, ship with a team |
| Power tools | 14–20 | Stash, tags, rewrite, debug history |
| Professional | 21–24 | Hooks, signing, forks, large assets |
| Mastery | 25–27 | Internals, cheat sheet, checklist |

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
14. [Stash](#14-stash)
15. [Tags & releases](#15-tags--releases)
16. [Cherry-pick](#16-cherry-pick)
17. [Interactive rebase](#17-interactive-rebase)
18. [Bisect](#18-bisect)
19. [Worktrees & detached HEAD](#19-worktrees--detached-head)
20. [Inspecting history](#20-inspecting-history)
21. [Hooks](#21-hooks)
22. [Signing commits](#22-signing-commits)
23. [Forks & multiple remotes](#23-forks--multiple-remotes)
24. [Submodules & Git LFS](#24-submodules--git-lfs)
25. [How Git works inside](#25-how-git-works-inside)
26. [Cheat sheet](#26-cheat-sheet)
27. [Learning path checklist](#27-learning-path-checklist)

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

After chapters 3–5 → [Lab 01 — First repo](../labs/01-first-repo/)

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

Complete **[Lab 01 — First repo](../labs/01-first-repo/)** before continuing.

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

**[Lab 02 — Branch & merge](../labs/02-branch-merge/)**

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

### Lab

Same practice as branching: **[Lab 02 — Branch & merge](../labs/02-branch-merge/)**

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

**[Lab 03 — Conflict](../labs/03-conflict/)**

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

### Preview: clean commits before a PR

```bash
git rebase -i HEAD~3
```

Squash “oops” commits into one clear story. You’ll go deeper in **chapter 17**. Practice on a throwaway branch first.

### Lab

**[Lab 04 — Rebase](../labs/04-rebase/)**

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

**[Lab 05 — Undo](../labs/05-undo/)**

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

**[Lab 06 — Remote & PR](../labs/06-remote-pr/)** (needs a GitHub account)

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

### Lab

Finish the remote practice: **[Lab 06 — Remote & PR](../labs/06-remote-pr/)**

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

**[Lab 07 — Team workflow](../labs/07-team-workflow/)**

---

## 14. Stash

### Real-world problem

You’re mid-feature with messy uncommitted edits. A production bug needs a hotfix *right now* on `main`. You can’t commit half-broken work, and you don’t want to lose it.

**Stash** = temporary shelf for uncommitted changes.

### Basic moves

```bash
git stash push -m "wip contact form"
git status                 # clean working tree
git switch main
# …fix the bug, commit, push…
git switch feat/contact
git stash list
git stash pop              # re-apply + drop from list
```

### Useful variants

```bash
git stash push -u -m "include untracked"   # also stash new files
git stash apply stash@{0}                  # re-apply, keep stash
git stash drop stash@{0}
git stash show -p stash@{0}                # preview
```

### Rules of thumb

- Stash is local — it doesn’t go to GitHub
- Prefer named stashes (`-m`) so you remember them
- Don’t let stashes pile up for weeks

### Lab

**[Lab 08 — Stash](../labs/08-stash/)**

---

## 15. Tags & releases

### Real-world problem

Customers run “version 1.4.2”. Deploy scripts need a **fixed name** for a commit — not “whatever `main` is today.”

A **tag** is a sticky label on a commit. Teams use tags for releases.

### Lightweight vs annotated

```bash
git tag v1.0.0-beta                 # lightweight pointer
git tag -a v1.0.0 -m "Ship v1.0.0"  # annotated (preferred for releases)
git tag -l
git show v1.0.0
```

### Share tags

```bash
git push origin v1.0.0
git push origin --tags              # all local tags (be careful)
```

### Move carefully

```bash
git tag -d v1.0.0                   # delete local
git push origin --delete v1.0.0     # delete remote
```

Moving a published tag breaks people who already pulled it. Prefer a new version (`v1.0.1`).

### SemVer (common pattern)

`MAJOR.MINOR.PATCH` — breaking / feature / fix. Example: `v2.1.0`.

### Lab

**[Lab 09 — Tags](../labs/09-tags/)**

---

## 16. Cherry-pick

### Real-world problem

A critical fix landed on `feat/billing`. Production needs *only that commit* on `main` — not the whole unfinished feature.

**Cherry-pick** copies a commit onto your current branch.

```bash
git switch main
git pull
git log feat/billing --oneline      # find the fix SHA
git cherry-pick abc1234
git push
```

### Conflicts

Same markers as merge. Fix files, then:

```bash
git add .
git cherry-pick --continue
# or
git cherry-pick --abort
```

### When not to cherry-pick

- Prefer merge/rebase when you want the *whole* branch
- Cherry-picking the same fix into many long-lived branches can create duplicate commits — communicate with the team

### Lab

**[Lab 10 — Cherry-pick](../labs/10-cherry-pick/)**

---

## 17. Interactive rebase

### Real-world problem

Your PR has: `wip`, `fix typo`, `actually fix login`, `oops`. Reviewers deserve one clear story.

**Interactive rebase** lets you reorder, edit, squash, or drop commits *before* others build on them.

```bash
git switch feat/login
git rebase -i HEAD~4        # or: git rebase -i main
```

An editor opens with lines like:

```text
pick a111 fix login
pick b222 wip
pick c333 typo
```

### Common todo commands

| Command | Meaning |
|---------|---------|
| `pick` | Keep as-is |
| `reword` | Keep changes, edit message |
| `squash` / `fixup` | Fold into previous commit |
| `edit` | Pause to amend that commit |
| `drop` | Remove the commit |

Save & close → Git replays. Resolve conflicts with `--continue` / `--abort` like a normal rebase.

### Golden rules (same as chapter 9)

- Only rewrite **local** commits (or a branch nobody else uses)
- After rewriting a pushed branch: `git push --force-with-lease` (safer than `--force`)
- Never force-push `main`

### Lab

**[Lab 11 — Interactive rebase](../labs/11-interactive-rebase/)**

---

## 18. Bisect

### Real-world problem

“Login broke sometime last month.” Blind guessing wastes a day. **Bisect** binary-searches history to find the first bad commit.

```bash
git bisect start
git bisect bad                  # current commit is broken
git bisect good v1.2.0          # or an old SHA that worked
# Git checks out a midpoint. Test the app, then:
git bisect good                 # if this midpoint works
# or
git bisect bad                  # if this midpoint is broken
# …repeat until Git prints the first bad commit…
git bisect reset                # return to where you started
```

### Automate when you have a test

```bash
git bisect start HEAD v1.2.0
git bisect run ./scripts/check-login.sh
```

Exit code `0` = good, non-zero = bad.

### Lab

**[Lab 12 — Bisect](../labs/12-bisect/)**

---

## 19. Worktrees & detached HEAD

### Real-world problem

You need to review a PR while your feature branch is dirty. Stashing works — or you check out a **second working folder** with `git worktree`.

### Detached HEAD (what it means)

```bash
git switch --detach v1.0.0
# or older: git checkout v1.0.0
```

You’re on a commit, **not** a branch name. New commits can become hard to find unless you create a branch:

```bash
git switch -c hotfix/from-tag
```

`git status` will warn you when you’re detached. Read that warning.

### Worktrees

```bash
git worktree add ../rean-git-pr-42 pr-42-branch
cd ../rean-git-pr-42
# review / test…
cd -
git worktree remove ../rean-git-pr-42
git worktree list
```

Each worktree has its own files; they share the same `.git` object database.

### When to use which

| Tool | Use |
|------|-----|
| Stash | Quick context switch, short-lived |
| Worktree | Parallel work for hours/days |
| New clone | Heavy isolation (different remotes/config) |

---

## 20. Inspecting history

### Real-world problem

“Who changed this line?” “What landed last Tuesday?” “Show only commits that touch `auth/`.” Heroes read history fluently.

### Who touched this line?

```bash
git blame FILE
git blame -L 20,40 FILE
```

### Powerful `log`

```bash
git log --oneline --graph --all --decorate
git log --since="2 weeks ago" --author="Ada"
git log -S "redirect" -p          # pickaxe: commits that add/remove that string
git log -- PATH/TO/FILE
git log --grep="login" -i
git show HASH
git show HASH:path/to/file        # file contents at that commit
```

### Compare branches / ranges

```bash
git log main..feat/login          # on feat but not main
git diff main...feat/login        # triple-dot: changes since branches diverged
git shortlog -sn                  # commit counts by author
```

### Cleaner diffs

```bash
git diff --stat
git diff --word-diff
git range-diff main...feat/login  # compare two histories after rebase
```

Master these and GitHub’s UI becomes optional for investigation.

---

## 21. Hooks

### Real-world problem

Someone pushes a commit that fails lint. CI catches it later — after review time is burned. **Hooks** run scripts at Git events on your machine (or the server).

### Client hooks you’ll actually meet

| Hook | When |
|------|------|
| `pre-commit` | Before a commit is created |
| `commit-msg` | Validate / format the message |
| `pre-push` | Before `git push` sends objects |

Hooks live in `.git/hooks/` (not committed by default). Sample files end in `.sample`.

### Minimal example

```bash
# .git/hooks/pre-commit  (chmod +x)
#!/bin/sh
npm test || exit 1
```

### Team-friendly pattern

Commit a `scripts/hooks/` or use a tool ([Husky](https://typicode.github.io/husky/), `pre-commit` framework) so everyone shares the same checks. Don’t rely only on local hooks — still run CI.

### Server / platform hooks

GitHub **branch protection** + required checks is the modern “server hook.” Classic `update` hooks exist on bare servers you host yourself.

---

## 22. Signing commits

### Real-world problem

Anyone can set `user.name` to your name. **Signed commits** prove the author controls a key GitHub trusts — useful for releases and security-sensitive orgs.

### SSH signing (simple on modern GitHub)

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
# Add the same SSH key as a “Signing key” on GitHub
```

### GPG / SSH verify locally

```bash
git log --show-signature -1
git verify-commit HEAD
```

### Amend & rebase note

Rewriting history re-signs (or drops signatures). That’s expected after interactive rebase.

Many teams make signing optional for juniors; some require it on `main`. Match your workplace.

---

## 23. Forks & multiple remotes

### Real-world problem

You contribute to an open-source repo you don’t write access to. Pattern:

1. **Fork** on GitHub (your copy)
2. Clone *your* fork
3. Add the original as `upstream`
4. Push branches to `origin`, open a PR into `upstream`

```bash
git clone https://github.com/YOU/project.git
cd project
git remote add upstream https://github.com/ORIGINAL/project.git
git remote -v
git fetch upstream
git switch main
git merge upstream/main          # or: git rebase upstream/main
git push origin main
```

### Multiple remotes at work

```bash
git remote add staging git@github.com:Acme/app-staging.git
git push staging feat/demo:main
```

Names are arbitrary — `origin` is only a convention.

### Mirror / backup

```bash
git clone --mirror URL
git push --mirror BACKUP_URL
```

Use carefully — mirrors rewrite matching refs.

---

## 24. Submodules & Git LFS

### Real-world problem

Your app needs a shared design-system repo, or 2 GB of video assets. Normal Git commits hate huge binaries and nested-repos are awkward.

### Submodules (nested Git repos)

```bash
git submodule add https://github.com/Acme/design-system.git libs/design
git submodule update --init --recursive
```

After clone of a parent repo:

```bash
git clone --recurse-submodules URL
# or later:
git submodule update --init --recursive
```

**Trade-off:** Submodules pin a specific commit. Teammates must remember to init/update. Prefer a package manager when you can; use submodules when you truly need a nested Git project.

### Git LFS (Large File Storage)

```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
git add hero.psd
git commit -m "Add hero artwork via LFS"
```

LFS stores pointers in Git and big files on an LFS server. Needs `git-lfs` installed for everyone who checks out those files.

### Alternatives

- Package registry / CDN for assets
- Subtree merges (`git subtree`) — less common, fewer gotchas than submodules for some teams

---

## 25. How Git works inside

### Real-world problem

Commands feel like magic until you see the model. Once you do, `reset`, `rebase`, and “detached HEAD” stop being scary.

### Everything is content-addressed

Git stores objects hashed by content (SHA-1 or SHA-256 in newer repos):

| Object | Holds |
|--------|-------|
| **blob** | File contents |
| **tree** | Directory listing → blobs/trees |
| **commit** | Parent(s) + tree + author + message |
| **tag** | Annotated tag object |

```bash
git cat-file -t HEAD
git cat-file -p HEAD
git rev-parse HEAD
ls .git/objects
```

### Refs are names for commits

```bash
cat .git/HEAD                     # ref: refs/heads/main
cat .git/refs/heads/main          # current tip SHA
git show-ref
```

A **branch** is a movable ref. A **tag** is usually immovable. **Remote-tracking** refs live under `refs/remotes/origin/…`.

### The three trees (again, for real)

1. Working directory — your files  
2. Index (staging) — `.git/index`  
3. `HEAD` commit — last snapshot on this branch  

`git status` compares these three.

### Packfiles

Loose objects eventually pack into efficient `.git/objects/pack/` files. `git gc` cleans up. You rarely need to touch this.

### Why this makes you a hero

- Cherry-pick = copy a commit object onto another parent  
- Reset = move a branch ref (and maybe index/worktree)  
- Reflog = local diary of where HEAD pointed  

### Beyond this handbook (map of the rest)

You now own everyday Git plus the power tools. These show up less often — learn them when a real job needs them:

| Topic | When you need it |
|-------|------------------|
| `git sparse-checkout` | Huge monorepo; only check out some folders |
| Partial clone (`--filter`) | Clone history/blobs on demand |
| `git filter-repo` / BFG | Permanently remove secrets or huge files from history |
| `git notes` | Attach metadata without changing commit hashes |
| `git format-patch` / `am` | Email-based patch workflow |
| `rerere` | Reuse recorded conflict resolutions |
| `git replace` | Temporarily swap one object for another |
| Credential helpers | Cache HTTPS tokens securely |
| Maintenance (`git maintenance`) | Keep large repos fast |

Official deep dive: [Pro Git book](https://git-scm.com/book/en/v2) (free).

### Lab

**[Lab 13 — Internals](../labs/13-internals/)**

---

## 26. Cheat sheet

### Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git init
git clone URL
```

### Daily

```bash
git status
git add FILE
git add -p
git commit -m "message"
git log --oneline --graph --all --decorate
git diff
git diff --staged
```

### Branches & integrate

```bash
git switch -c branch-name
git switch main
git branch -d branch-name
git merge branch-name
git rebase main
git rebase -i HEAD~3
git cherry-pick HASH
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
git stash push -m "wip"
git stash pop
```

### Remotes & tags

```bash
git remote -v
git fetch
git pull
git push
git push -u origin branch-name
git push --force-with-lease
git tag -a v1.0.0 -m "msg"
git push origin v1.0.0
```

### Inspect

```bash
git blame FILE
git log -S "symbol" -p
git show HASH
git bisect start
git worktree add ../other branch
```

### Internals peek

```bash
git rev-parse HEAD
git cat-file -p HEAD
git show-ref
```

---

## 27. Learning path checklist

Use this as your progress board — foundations first, then hero skills.

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

### Power tools

- [ ] Stash unfinished work and recover it
- [ ] Tag a release and push the tag
- [ ] Cherry-pick a single commit onto another branch
- [ ] Squash commits with interactive rebase
- [ ] Find a bad commit with bisect
- [ ] Labs 08–12 complete

### Professional Git

- [ ] Explain detached HEAD and when worktrees help
- [ ] Use `blame` / `log -S` to investigate a change
- [ ] Know what hooks and signed commits are for
- [ ] Add an `upstream` remote on a fork
- [ ] Explain when to use submodules vs LFS vs packages

### Mastery

- [ ] Describe blob / tree / commit / ref in plain words
- [ ] Lab 13 complete
- [ ] You reach for `git status` before guessing

---

You’re not done learning Git forever — the ecosystem keeps evolving — but you now own the full mental model: everyday workflow, power tools, collaboration patterns, and how the database underneath works. Keep the terminal open, read `git status`, and practice in the labs.
