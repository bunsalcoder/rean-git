# មន្ទីរពិសោធន៍ 06 — Remote និង PR

## គោលដៅ

Push branch ទៅ GitHub ហើយបើក pull request។

## លក្ខខណ្ឌមុន

- គណនី GitHub
- Auth ដំណើរការ (`gh auth login` **ឬ** HTTPS/SSH បានរៀបចំរួច)
- ស្រេចចិត្តប៉ុន្តែល្អ៖ [GitHub CLI](https://cli.github.com/) (`gh`)

## ជំហាន

### 1. Fork ឬប្រើ repo បោះចោល

ងាយបំផុត៖ បង្កើត repository **ទទេថ្មី** នៅលើ GitHub ឈ្មោះ `rean-git-lab06` (គ្មាន README)។

### 2. គម្រោង local

```bash
cd labs/08-remote-pr
mkdir -p playground && cd playground
git init
git config user.name "Your Name"
git config user.email "you@example.com"
echo "# Lab 06" > README.md
git add README.md
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOU/rean-git-lab06.git
git push -u origin main
```

ជំនួស `YOU` ដោយ username GitHub របស់អ្នក (ឬប្រើ SSH remote URL)។

### 3. Feature branch ហើយ push

```bash
git switch -c feat/hello-pr
echo "Opened from a PR." >> README.md
git add README.md
git commit -m "Add PR practice line"
git push -u origin feat/hello-pr
```

### 4. បើក pull request

**ជាមួយ GitHub CLI:**

```bash
gh pr create --title "Practice PR" --body "Lab 06 for rean-git."
```

**ឬក្នុង browser:** បើក repo → ប្រអប់ប្រៀបធៀប & បើក PR សម្រាប់ `feat/hello-pr` → បង្កើតវា។

### 5. Merge ហើយ sync

Merge នៅលើ GitHub (ឬ `gh pr merge`) បន្ទាប់មក៖

```bash
git switch main
git pull
git branch -d feat/hello-pr
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] `main` មាននៅលើ GitHub
- [ ] Feature branch ត្រូវបាន push
- [ ] PR ត្រូវបានបើក (ហើយជាឧត្តមគតិបាន merge)
- [ ] `main` local ត្រូវគ្នានឹង remote បន្ទាប់ពី `git pull`

## សម្អាត (ស្រេចចិត្ត)

លុប GitHub repo បោះចោលពេលរួច។
