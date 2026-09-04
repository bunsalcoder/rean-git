# មន្ទីរពិសោធន៍ 03 — Conflict

## គោលដៅ

បង្កើត merge conflict ដោយចេតនា ដោះស្រាយវា ហើយបញ្ចប់ merge។

## ការរៀបចំ

```bash
cd labs/04-conflict
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
printf "line one\nshared line\nline three\n" > notes.txt
git add notes.txt
git commit -m "Add notes"
```

## ជំហាន

### 1. ផ្លាស់ប្តូរបន្ទាត់ដូចគ្នានៅលើ main

```bash
git switch -c feature/alt
# edit shared line:
printf "line one\nshared line from feature\nline three\n" > notes.txt
git add notes.txt
git commit -m "Change shared line on feature"
```

### 2. ផ្លាស់ប្តូរវាផ្សេងគ្នានៅលើ main

```bash
git switch main
printf "line one\nshared line from main\nline three\n" > notes.txt
git add notes.txt
git commit -m "Change shared line on main"
```

### 3. Merge ហើយជួប conflict

```bash
git merge feature/alt
cat notes.txt
git status
```

→ ស្វែងរក `<<<<<<<`, `=======`, `>>>>>>>`។

### 4. ដោះស្រាយ

កែ `notes.txt` ទៅកំណែចុងក្រោយដែលអ្នកចង់បាន ឧទាហរណ៍៖

```text
line one
shared line resolved
line three
```

លុប conflict markers ទាំងអស់។ បន្ទាប់មក៖

```bash
git add notes.txt
git commit -m "Merge feature/alt; resolve shared line"
git log --oneline --graph --all
```

### អនុវត្ត abort (ស្រេចចិត្ត)

បើអ្នកចង់ចេញពេលមាន conflict៖

```bash
git merge --abort
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកបានបង្កើត conflict (Git បដិសេធមិន auto-merge)
- [ ] Markers បាត់ហើយ file អានបានត្រឹមត្រូវ
- [ ] Merge បានបញ្ចប់ដោយ `git status` ស្អាត

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
