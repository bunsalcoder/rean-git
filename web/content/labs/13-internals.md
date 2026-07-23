# Lab 13 — Internals

## Goal

Peek under the hood: commits, trees, blobs, and refs — enough to demystify Git.

## Setup

```bash
cd labs/13-internals
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "hello" > hello.txt
git add hello.txt
git commit -m "Add hello"
```

## Steps

### 1. Resolve HEAD

```bash
git rev-parse HEAD
cat .git/HEAD
cat .git/refs/heads/main
```

→ `HEAD` points at a branch ref; the branch file holds the tip SHA.

### 2. Inspect the commit object

```bash
git cat-file -t HEAD
git cat-file -p HEAD
```

Note the `tree` line.

### 3. Walk tree → blob

```bash
TREE=$(git rev-parse HEAD^{tree})
git cat-file -p "$TREE"
BLOB=$(git rev-parse HEAD:hello.txt)
git cat-file -p "$BLOB"
```

→ Tree lists `hello.txt` → blob; blob is the file contents.

### 4. See refs

```bash
git show-ref
ls .git/objects
```

## Success criteria

- [ ] You can explain HEAD → branch → commit → tree → blob
- [ ] `git cat-file -p` showed commit, tree, and blob contents
- [ ] You know a branch is a movable pointer file under `.git/refs`

## Cleanup (optional)

```bash
cd ..
rm -rf playground
```
