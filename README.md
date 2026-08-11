# rean-git

Hands-on Git from zero to hero — chapters, commands, and labs you run yourself.

A guided path from absolute beginner through advanced Git: everyday workflow, power tools (stash, rebase, bisect), collaboration patterns, and how Git stores history under the hood.

**Live site:** [https://bunsalcoder.github.io/rean-git/](https://bunsalcoder.github.io/rean-git/)

## Open the site locally

```bash
cd web
python3 -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

- **Learn:** [/learn.html](http://localhost:4173/learn.html) — handbook chapters from `web/content/en/guide.md`
- **Labs:** [/labs.html](http://localhost:4173/labs.html) — practice instructions

The site UI supports **English** and **Khmer** (header language switch). Handbook and lab Markdown load from `web/content/km/` when Khmer is selected, with fallback to `web/content/en/`.

## Repo layout

| Path | Purpose |
|------|---------|
| `docs/GIT_FROM_ZERO.md` | Handbook (source of truth) |
| `labs/` | Hands-on Git practice folders |
| `web/` | Static site (GitHub Pages) |
| `web/content/en/` | English Markdown for the site reader |
| `web/content/km/` | Optional Khmer Markdown (falls back to `en`) |
| `web/locales/` | UI string dictionaries (`en.json`, `km.json`) |
| `scripts/` | Sync/check English site copies from `docs/` + `labs/` |

Edit `docs/GIT_FROM_ZERO.md` and the lab `README.md` files, then sync into `web/content/en/`:

```bash
./scripts/sync_en_content.sh    # copy sources → web/content/en/
./scripts/check_content_sync.sh # fail if anything drifted
```

The sync rewrites handbook lab links (`../labs/<id>/` → `./lab.html?id=<id>`) for the site reader. CI runs the check on every push/PR to `main` or `develop`.
