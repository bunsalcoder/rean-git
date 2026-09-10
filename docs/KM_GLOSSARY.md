# Khmer terminology glossary

Shared terms for handbook, labs, and UI (`web/locales/km.json`). Prefer these over literal machine-translation defaults.

Keep Git command names, branch names, and file paths in English inside code blocks.

| English | Khmer | Notes |
| --- | --- | --- |
| lab | លំហាត់ | Not មន្ទីរពិសោធន៍ (science lab) |
| chapter | ជំពូក | |
| handbook / guide | សៀវភៅណែនាំ | |
| repository / repo | repo | Keep short; say “Git repo” when needed |
| commit (noun/verb) | commit | Keep English |
| branch | branch / សាខា | Prefer `branch` near commands; សាខា OK in titles |
| merge | merge / បញ្ចូល | Prefer `merge` near commands |
| rebase | rebase | Keep English |
| conflict | conflict / ទំនាស់ | Prefer `conflict` near markers |
| remote | remote | Keep English |
| pull request / PR | pull request / PR | |
| stash | stash | Keep English |
| working tree | working tree | Keep English |
| playground | playground | Practice folder under each lab |
| local (config) | ក្នុងស្រុក | Opposite of `--global` |
| global (config) | global | Keep English when naming the flag |
| clean (status) | ស្អាត | For a clean working tree |
| verify | ផ្ទៀងផ្ទាត់ | For `./verify.sh` copy |

## Lab titles

Format: `# លំហាត់ NN — <short title>`

Example: `# លំហាត់ 01 — repo ដំបូង`

## After English prose changes

1. Update matching Khmer files using this glossary.
2. Refresh the drift baseline:

```bash
python3 scripts/check_km_content_sync.py --write-prose-baseline
```

CI fails if English prose changed since the last Khmer review.
