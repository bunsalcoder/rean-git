# Contributing to rean-git

Handbook and labs are the product. Edit those first, then keep the site copies, locales, and checks in sync.

## English content (source of truth)

| Edit this | Then |
|-----------|------|
| `docs/GIT_FROM_ZERO.md` | Handbook chapters |
| `labs/<id>/README.md` | Lab instructions |
| `web/data/labs.json` | Lab order, level (`beginner` / `intermediate` / `advanced`), related handbook chapter, and `cheatSheetChapter` |

After English edits:

```bash
./scripts/sync_en_content.sh
```

That copies sources into `web/content/en/` and rewrites handbook lab links to `./lab.html?id=<id>`. Do not edit `web/content/en/` by hand.

If you add or remove a chapter or lab:

1. Add matching keys in `web/locales/en.json` and `web/locales/km.json`
   (`chapters.<id>` or `labs.<id>.title` / `teaser` / `summary`).
2. Update `cheatSheetChapter` and each lab's `chapter` in `web/data/labs.json`.
3. Regenerate the sitemap and offline content manifest:

```bash
python3 scripts/check_site_quality.py --write-sitemap
python3 scripts/check_site_quality.py --write-content-precache
```

Chapter IDs come from handbook headings (`## How to use this guide` and `## N. …`). You do not need to list them in JavaScript.

## Khmer content

Khmer is translated by hand, but structure stays aligned with English via helper scripts:

- `web/content/km/guide.md` — same chapter headings as English (`## 1.`, `## 2.`, … plus the how-to-use heading).
- `web/content/km/labs/<id>.md` — same `##` section count as the English lab (Goal / Setup / Steps / …, translated).
- `web/locales/km.json` — UI strings and titles.

After English adds a chapter or lab (or changes lab section headings):

```bash
./scripts/sync_km_structure.sh
```

That scaffolds missing Khmer files from English structure (Khmer section titles + placeholder body), appends missing chapter stubs to `km/guide.md`, and replaces known English `##` headings in existing lab files. Translate the scaffolded prose before merging.

Check Khmer drift any time:

```bash
./scripts/check_km_content_sync.sh
```

English prose changes (not just file timestamps) trigger stale warnings via
`web/content/km/.prose-baseline.json`. After you review or update Khmer prose,
refresh the baseline:

```bash
python3 scripts/check_km_content_sync.py --write-prose-baseline
```

If a Khmer file is missing, the site falls back to English. CI still requires the Khmer files to exist and to follow English structure.

## Checks

```bash
./scripts/check_content_sync.sh         # English copies match sources
./scripts/check_km_content_sync.sh      # Khmer structure vs English + prose drift
./scripts/check_site_quality.sh         # locales, chapters, Khmer structure, links, SEO
./scripts/run_lab_verifier_fixtures.sh  # build fixture playgrounds + run verify.sh
npm run check                           # all four checks above
npm run test:e2e                        # optional; Playwright smoke tests
npm run dev                             # preview site at http://localhost:4173
```

CI also runs a **secret scan** (Gitleaks) on every push and PR.

CI runs the content checks, lab verifier fixtures, and Playwright on pushes and PRs to `main` and `develop`.

## Lab self-check

Each lab folder has an optional `verify.sh` you can run after finishing the steps in `playground/`:

```bash
cd labs/01-first-repo
./verify.sh
```

Shared helpers live in `scripts/lab_verify_lib.sh`. Verifiers inspect local git state (clean tree, branches, tags, hooks, etc.). Labs that use GitHub (06, 07) print warnings for steps that must be confirmed in the browser.

Representative offline labs also have **fixture builders** under `scripts/lab_fixtures/<id>.sh`. CI builds a completed `playground/` for each, runs `verify.sh`, then deletes the playground (and any `sandbox/` or `review/` folders the fixture created). Covered labs: 01–05, 08–19 except 06–07 (GitHub/browser steps). When you change a covered lab’s steps or verifier, update the matching fixture and re-run:

```bash
./scripts/run_lab_verifier_fixtures.sh --only 01-first-repo
```

Use `--keep` to leave playgrounds in place for debugging. When you add a lab, add `labs/<id>/verify.sh` (and register checks via `check_lab_verifiers()`), and prefer a fixture builder for offline-friendly labs.

## Issues and pull requests

Use the GitHub issue forms for **content** vs **site bugs**. PRs should include the checklist in `.github/pull_request_template.md`.

If you change shell assets (CSS, JS, fonts, icons) that the service worker precaches, bump `CACHE` in `web/sw.js` so browsers pick up the new files. After adding or removing labs, regenerate `web/content-precache.json` (see above). Installable PWA metadata lives in `web/manifest.webmanifest`.

## Site UI

Strings in `web/locales/*.json` cover chrome (nav, buttons, search). Keep `en.json` and `km.json` on the same keys.

Preview:

```bash
cd web
python3 -m http.server 4173
```
