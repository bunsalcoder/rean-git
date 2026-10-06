# លំហាត់ 07 — ត្រឡប់កំហុស

## គោលដៅ

អនុវត្តការត្រឡប់វិញដោយសុវត្ថិភាព៖ restore, unstage, amend, soft reset, revert និងស្តារ commit ដែល «បាត់» ដោយ reflog។

## ការរៀបចំ

```bash
cd labs/07-undo
mkdir -p playground && cd playground
git init -b main
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

### 2. ដកចេញពី staging (Unstage)

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

### 6. បាត់ commit ដោយចេតនា — ស្តារដោយ reflog

```bash
echo "keeper" > keep.txt
git add keep.txt
git commit -m "Keep this commit"

# សម្រាប់លំហាត់តែប៉ុណ្ណោះ — គ្រោះថ្នាក់ក្នុងជីវិតពិត ប្រសិនបើអ្នកនៅតែត្រូវការ tip
git reset --hard HEAD~1
git log --oneline
```

→ `keep.txt` បាត់ពី `main`។ Commit មិនទាន់លុបទាំងស្រុងនៅឡើយ។

```bash
git reflog
# រកបន្ទាត់សម្រាប់ "Keep this commit" (ជាញឹកញាប់ HEAD@{1}) រួចប្រើ hash របស់វា
git switch -c recover HEAD@{1}
cat keep.txt
git log --oneline
```

→ អ្នកនៅលើ `recover` ជាមួយ `keep.txt` ត្រឡប់មកវិញ។ `main` នៅតែបញ្ចប់នៅ revert។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git restore` បានបោះបង់ការកែអាក្រក់
- [ ] អ្នក unstage ដោយមិនបាត់ការងារ
- [ ] អ្នក amend សារ commit local
- [ ] អ្នកប្រើ `revert` ហើយនៅតែមានរឿង log ស្អាត
- [ ] អ្នកស្តារ commit ដែល reset រួចនៅលើ branch `recover` តាម `reflog`

ពីថត lab (មិនមែនក្នុង `playground/`) រត់ `./verify.sh` ដើម្បីផ្ទៀងផ្ទាត់។

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
