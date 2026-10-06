# លំហាត់ 09 — Remote និងសំណើទាញ

## គោលដៅ

Push feature branch ហើយបញ្ចូលបែប pull request។ **bare remote ក្នុងស្រុក** គ្រប់គ្រាន់ — មិនត្រូវការគណនី GitHub។ ប្រើ GitHub ក្រោយ បើចង់ UI PR ពិត។

## ការរៀបចំ

```bash
cd labs/09-remote-pr
mkdir -p playground sandbox
cd playground
git init -b main
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Lab 09" > README.md
git add README.md
git commit -m "Initial commit"
```

បង្កើត bare remote (ជំនួស GitHub) បន្ទាប់មកភ្ជាប់ហើយ push `main`:

```bash
cd ..
git clone --bare playground sandbox/origin.git
cd playground
git remote add origin ../sandbox/origin.git
git remote -v
git push -u origin main
```

## ជំហាន

### 1. Feature branch និង push

```bash
git switch -c feat/hello-pr
echo "Opened from a PR." >> README.md
git add README.md
git commit -m "Add PR practice line"
git push -u origin feat/hello-pr
```

### 2. បញ្ចូលបែប pull request (offline)

នៅលើ GitHub នេះ “Compare & pull request” → Merge។ Offline ប្រើ clone ទីពីរ ដើម្បី merge ចូល `main` ជាមួយ merge commit:

```bash
cd ..
git clone sandbox/origin.git sandbox/merge-work
cd sandbox/merge-work
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git merge --no-ff origin/feat/hello-pr -m "Merge pull request: Practice PR"
git push origin main
cd ../sandbox/origin.git
git branch -D feat/hello-pr
cd ../../playground
```

→ Remote `main` ឥឡូវមាន feature។ Tip នៃ feature branch បាត់ពី bare remote (គំនិតដូចលុប branch បន្ទាប់ពី merge លើ GitHub)។

### 3. Sync main ក្នុងស្រុក

```bash
git switch main
git pull
git branch -d feat/hello-pr
git log --oneline --graph --all
cat README.md
```

→ `main` ក្នុងស្រុកផ្គូផ្គង `origin/main` ហើយមាន `Opened from a PR.`

## ជម្រើសផ្សេង: GitHub (ស្រេចចិត្ត)

បើអ្នកមានគណនី GitHub រួច ហើយចង់ UI PR ពិត:

1. បង្កើត repository **ទទេហ្មី** ឈ្មោះ `rean-git-lab09` (គ្មាន README)។
2. ចង `origin` ទៅវា ជំនួស bare remote (ឬចាប្តើម `playground/` ថ្មី):

```bash
git remote remove origin
git remote add origin https://github.com/YOU/rean-git-lab09.git
git push -u origin main
```

3. Push `feat/hello-pr` ដូចជំហាន 1 បន្ទាប់មកបើក PR ដោយ `gh pr create` ឬ prompt “Compare & pull request” លើ GitHub។
4. Merge លើ GitHub បន្ទាប់រត់ជំហាន 3 (`git pull` លើ `main` ហើយលុប feature branch ក្នុងស្រុក)។

`./verify.sh` នៅតែពិនិត្យស្ថានភាព Git ក្នុងស្រុក។ បញ្ជាក់ PR/merge លើ GitHub ក្នុង browser (ឬ `gh pr view`)។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `origin` ចងទៅ remote (`sandbox/origin.git` ឬ GitHub)
- [ ] Feature branch បាន push បន្ទាប់ merge ចូល `main` (merge offline ឬ PR GitHub)
- [ ] `main` ក្នុងស្រុកផ្គូផ្គង `origin/main` បន្ទាប់ពី `git pull`
- [ ] `feat/hello-pr` ត្រូវបានលុបក្នុងស្រុក

ពីថត lab (មិនមែនក្នុង `playground/`) រត់ `./verify.sh` ដើម្បីប្ងាផ្ទាត់។

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground sandbox
```

បើប្រើ GitHub លុប repo បោះចោលពេលរួច។
