# មន្ទីរពិសោធន៍ 02 — សាខា

## គោលដៅ

បង្កើត branches សម្រាប់ការងារផ្សេងៗ ប្តូររវាងពួកវា ហើយមើលថា branch នីមួយៗរក្សា commits ផ្ទាល់ខ្លួនរហូតដល់អ្នក merge (merge មកនៅមន្ទីរពិសោធន៍បន្ទាប់)។

## ការរៀបចំ

```bash
cd labs/02-branching
mkdir -p playground && cd playground
git init -b main
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Branching lab" > README.md
git add README.md
git commit -m "Initial commit"
```

## ជំហាន

### 1. ចាប់ផ្តើម feature branch

```bash
git switch -c feat/contact-page
echo "Contact page draft." >> README.md
git add README.md
git commit -m "Draft contact page"
git branch
git log --oneline --graph --all
```

### 2. ទុកការងារមិនទាន់រួច ហើយជួសជុល bug លើ branch ផ្សេង

```bash
git switch main
git switch -c fix/homepage-crash
echo "Homepage crash fix." >> README.md
git add README.md
git commit -m "Fix homepage crash"
```

### 3. បញ្ជាក់ភាពដាច់ដោយឡែក

```bash
git switch main
cat README.md
git switch feat/contact-page
cat README.md
git switch fix/homepage-crash
cat README.md
```

→ `main` នៅតែមើលទៅដូច README ដំបូង។ Topic branch នីមួយៗមានតែបន្ទាត់របស់វា។

### 4. ត្រឡប់ទៅ main (កុំ merge នៅឡើយ)

```bash
git switch main
git branch
git log --oneline --graph --all
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] `feat/contact-page` និង `fix/homepage-crash` មានទាំងពីរ
- [ ] `main` មិនទាន់មានបន្ទាត់ draft ណាមួយ
- [ ] អ្នកស្ថិតនៅលើ `main` ជាមួយ working tree ស្អាត

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
