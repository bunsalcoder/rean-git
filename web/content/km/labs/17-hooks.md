# មន្ទីរពិសោធន៍ 17 — Hooks — ទំពក់ Git

## គោលដៅ

ដំឡើង `pre-commit` hook ក្នុងស្រុកដែលរារាំង pattern អាក្រក់ មើលវាបរាជ័យ បន្ទាប់មក commit ដោយជោគជ័យ។

## ការរៀបចំ

```bash
cd labs/17-hooks
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "hello" > README.md
git add README.md
git commit -m "Start project"
```

## ជំហាន

### 1. បន្ថែម pre-commit hook សាមញ្ញ

```bash
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# Block commits that stage the word SECRET
if git diff --cached | grep -q 'SECRET'; then
  echo "pre-commit: remove SECRET before committing"
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

### 2. បញ្ជាក់ថា hook រារាំង commit អាក្រក់

```bash
echo "token=SECRET-demo" > config.env
git add config.env
git commit -m "Add config" || true
git status
```

→ Commit គួរបរាជ័យ; `config.env` នៅតែ staged។

### 3. កែ file ហើយ commit ដោយស្អាត

```bash
echo "token=demo" > config.env
git add config.env
git commit -m "Add config without secret"
git log --oneline -2
```

### 4. ចងចាំដែនកំណត់

Hooks ក្នុង `.git/hooks/` គឺ **local** — មិនចែករំលែកពេលនរណាម្នាក់ clone repo។ ក្រុមជាធម្មតា commit ថត `scripts/hooks/` (ឬប្រើ Husky / pre-commit) ហើយនៅតែរត់ CI។

## លក្ខខណ្ឌជោគជ័យ

- [ ] Commit ដែលមាន `SECRET` ត្រូវ hook បដិសេធ
- [ ] Commit ស្អាតបានជោគជ័យបន្ទាប់មក
- [ ] អ្នកអាចពន្យល់ថាហេតុអ្វីមិត្តរួមក្រុមមិនទទួល `.git/hooks/` របស់អ្នកដោយស្វ័យប្រវត្តិ

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
