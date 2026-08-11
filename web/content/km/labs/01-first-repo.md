# មន្ទីរពិសោធន៍ 01 — Repo ដំបូង

## គោលដៅ

បង្កើត Git repository ធ្វើ commits ដំបូងរបស់អ្នក ហើយអានប្រវត្តិ។

## ការរៀបចំ

```bash
cd labs/01-first-repo
# If this folder is inside the rean-git repo already, work in a subfolder:
mkdir -p playground && cd playground
```

ប្រើ **ថតថ្មី** ដើម្បីកុំច្រឡំប្រវត្តិអនុវត្តនេះជាមួយ handbook repo។

## ជំហាន

### 1. Initialize

```bash
git init
git status
```

→ អ្នកគួរឃើញ repo ទទេនៅលើ branch `main` (ឬ `master` បើ defaults ខុសគ្នា)។

### 2. បង្កើត file ហើយ commit

```bash
echo "# Lab 01 notes" > README.md
git status
git add README.md
git status
git commit -m "Add README"
git log --oneline
```

### 3. ផ្លាស់ប្តូរ ហើយ commit ម្ដងទៀត

```bash
echo "Practicing my first commits." >> README.md
git diff
git add README.md
git commit -m "Document the practice goal"
git log --oneline
```

### 4. ពិនិត្យ

```bash
git show HEAD
git status
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git status` បង្ហាញ working tree ស្អាត
- [ ] `git log --oneline` បង្ហាញយ៉ាងហោចណាស់ពីរ commits
- [ ] អ្នកអាចពន្យល់ថា `git add` ធ្វើអ្វីមុន commit នីមួយៗ

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
