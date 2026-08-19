# Contributing to rean-git

Handbook and labs are the product. Edit those first, then keep the site copies, locales, and checks in sync.

## English content (source of truth)

| Edit this | Then |
|-----------|------|
| `docs/GIT_FROM_ZERO.md` | Handbook chapters |
| `labs/<id>/README.md` | Lab instructions |
| `web/data/labs.json` | Lab order and level (`beginner` / `intermediate` / `advanced`) |

After English edits:

```bash
./scripts/sync_en_content.sh
```

That copies sources into `web/content/en/` and rewrites handbook lab links to `./lab.html?id=<id>`. Do not edit `web/content/en/` by hand.

If you add or remove a chapter or lab:

1. Add matching keys in `web/locales/en.json` and `web/locales/km.json`
   (`chapters.<id>` or `labs.<id>.title` / `teaser` / `summary`).
2. Regenerate the sitemap:

```bash
python3 scripts/check_site_quality.py --write-sitemap
```

Chapter IDs come from handbook headings (`## How to use this guide` and `## N. …`). You do not need to list them in JavaScript.

## Khmer content

Khmer has no sync script. Update it in place:

- `web/content/km/guide.md` — same chapter headings as English (`## 1.`, `## 2.`, … plus the how-to-use heading).
- `web/content/km/labs/<id>.md` — same `##` section count as the English lab (Goal / Setup / Steps / …, translated).
- `web/locales/km.json` — UI strings and titles.

If a Khmer file is missing, the site falls back to English. CI still requires the Khmer files to exist and to follow English structure.

## Checks

```bash
./scripts/check_content_sync.sh   # English copies match sources
./scripts/check_site_quality.sh   # locales, chapters, Khmer structure, links, SEO
npm run test:e2e                  # optional; Playwright smoke tests
```

CI runs the first two (and Playwright) on pushes and PRs to `main` and `develop`.

## Lab self-check

Each lab folder has an optional `verify.sh` you can run after finishing the steps in `playground/`:

```bash
cd labs/01-first-repo
./verify.sh
```

Shared helpers live in `scripts/lab_verify_lib.sh`. Verifiers inspect local git state (clean tree, branches, tags, hooks, etc.). Labs that use GitHub (06, 07) print warnings for steps that must be confirmed in the browser.

When you add a lab, add `labs/<id>/verify.sh` and register checks in `scripts/check_site_quality.py` via `check_lab_verifiers()`.

## Issues and pull requests

Use the GitHub issue forms for **content** vs **site bugs**. PRs should include the checklist in `.github/pull_request_template.md`.

If you change shell assets (CSS, JS, fonts, icons) that the service worker precaches, bump `CACHE` in `web/sw.js` so browsers pick up the new files. Installable PWA metadata lives in `web/manifest.webmanifest`.

## Site UI

Strings in `web/locales/*.json` cover chrome (nav, buttons, search). Keep `en.json` and `km.json` on the same keys.

Preview:

```bash
cd web
python3 -m http.server 4173
```
