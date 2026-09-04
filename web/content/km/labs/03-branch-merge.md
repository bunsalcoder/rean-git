# មន្ទីរពិសោធន៍ 02 — Branch និង merge

## គោលដៅ

បង្កើត feature branch ធ្វើ commit លើវា ហើយ merge ត្រឡប់ទៅ `main`។

## ការរៀបចំ

```bash
cd labs/03-branch-merge
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Branch lab" > README.md
git add README.md
git commit -m "Initial commit"
```

## ជំហាន

### 1. បង្កើត branch

```bash
git switch -c feature/greeting
echo "Hello from a branch." >> README.md
git add README.md
git commit -m "Add greeting line"
git log --oneline --graph --all
```

### 2. ប្តូរត្រឡប់ ហើយបញ្ជាក់ការបំបែក

```bash
git switch main
cat README.md
```

→ `main` **មិន** គួរមាន greeting នៅឡើយទេ។

### 3. Merge

```bash
git merge feature/greeting
cat README.md
git log --oneline --graph --all
```

### 4. លុប feature branch

```bash
git branch -d feature/greeting
git branch
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកបានឃើញខ្លឹមសារ file ខុសគ្នានៅលើ `main` vs `feature/greeting`
- [ ] Merge បាននាំ greeting ចូល `main`
- [ ] Feature branch ត្រូវបានលុបក្នុងមូលដ្ឋាន

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
