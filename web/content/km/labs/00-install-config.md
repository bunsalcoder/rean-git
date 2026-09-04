# មន្ទីរពិសោធន៍ 00 — ដំឡើង និងកំណត់រចនាសម្ព័ន្ធ

## គោលដៅ

បញ្ជាក់ថា Git ដំណើរការលើម៉ាស៊ីនអ្នក ហើយកំណត់អត្តសញ្ញាណសម្រាប់ repo អនុវត្តនេះ (config ក្នុងស្រុកតែប៉ុណ្ណោះ — ការកំណត់ global របស់អ្នកនៅដដែល)។

## ការរៀបចំ

```bash
cd labs/00-install-config
mkdir -p playground && cd playground
```

## ជំហាន

### 1. ពិនិត្យថា Git បានដំឡើង

```bash
git --version
```

→ អ្នកគួរឃើញលេខកំណែ។ បើពាក្យបញ្ជាបរាជ័យ សូមដំឡើង Git ជាមុន (មើលជំពូក 3 ក្នុង handbook)។

### 2. Initialize repo អនុវត្ត

```bash
git init -b main
git status
```

### 3. កំណត់អត្តសញ្ញាណសម្រាប់ repo នេះតែប៉ុណ្ណោះ

ប្រើ config **ក្នុងស្រុក** (គ្មាន `--global`) ដើម្បីកុំផ្លាស់ប្តូរម៉ាស៊ីនទាំងមូល៖

```bash
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git config init.defaultBranch main
git config --local --list
```

→ អ្នកគួរឃើញ `user.name`, `user.email` និង `init.defaultBranch` សម្រាប់ repo នេះ។

### 4. បញ្ជាក់ថា commits ដំណើរការ

```bash
echo "# Install lab" > README.md
git add README.md
git commit -m "First configured commit"
git log --oneline
git status
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git --version` បង្ហាញកំណែ
- [ ] Playground នេះមាន `user.name` និង `user.email` ក្នុងស្រុក
- [ ] `git log --oneline` បង្ហាញ commit មួយ ហើយ working tree ស្អាត

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
