# មន្ទីរពិសោធន៍ 08 — Stash

## គោលដៅ

ទុកការងារមិនទាន់រួច ប្តូរបរិបទ បន្ទាប់មកនាំការផ្លាស់ប្តូរត្រឡប់មកវិញ។

## ការរៀបចំ

```bash
cd labs/10-stash
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "v1" > notes.txt
git add notes.txt
git commit -m "Add notes"
```

## ជំហាន

### 1. បង្កើត WIP រញ៉េរញ៉ៃ

```bash
echo "draft idea" >> notes.txt
echo "scratch" > idea.md
git status
```

### 2. Stash រួមទាំង untracked files

```bash
git stash push -u -m "wip notes and idea"
git status
git stash list
```

→ Working tree គួរស្គាត។ stash list បង្ខាញ entry របស់អ្នក។

### 3. ធ្វើ “hotfix” លើ tree ស្គាត

```bash
echo "hotfix line" >> notes.txt
git add notes.txt
git commit -m "Hotfix typo"
```

### 4. ស្តារ stash

```bash
git stash pop
git status
cat notes.txt
```

→ ការកែសេចក្តីព្រាងរបស់អ្នកត្រឡប់មក។ ដោះស្រាយការជាន់គ្នាបើ Git រាយការណ៍ conflict បន្ទាប់មកបញ្ចប់ ឬ stash ម្តាងទៀត។

## លក្ខខណ្ឌជោគជ័យ

- [ ] អ្នក stash tracked + untracked changes ជាមួយសារ
- [ ] អ្នក commit អ្វីផ្សេងនៅលើ tree ស្គាត
- [ ] `git stash pop` ស្តារ WIP របស់អ្នក

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
