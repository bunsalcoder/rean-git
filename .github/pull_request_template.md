## Summary
-

## Test plan
- [ ] `./scripts/check_content_sync.sh`
- [ ] `./scripts/check_km_content_sync.sh`
- [ ] `./scripts/check_site_quality.sh`
- [ ] `./scripts/run_lab_verifier_fixtures.sh` (when lab steps or verifiers changed)
- [ ] If you added a chapter or lab, ran `python3 scripts/check_site_quality.py --write-sitemap` and `--write-content-precache`
- [ ] If you updated Khmer prose after English edits, ran `python3 scripts/check_km_content_sync.py --write-prose-baseline`
- [ ] Spot-check the site locally (`npm run dev`)
