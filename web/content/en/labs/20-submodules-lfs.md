# Lab 20 — Submodules & Git LFS

## Goal

Pin a nested Git repo with a submodule, then (if `git-lfs` is installed) store a large-file pointer with Git LFS.

## Prerequisites

- Submodule steps: Git only
- LFS step: [Git LFS](https://git-lfs.com) (`git lfs version`). Skip that step if it is not installed — `verify.sh` will warn instead of failing.

## Setup

```bash
cd labs/20-submodules-lfs
mkdir -p sandbox/design-lib playground

# A small “design system” repo to nest later
cd sandbox/design-lib
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "button { color: blue; }" > tokens.css
git add tokens.css
git commit -m "Add design tokens"
cd ../..

# Parent app
cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "# App" > README.md
git add README.md
git commit -m "Start app"
```

## Steps

### 1. Add the library as a submodule

```bash
git -c protocol.file.allow=always submodule add ../sandbox/design-lib libs/design
git status
cat .gitmodules
git commit -m "Add design-lib submodule"
```

Git blocks the `file` protocol for submodules by default (a safety setting). The `-c protocol.file.allow=always` flag is only for this **local** sandbox. On GitHub you would use an `https://` URL and would not need the flag.

→ Git records a **gitlink** (a commit SHA in the parent tree) plus `.gitmodules` with the URL and path.

### 2. Change the library, then bump the pin

```bash
git -C libs/design config user.name "Lab Learner"
git -C libs/design config user.email "lab@example.com"
cd libs/design
echo "button { color: navy; }" > tokens.css
git add tokens.css
git commit -m "Darken tokens"
cd ../..
git add libs/design
git commit -m "Bump design-lib"
git submodule status
```

Teammates who clone the parent still need:

```bash
git submodule update --init --recursive
```

(or `git clone --recurse-submodules`). Prefer a package manager when you only need published files; use a submodule when you truly need a nested Git project.

### 3. Track a large asset with LFS (optional)

Skip this section if `git lfs version` fails.

```bash
git lfs install --local
git lfs track "*.bin"
git add .gitattributes
printf 'fake-psd-bytes' > hero.bin
git add hero.bin
git commit -m "Track a large asset with LFS"
git lfs ls-files
```

→ `.gitattributes` lists the LFS filter. Git stores a **pointer**; the bytes live on an LFS server (or local LFS storage in this lab).

### 4. Remember the trade-off

Submodules pin a commit. LFS keeps huge binaries out of normal Git objects. Neither replaces `npm` / `pip` for everyday libraries.

## Success criteria

- [ ] `.gitmodules` lists `libs/design`
- [ ] The parent has a commit that bumps the submodule
- [ ] If Git LFS is installed: `*.bin` is tracked and `hero.bin` is committed
- [ ] You can explain clone `--recurse-submodules` vs `git lfs install`

## Cleanup (optional)

```bash
cd ..
rm -rf playground sandbox
```
