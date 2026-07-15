# rean-git — Product requirements

Learn Git from absolute beginner to confident collaborator — guided path with a full handbook, runnable labs, and a responsive static learning site.

Same product shape as [rean-docker](../rean-docker), different topic and visual style.

---

## 1. Product

| Field | Value |
|-------|--------|
| **Name** | `rean-git` |
| **Tagline** | Hands-on Git from first commit to team workflow — chapters, commands, and labs you run yourself. |
| **Hosting** | Static site on GitHub Pages (`web/`) |
| **Audience** | Beginners and juniors who “use Git but don’t get it” |
| **Not** | Deep Git internals textbook, or GitHub-only product marketing |

### Learner outcomes

After finishing, a learner can:

- Use Git daily without fear
- Branch / commit / merge / resolve conflicts
- Understand rebase vs merge at a practical level
- Open a clean PR and handle review feedback
- Recover from common mistakes (`reset`, `reflog`, wrong branch)

---

## 2. How it differs from rean-docker

| | rean-docker | rean-git |
|--|-------------|----------|
| Metaphor | Harbor / shipping | Desk notebook / commit journal |
| Mood | Cool ops / sea | Warm paper, ink, calm focus |
| Hero | Full-bleed harbor photo | Full-bleed desk/notebook/ink (or textured paper + typed commit log) |
| Palette | Harbor teal/blue family | Ink charcoal + one warm accent (**amber** recommended) |
| Type | Space Grotesk / Literata / JetBrains | Keep similar *roles*, change faces so it doesn’t look copy-pasted |
| Labs | Docker CLI + project files | Git repo sandboxes under `labs/` |

**Rule:** reuse the architecture, not the look.

---

## 3. Visual / UX direction

**Direction:** “notebook on a quiet desk”

- Background: soft paper grain / warm off-ink wash (not flat white; avoid cream + terracotta cliché system)
- Avoid: purple gradients, neon glow, pill clusters, dashboard cards in the hero
- Motion: 2–3 intentional ones (hero drift/fade, path reveal, sidebar active) — same spirit as rean-docker, different feel
- Code blocks: mono, high readability
- Mobile: collapsing nav; readable Learn sidebar

**Brand test:** remove the nav → the first viewport still reads as rean-git, not a generic tutorial theme.

**Hero budget (home):** brand, one lead sentence, one CTA group, one dominant full-bleed visual. No stats, cards, or secondary promo clutter in the first viewport.

---

## 4. Repository structure

```text
rean-git/
├── README.md
├── REQUIREMENTS.md                 # this file
├── .gitignore
├── .github/workflows/pages.yml     # deploy web/ → GitHub Pages
├── docs/
│   └── GIT_FROM_ZERO_TO_HERO.md    # full handbook (source of truth)
├── labs/
│   ├── 01-first-repo/
│   ├── 02-branch-merge/
│   ├── 03-conflict/
│   ├── 04-rebase/
│   ├── 05-undo/
│   ├── 06-remote-pr/
│   └── 07-team-workflow/
└── web/
    ├── index.html
    ├── learn.html
    ├── labs.html
    ├── lab.html
    ├── robots.txt                  # v1.1
    ├── sitemap.xml                 # v1.1
    ├── content/
    │   ├── guide.md                # site-facing handbook
    │   └── labs/
    │       ├── 01-first-repo.md
    │       ├── 02-branch-merge.md
    │       ├── 03-conflict.md
    │       ├── 04-rebase.md
    │       ├── 05-undo.md
    │       ├── 06-remote-pr.md
    │       └── 07-team-workflow.md
    └── assets/
        ├── css/site.css
        ├── js/site.js
        ├── js/learn.js
        └── img/                    # favicon, hero, og image
```

---

## 5. Site pages

### Home — `web/index.html`

- Brand-first hero: `rean-git`
- Short lead + two CTAs: **Start learning** · **Open labs**
- Full-bleed hero visual (not a card / inset media)
- Below fold: path highlights + “how it works” (type the commands)

### Learn — `web/learn.html`

- Sidebar chapter nav + Markdown reader (same pattern as rean-docker)
- Deep-link chapters with `?c=N`
- Final chapter = cheat sheet

### Labs index — `web/labs.html`

- Ordered list of 7 labs with level tags
- Links to `lab.html?id=...`

### Lab detail — `web/lab.html`

- Loads `web/content/labs/<id>.md`
- Clear goal / commands / check / common mistakes

### Non-goals (v1)

- No auth, CMS, API, comments, or ads
- No in-browser interactive terminal (learner uses their own terminal)

---

## 6. Handbook outline

File: `docs/GIT_FROM_ZERO_TO_HERO.md`  
Also reflected in: `web/content/guide.md`

