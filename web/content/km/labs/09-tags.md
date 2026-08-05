# Lab 09 — Tags

## គោលដៅ

បង្កើត annotated tags សម្រាប់ការចេញផ្សាយ ហើយពិនិត្យវា។

## Setup

```bash
cd labs/09-tags
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "app v1" > app.txt
git add app.txt
git commit -m "App v1 content"
```

## ជំហាន

### 1. Annotated release tag

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git tag -l
git show v1.0.0
```

### 2. Commit មួយទៀត បន្ទាប់មក patch tag

```bash
echo "app v1.0.1" > app.txt
git add app.txt
git commit -m "Patch content"
git tag -a v1.0.1 -m "Release v1.0.1"
git log --oneline --decorate
```

### 3. Check out tag (detached HEAD)

```bash
git switch --detach v1.0.0
cat app.txt
git switch main
```

→ Detached HEAD ធម្មតានៅលើ tag។ ប្តូរត្រឡប់ទៅ branch ពេលរួច។

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកបង្កើត annotated tags ជាមួយសារ
- [ ] `git show` បង្ខាញ tag metadata
- [ ] អ្នកបានទៅមើល tag និង ត្រឡប់ទៅ `main`

## Cleanup (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
