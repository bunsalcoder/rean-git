# Branching

## Goal

Create branches for different jobs, switch between them, and see that each branch keeps its own commits until you merge (merge comes in the next lab).

## Setup

```bash
cd labs/00-branching
mkdir -p playground && cd playground
git init -b main
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Branching lab" > README.md
git add README.md
git commit -m "Initial commit"
```

## Steps

### 1. Start a feature branch

```bash
git switch -c feat/contact-page
echo "Contact page draft." >> README.md
git add README.md
git commit -m "Draft contact page"
git branch
git log --oneline --graph --all
```

### 2. Leave unfinished work and fix a bug on another branch

```bash
git switch main
git switch -c fix/homepage-crash
echo "Homepage crash fix." >> README.md
git add README.md
git commit -m "Fix homepage crash"
```

### 3. Confirm isolation

```bash
git switch main
cat README.md
git switch feat/contact-page
cat README.md
git switch fix/homepage-crash
cat README.md
```

→ `main` should still look like the initial README. Each topic branch has only its own line.

### 4. Land back on main (do not merge yet)

```bash
git switch main
git branch
git log --oneline --graph --all
```

## Success criteria

- [ ] `feat/contact-page` and `fix/homepage-crash` both exist
- [ ] `main` does not contain either draft line yet
- [ ] You are on `main` with a clean working tree

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
