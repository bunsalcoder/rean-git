# Lab 13 — ផ្នែកខាងក្នុង

## គោលដៅ

មើលខាងក្រោម៖ commits, trees, blobs និង refs — គ្រប់គ្រាន់ដើម្បីធ្វើឲ្យ Git ច្បាស់។

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

## ជំហាន

### 1. Resolve HEAD

```bash
git rev-parse HEAD
cat .git/HEAD
cat .git/refs/heads/main
```

→ `HEAD` ចង្គុលទៅ branch ref។ branch file ផ្ទុក tip SHA។

### 2. ពិនិត្យ commit object

```bash
git cat-file -t HEAD
git cat-file -p HEAD
```

កត់សម្គាល់បន្ទាត់ `tree`។

### 3. ដើរពី tree → blob

```bash
TREE=$(git rev-parse HEAD^{tree})
git cat-file -p "$TREE"
BLOB=$(git rev-parse HEAD:hello.txt)
git cat-file -p "$BLOB"
```

→ Tree រាយ `hello.txt` → blob។ blob គីខ្លីមសារ file។

### 4. មើល refs

```bash
git show-ref
ls .git/objects
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកអាចពន្យល់ HEAD → branch → commit → tree → blob
- [ ] `git cat-file -p` បង្ខាញខ្លីមសារ commit, tree និង blob
- [ ] អ្នកដឹងថា branch គី pointer file ដែលផ្លាស់ទីបាននៅក្រោម `.git/refs`

## Cleanup (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
