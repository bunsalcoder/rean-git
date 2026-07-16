# rean-git

Hands-on Git from first commit to team workflow — chapters, commands, and labs you run yourself.

A guided path for beginners and juniors who use Git but don’t fully get it yet. Learn to branch, commit, merge, resolve conflicts, open clean PRs, and recover from common mistakes.

## Open the site locally

```bash
cd web
python3 -m http.server 4173
```

Then visit [http://localhost:4173](http://localhost:4173).

- **Learn:** [/learn.html](http://localhost:4173/learn.html) — handbook chapters from `web/content/guide.md`
- **Labs:** [/labs.html](http://localhost:4173/labs.html) — practice instructions

## Repo layout

| Path | Purpose |
|------|---------|
| `docs/GIT_FROM_ZERO.md` | Handbook (source of truth) |
| `labs/` | Hands-on Git practice folders |
| `web/` | Static site (GitHub Pages) |
| `web/content/` | Markdown mirrored for the site reader |

Edit `docs/GIT_FROM_ZERO.md` and the lab `README.md` files, then copy into `web/content/` when you publish updates (same pattern as rean-docker).
