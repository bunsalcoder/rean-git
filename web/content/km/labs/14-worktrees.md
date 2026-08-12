# មន្ទីរពិសោធន៍ 14 — Worktrees

## គោលដៅ

អនុវត្ត detached HEAD ដោយសុវត្ថិភាព បន្ទាប់មកប្រើ worktree ទីពីរ ដើម្បីធ្វើការលើពីរ branches ពេលតែមួយ។

## ការរៀបចំ

```bash
cd labs/14-worktrees
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "main app" > app.txt
git add app.txt
git commit -m "Start app on main"
git tag -a v0.1.0 -m "Checkpoint"
git switch -c feat/notes
echo "notes wip" > notes.txt
git add notes.txt
git commit -m "Add notes draft"
git switch main
```

## ជំហាន

### 1. Detached HEAD បន្ទាប់មកជួយសង្គ្រោះដោយ branch

```bash
git switch --detach v0.1.0
git status
echo "hotfix line" >> app.txt
git add app.txt
git commit -m "Hotfix while detached"
git switch -c hotfix/from-tag
git log --oneline --decorate -3
git switch main
```

→ Commits ពេល detached ងាយបាត់ លុះត្រាតែអ្នកដាក់ឈ្មោះ branch។

### 2. បន្ថែម worktree ទីពីរសម្រាប់ feature branch

រក្សា edits មិនទាន់រួចនៅលើ `main` បន្ទាប់មកបើក `feat/notes` ក្នុងថតផ្សេង៖

```bash
echo "local scratch on main" >> app.txt
git status
git worktree add ../review feat/notes
cd ../review
git status
cat notes.txt
echo "notes ready" > notes.txt
git add notes.txt
git commit -m "Finish notes draft"
cd ../playground
git worktree list
```

### 3. លុប worktree

```bash
git worktree remove ../review
git worktree list
git branch
git switch feat/notes
git log --oneline -2
git restore app.txt
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នកបានឃើញការព្រមាន detached HEAD ហើយបង្កើត rescue branch
- [ ] `git worktree list` បង្ហាញ checkout ពីរដែលចែក repo តែមួយ
- [ ] អ្នកបានលុប worktree បន្ថែមដោយស្អាត

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground review
```
