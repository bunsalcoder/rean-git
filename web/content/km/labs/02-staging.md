# លំហាត់ 02 — ការដាក់ stage

## គោលដៅ

Stage តែការផ្លាស់ប្តូរដែលសមនឹងគ្នា សរសេរសារ commit ច្បាស់ និងញែក working tree ពី index។

## ការរៀបចំ

```bash
cd labs/02-staging
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
printf '%s\n' '<h1>Welcome</h1>' > index.html
printf '%s\n' 'personal scratch pad' > notes.md
git add index.html notes.md
git commit -m "Add starter homepage and notes"
```

## ជំហាន

### 1. បង្កើតការកែប្រែបីប្រភេទ

```bash
printf '%s\n' '<h1>Welcome home</h1>' > index.html
printf '%s\n' 'draft dark mode styles' > dark-mode.css
echo "buy milk" >> notes.md
git status
git diff
```

→ ជួសជុល typo ទំព័រដើម (ត្រូវ ship), WIP dark-mode (មិនទាន់រួច), និងកំណត់ចំណាំផ្ទាល់ខ្លួន (មិនពាក់ព័ន្ធ)។

### 2. Stage តែការជួសជុលទំព័រដើម

```bash
git add index.html
git diff --staged
git status
```

→ ការផ្លាស់ប្តូរដែល staged គួរបង្ហាញតែ `index.html`។ ទុក `dark-mode.css` និង `notes.md` ដោយមិនទាន់ stage។

### 3. អនុវត្ត unstage បន្ទាប់មក stage ម្ដងទៀត

```bash
git restore --staged index.html
git status
git add index.html
```

### 4. Commit ជាមួយសារដែលស្វែងរកបាន

```bash
git commit -m "Fix homepage welcome heading typo"
git log --oneline
git show HEAD
```

ចូលចិត្តសារដែលអ្នកនាពេលអនាគតស្វែងរកបាន — មិនមែន `fix`, `update`, ឬ `asdf`។

### 5. ទុក WIP មិនទាន់ commit (ដោយចេតនា)

```bash
git status
git diff
```

→ `dark-mode.css` និង `notes.md` នៅតែ unstaged។ នោះជាចំណុចនៃ staging៖ ship typo ដោយមិន dump អ្វីគ្រប់យ៉ាង។

ស្រេចចិត្ត (interactive)៖ `git add -p` អនុញ្ញាតឱ្យរើស hunks ក្នុងឯកសារមួយ។ បើ terminal មិនឆ្លើយ prompts បាន សូមរំលង — `git add` តាមឯកសារគ្រប់គ្រាន់សម្រាប់លំហាត់នេះ។

## លក្ខខណ្ឌជោគជ័យ

- [ ] Commit ចុងក្រោយផ្លាស់ប្តូរតែ `index.html`
- [ ] សារ commit ពិពណ៌នាការជួសជុលទំព័រដើម (មិនមែន `fix` / `update` មិនច្បាស់)
- [ ] ការកែ `dark-mode.css` និង `notes.md` នៅតែ unstaged
- [ ] អ្នកបានប្រើ `git diff --staged` មុន commit

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