| # | Chapter | Outcome |
|---|---------|---------|
| 1 | Why version control exists | Mental model: time machine for code |
| 2 | Install Git & first config | `user.name`, `user.email`, editor |
| 3 | Repo anatomy | Working tree, staging, commits; `.git` without fear |
| 4 | Your first repo | `init`, `status`, `add`, `commit`, `log` → **Lab 01** |
| 5 | Commit messages that help humans | Short subject; why over what |
| 6 | Branching | Create / switch / list; branch = pointer → **Lab 02** |
| 7 | Merge | Fast-forward vs merge commit |
| 8 | Merge conflicts | Read markers, resolve safely → **Lab 03** |
| 9 | Rebase (practical) | When / why; don’t rewrite public history → **Lab 04** |
| 10 | Undo & recover | `restore`, `reset`, `revert`, `reflog` → **Lab 05** |
| 11 | Remotes | `clone`, `fetch`, `pull`, `push`, `origin` |
| 12 | Pull requests & code review | GitHub/GitLab mental model → **Lab 06** |
| 13 | Team workflows | Trunk-based vs git-flow lite → **Lab 07** |
| 14 | Hygiene | `.gitignore`, LFS light, secrets never in Git |
| 15 | Common disasters & fixes | Detached HEAD, wrong branch, careful undo of push |
| 16 | Cheat sheet | One-page command reference |

### Voice

- Short paragraphs; command-first when teaching CLI
- Explain *why* before dumping flags
- “Type it yourself” culture
- No fake guru tone

---

## 7. Labs

Each lab folder: `README.md` + tiny practice files. Learner runs Git in that folder (or a copy).

### Lab 01 — First repo

- **Goal:** init → add → commit → read `log`
- **Files:** `hello.txt` (or similar)
- **Check:** `git log --oneline` shows ≥ 1 commit

### Lab 02 — Branch & merge

- **Goal:** feature branch → edit → merge to main
- **Check:** main contains the feature change; history makes sense

### Lab 03 — Conflict

- **Goal:** create an intentional conflict, resolve, commit
- **Check:** no conflict markers left; history continues

### Lab 04 — Rebase

- **Goal:** rebase feature onto updated main (local only)
- **Check:** learner understands linear history and when *not* to rebase

### Lab 05 — Undo

- **Goal:** discard unstaged, unstage, `reset --soft` / `--mixed`, `revert` vs reset
- **Check:** recover a “lost” commit via `reflog` (guided)

### Lab 06 — Remote & PR

- **Goal:** push to a GitHub remote, open a PR (own repo is fine)
- **Check:** PR exists with clear title/body; optional self-review checklist
- **Fallback:** if they can’t use GitHub yet, document a second local bare repo as `origin`

### Lab 07 — Team workflow mini-project

- **Goal:** simulate two “developers” (two clones or two folders), PR discipline
- **Deliverable:** short note of what they shipped + how history looks

Site lab Markdown under `web/content/labs/` must match the folder labs.

---

## 8. Project README

`README.md` should include:

- What rean-git is
- How to open the site locally (`cd web && python3 -m http.server 4173`)
- Link to the handbook
- Labs table in order
- Prerequisites: Git installed (`git --version`)
- Suggested weekly pace (short)

---

## 9. Technical requirements

- Pure static: HTML / CSS / JS + Markdown over HTTP
- GitHub Actions Pages deploy from `web/` (same pattern as rean-docker)
- Works on desktop and mobile
- No build step required for v1
- Optional later: sync script from `docs/` → `web/content/guide.md`
- Learning material for personal use (same spirit as rean-docker)

---

## 10. Scope: MVP vs later

### MVP (ship first)

1. Repo skeleton + Pages workflow
2. Visual system + Home
3. Handbook chapters 1–10 draft + Learn reader
4. Labs 01–05 working
5. Labs index + lab reader

### v1.1

- Chapters 11–16 polish
- Labs 06–07
- Cheat sheet chapter
- `robots.txt`, `sitemap.xml`, basic `og:` tags

### Later (optional)

- Language toggle (e.g. Khmer)
- Printable PDF of the handbook
- Cross-link: “Next: rean-docker”

---

## 11. Suggested build order

1. Scaffold folders + `README.md` + Pages workflow
2. Copy **structure** from rean-docker HTML/JS; rewrite CSS, brand, hero
3. Ship Lab 01 end-to-end (folder + site content + reader) — proves the loop
4. Draft all handbook headings in `docs/GIT_FROM_ZERO_TO_HERO.md`
5. Fill chapters in order; attach labs as you go
6. Wire Home “path” section to real chapters
7. Deploy Pages; check mobile nav + Learn readability

---

## 12. Definition of done

rean-git is done when:

- [ ] A beginner can go Home → Learn ch.1 → Lab 01 without getting lost
- [ ] All 7 labs run on a clean machine with only Git installed (Lab 06 remote path documented)
- [ ] Style is clearly *not* a recolored rean-docker
- [ ] Site deploys from `main` automatically

---

## 13. Locked decisions

| Decision | Choice |
|----------|--------|
| Accent | Ink charcoal + **amber** |
| Metaphor | Notebook / commit journal |
| Lab count | 7 |
| Chapter count | 16 (incl. cheat sheet) |
| Platform | Static GitHub Pages |

---

## 14. Out of scope

- Ad networks / monetization
- Accounts, comments, analytics product features (simple privacy-friendly analytics later is optional)
- Teaching every GitHub UI detail (teach Git first; GitHub as one remote host)
- Guaranteed SEO traffic (basic static SEO files only in v1.1)
