# rean-git

Hands-on Git from zero to hero — chapters, commands, and labs you run yourself.

A guided path from absolute beginner through advanced Git: everyday workflow, power tools (stash, rebase, bisect), collaboration patterns, and how Git stores history under the hood.

**Live site:** [https://bunsalcoder.github.io/rean-git/](https://bunsalcoder.github.io/rean-git/)

**Zero-setup practice:** [Open in GitHub Codespaces](https://codespaces.new/bunsalcoder/rean-git?quickstart=1) — the Dev Container installs Git, serves the site on port 4173, and leaves a terminal ready for labs.

## Open the site locally

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
| `web/content/en/` | English Markdown for the site reader |
| `web/content/km/` | Optional Khmer Markdown (falls back to `en`) |
| `web/locales/` | UI string dictionaries (`en.json`, `km.json`) |
| `web/data/labs.json` | Lab catalog (ids + levels) for Home, Labs, and the reader |
| `scripts/` | Sync/check English copies, locale parity, Khmer structure, and link checks |

Edit `docs/GIT_FROM_ZERO.md` and the lab `README.md` files, then sync into `web/content/en/`. See [CONTRIBUTING.md](CONTRIBUTING.md) for Khmer updates, locale keys, and the full check list.

```bash
./scripts/sync_en_content.sh     # copy sources → web/content/en/
./scripts/check_content_sync.sh  # fail if English copies drifted
./scripts/check_site_quality.sh  # locale parity, chapters/labs, internal links
npm run check                    # all content + lab verifier checks
npm run dev                      # preview at http://localhost:4173
python3 scripts/check_site_quality.py --write-sitemap  # regenerate web/sitemap.xml when curriculum changes
```

The sync rewrites handbook lab links (`../labs/<id>/` → `./lab.html?id=<id>`) for the site reader. CI runs content checks, site quality checks, and Playwright smoke tests on every push/PR to `main` or `develop`.
