# មន្ទីរពិសោធន៍ 15 — ពិនិត្យប្រវត្តិ

## គោលដៅ

ប្រើ `blame`, pickaxe search និង branch ranges ដើម្បីឆ្លើយ “អ្នកណាផ្លាស់ប្តូរនេះ?” និង “អ្វីបានចុះនៅលើ feature?”

## ការរៀបចំ

```bash
cd labs/15-inspect-history
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main

mkdir -p auth
printf 'def login():\n    return "ok"\n' > auth/login.py
git add auth/login.py
git commit -m "Add login helper"

printf 'def login():\n    return "redirect"\n' > auth/login.py
git add auth/login.py
git commit -m "Change login to redirect"

git switch -c feat/banner
echo "banner" > banner.txt
git add banner.txt
git commit -m "Add homepage banner"
echo "banner v2" > banner.txt
git add banner.txt
git commit -m "Tweak banner copy"
git switch main
```

## ជំហាន

### 1. Blame file (និងចន្លោះបន្ទាត់)

```bash
git blame auth/login.py
git blame -L 1,2 auth/login.py
```

→ បន្ទាត់នីមួយៗបង្ហាញ commit និង author ដែលប៉ះចុងក្រោយ។

### 2. Pickaxe និង path filters

```bash
git log -S "redirect" -p --oneline
git log -- auth/login.py
git show HEAD:auth/login.py
```

### 3. ប្រៀបធៀប branch ranges

```bash
git log --oneline main..feat/banner
git diff --stat main...feat/banner
git shortlog -sn --all
```

→ `main..feat/banner` គឺ commits នៅលើ feature ដែល `main` មិនមាន។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git blame` បង្ហាញ commit ដែលជាម្ចាស់បន្ទាត់ redirect
- [ ] `git log -S "redirect"` រកឃើញ commit ផ្លាស់ប្តូរ
- [ ] អ្នករាយតែ feature commits ដោយ `main..feat/banner`

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
