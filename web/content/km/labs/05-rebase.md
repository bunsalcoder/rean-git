# មន្ទីរពិសោធន៍ 05 — Rebase (ប្រើដោយប្រុងប្រយ័ត្ន)

## គោលដៅ

Rebase feature branch ទៅលើ `main` ដែលបានធ្វើបច្ចុប្បន្នភាព ហើយមើលប្រវត្តិលីនេអ៊ែរ។

## ការរៀបចំ

```bash
cd labs/05-rebase
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "base" > app.txt
git add app.txt
git commit -m "Base commit"
```

## ជំហាន

### 1. ការងារ feature

```bash
git switch -c feature/tweak
echo "feature change" >> app.txt
git add app.txt
git commit -m "Feature tweak"
```

### 2. Commit ថ្មីនៅលើ main (ក្នុងពេលដំណាលគ្នា)

```bash
git switch main
echo "main update" >> app.txt
git add app.txt
git commit -m "Main update"
git log --oneline --graph --all
```

### 3. Rebase feature

```bash
git switch feature/tweak
git rebase main
```

បើ Git រាយការណ៍ conflict៖

1. កែ `app.txt` (រួមបញ្ចូលការផ្លាស់ប្តូរទាំងពីរយ៉ាងសមរម្យ)
2. `git add app.txt`
3. `git rebase --continue`

ដើម្បីបោះបង់៖ `git rebase --abort`។

### 4. ប្រៀបធៀបប្រវត្តិ

```bash
git log --oneline --graph --all
```

→ ចូលចិត្តបន្ទាត់ត្រង់ដែល feature commit របស់អ្នកស្ថិត *ក្រោយ* `Main update`។

### 5. Fast-forward main (ស្រេចចិត្ត)

```bash
git switch main
git merge feature/tweak
git log --oneline --graph --all
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] Rebase បានបញ្ចប់ (មាន ឬគ្មានការកែ conflict)
- [ ] Graph មើលទៅលីនេអ៊ែរ បើប្រៀបនឹងលំហូរ merge commit
- [ ] អ្នកអាចនិយាយបានថាពេលណា *មិន* គួរ rebase (shared published commits)

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
