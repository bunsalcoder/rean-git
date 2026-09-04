# Remote ក្នុងស្រុក

## គោលដៅ

អនុវត្ត `remote`, `push`, `fetch` និង `pull` ដោយប្រើ **bare repo ក្នុងស្រុក** ជា `origin` — មិនត្រូវការគណនី GitHub។ មន្ទីរពិសោធន៍ 06 បន្ថែម PR ពិតនៅលើ GitHub បន្ទាប់មក។

## ការរៀបចំ

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

## ជំហាន

### 1. បង្កើត bare remote (ជំនួស GitHub)

```bash
cd ..
git clone --bare playground sandbox/origin.git
cd playground
git remote add origin ../sandbox/origin.git
git remote -v
git push -u origin main
```

### 2. សម្រាប់ម៉ាស៊ីនផ្សេង ដោយ clone ទីពីរ

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

### 3. នាំ commits ទាំងនោះចូល playground របស់អ្នក

```bash
cd ../../playground
git fetch origin
git log --oneline --graph --all
git pull
cat README.md
git status
```

→ `main` ក្នុង playground របស់អ្នកគួរមានបន្ទាត់ពី clone ផ្សេង។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git remote -v` បង្ហាញ `origin` ចង្អុលទៅ `sandbox/origin.git`
- [ ] `README.md` ក្នុង playground មានបន្ទាត់ពី clone ផ្សេង
- [ ] Working tree ស្អាតនៅលើ `main`

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground sandbox
```
