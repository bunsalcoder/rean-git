# rean-git

Hands-on Git from zero to hero — chapters, commands, and labs you run yourself.

A guided path from absolute beginner through advanced Git: everyday workflow, power tools (stash, rebase, bisect), collaboration patterns, and how Git stores history under the hood.

**Live site:** [https://bunsalcoder.github.io/rean-git/](https://bunsalcoder.github.io/rean-git/)

**Zero-setup practice:** [Open in GitHub Codespaces](https://codespaces.new/bunsalcoder/rean-git?quickstart=1) — the Dev Container installs Git and Git LFS, serves the site on port 4173, and leaves a terminal ready for labs.

## Open the site locally

Requires **Python 3** (local preview + `scripts/*.py` checks), **Bash**, and **Git**. Node.js 20+ is only needed for Playwright (`npm run test:e2e`) and the small unit suite (`npm run test:unit`).

```bash
cd web
python3 -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

- **Learn:** [/learn.html](http://localhost:4173/learn.html) — handbook chapters from `web/content/en/guide.md`
- **Labs:** [/labs.html](http://localhost:4173/labs.html) — practice instructions

The site UI supports **English** and **Khmer** (header language switch). Handbook and lab Markdown load from `web/content/km/` when Khmer is selected, with fallback to `web/content/en/`. Search chapters and labs from the header, or press `/` / `Ctrl+K`.

## Repo layout

| Path | Purpose |
|------|---------|
| `docs/GIT_FROM_ZERO.md` | Handbook (source of truth) |
| `labs/` | Hands-on Git practice folders |
| `web/` | Static site (GitHub Pages) |
| `web/content/en/` | **Generated** English Markdown for the site reader (do not edit by hand) |
| `web/content/km/` | Optional Khmer Markdown (falls back to `en`) |
| `docs/KM_GLOSSARY.md` | Shared Khmer terms for handbook, labs, and UI |
| `web/locales/` | UI string dictionaries (`en.json`, `km.json`) |
| `web/data/labs.json` | Lab catalog (ids + levels) for Home, Labs, and the reader |
| `scripts/` | Sync/check English copies, locale parity, Khmer structure, and link checks |

Edit `docs/GIT_FROM_ZERO.md` and the lab `README.md` files, then sync into `web/content/en/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for Khmer updates, locale keys, and the full check list.

```bash
npm run sync:en                  # copy sources → web/content/en/
npm run sync                     # EN + Khmer structure + site meta
npm run hooks:install            # optional: auto sync:en when sources are committed
npm run check:fast               # content + site quality (skip lab fixtures)
npm run check                    # check:fast + lab verifier fixtures
npm run lint                     # ESLint on site JS + tests
npm run sync:site-meta           # sitemap + content precache + SW cache token
npm run test:unit                # fast Node tests for progress / verify helpers
npm run dev                      # preview at http://localhost:4173
```

The sync rewrites handbook lab links (`../labs/<id>/` → `./lab.html?id=<id>`) for the site reader. CI runs content checks, site quality checks, and Playwright smoke tests on every push/PR to `main` or `develop`.
