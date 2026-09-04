# Local remote

## Goal

Practice `remote`, `push`, `fetch`, and `pull` using a **local bare repo** as `origin` — no GitHub account required. Lab 06 adds a real PR on GitHub afterward.

## Setup

```bash
cd labs/07-local-remote
mkdir -p playground sandbox
cd playground
git init -b main
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Local remote lab" > README.md
git add README.md
git commit -m "Initial commit"
```

## Steps

### 1. Create a bare remote (stand-in for GitHub)

```bash
cd ..
git clone --bare playground sandbox/origin.git
cd playground
git remote add origin ../sandbox/origin.git
git remote -v
git push -u origin main
```

### 2. Simulate another machine with a second clone

```bash
cd ..
git clone sandbox/origin.git sandbox/other
cd sandbox/other
git config user.name "Other Learner"
git config user.email "other@example.com"
echo "Hello from the other clone." >> README.md
git add README.md
git commit -m "Add note from other clone"
git push origin main
```

### 3. Bring those commits into your playground

```bash
cd ../../playground
git fetch origin
git log --oneline --graph --all
git pull
cat README.md
git status
```

→ Your playground `main` should include the other clone’s line.

## Success criteria

- [ ] `git remote -v` shows `origin` pointing at `sandbox/origin.git`
- [ ] Playground `README.md` contains the other clone’s line
- [ ] Working tree is clean on `main`

## Cleanup (optional)

```bash
cd ..
rm -rf playground sandbox
```
