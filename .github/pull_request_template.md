## Summary
-

## Test plan
- [ ] `npm run check:fast` (or individual sync/quality scripts)
- [ ] `npm run lint` (when JS/tests changed)
- [ ] `./scripts/run_lab_verifier_fixtures.sh` (when lab steps or verifiers changed)
- [ ] If you edited English handbook/lab sources, ran `npm run sync:en` (or `npm run hooks:install` for auto-sync)
- [ ] If you added a chapter or lab, ran `npm run sync` (or `npm run sync:site-meta`)
- [ ] If you changed precached shell assets, ran `npm run sync:site-meta` (or `python3 scripts/check_site_quality.py --write-sw-cache`)
- [ ] If English handbook/lab prose changed, updated Khmer (see `docs/KM_GLOSSARY.md`) and ran `python3 scripts/check_km_content_sync.py --write-prose-baseline`
- [ ] Spot-check the site locally (`npm run dev`)
