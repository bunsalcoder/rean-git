# មន្ទីរពិសោធន៍ 06 — ត្រឡប់កំហុស

## គោលដៅ

អនុវត្តការត្រឡប់វិញដោយសុវត្ថិភាព៖ restore, unstage, amend, soft reset និង revert។

## ការរៀបចំ

```bash
cd labs/06-undo
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "v1" > file.txt
git add file.txt
git commit -m "Add file"
```

## ជំហាន

### 1. បោះបង់ការកែដែលមិនទាន់ stage

```bash
echo "oops" >> file.txt
git status
git restore file.txt
cat file.txt
```

→ ត្រឡប់ទៅ `v1`។

### 2. Unstage

```bash
echo "v2" >> file.txt
git add file.txt
git restore --staged file.txt
git status
```

→ ការផ្លាស់ប្តូរនៅក្នុង file នៅឡើយ ប៉ុន្តែមិនទាន់ staged។

Stage ហើយ commit ពិត៖

```bash
git add file.txt
git commit -m "Bump to v2"
```

### 3. Amend សារ (local តែប៉ុណ្ណោះ)

```bash
git commit --amend -m "Bump file to v2"
git log --oneline
```

### 4. Soft reset commit ចុងក្រោយ

```bash
git reset --soft HEAD~1
git status
git commit -m "Bump file to v2 (recommitted)"
```

### 5. Revert (សុវត្ថិភាពសម្រាប់ប្រវត្តិរួម)

```bash
git revert HEAD --no-edit
cat file.txt
git log --oneline
```

→ Commit ថ្មីមួយត្រឡប់ការផ្លាស់ប្តូរមុន។ ប្រវត្តិនៅតែមាន។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git restore` បានបោះបង់ការកែអាក្រក់
- [ ] អ្នក unstage ដោយមិនបាត់ការងារ
- [ ] អ្នក amend សារ commit local
- [ ] អ្នកប្រើ `revert` ហើយនៅតែមានរឿង log ស្អាត

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
