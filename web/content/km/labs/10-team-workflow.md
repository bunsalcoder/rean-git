# លំហាត់ 10 — លំហូរការងារក្រុម

## គោលដៅ

អនុវត្តទម្លាប់សម្រាប់ក្រុមពិត: មិនអើពើឯកសារឥតប្រយោជន៍ branches រយៈពេលខ្លី sync ជាមួយ `main` ហើយបញ្ចូលការងារតាម merge បែប PR។ **bare remote ក្នុងស្រុក** គ្រប់គ្រាន់ — GitHub ស្រេចចិត្ត។

## ការរៀបចំ

playground offline ថ្មី (ដំណើរការបានទោះរំលងផ្លូវ GitHub នៃលំហាត់ 09):

```bash
cd labs/10-team-workflow
mkdir -p playground sandbox
cd sandbox
git init -b main seed
cd seed
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Lab 10" > README.md
git add README.md
git commit -m "Initial commit"
cd ..
git clone --bare seed origin.git
rm -rf seed
cd ..
git clone sandbox/origin.git playground
cd playground
git config user.name "Lab Learner"
git config user.email "lab@example.com"
```

បានបញ្ចប់លំហាត់ 09 offline រួច? អាច clone bare remote នោះ (ឬ repo GitHub បោះចោល) ចូល `playground/` នៃលំហាត់នេះ រួច `git pull` លើ `main`។

## ជំហាន

### 1. បន្ថែម `.gitignore`

```bash
printf ".DS_Store\n.env\n*.log\nscratch/\n" > .gitignore
mkdir -p scratch
echo "secret-demo" > .env
echo "temp" > scratch/tmp.txt
git status
```

→ `.env` និង `scratch/` **មិន** គួរបង្ហាញជាឯកសារដើម្បី commit (ត្រូវបាន ignore)។ Stage តែ `.gitignore`:

```bash
git add .gitignore
git commit -m "Add gitignore for local secrets and scratch"
git push
```

### 2. Feature branch រយៈពេលខ្លី

```bash
git switch -c chore/team-checklist
cat > WORKFLOW.md << 'EOF'
# Team checklist

- Branch from latest main
- Keep PRs small
- Never commit .env
EOF
git add WORKFLOW.md
git commit -m "Add lightweight team checklist"
git push -u origin chore/team-checklist
```

### 3. សាកល្បរង “main បានផ្លាស់”

ខណៈ feature នៅបើក នរណាម្នាក់ទីតបញ្ចូលលើ `main`។ Offline ធ្វើនៅ clone ទីពីរ:

```bash
cd ..
git clone sandbox/origin.git sandbox/main-work
cd sandbox/main-work
git config user.name "Teammate"
git config user.email "teammate@example.com"
echo "Main moved while you worked." >> README.md
git add README.md
git commit -m "Document main movement"
git push origin main
cd ../../playground
```

ធ្វើបច្ចុប្បន្នភាព branch របស់អ្នក:

```bash
git fetch origin
git rebase origin/main
# if conflict: fix, git add, git rebase --continue
git push --force-with-lease
```

(`--force-with-lease` សម្រាប់ feature branch *របស់អ្នក* តែប៉ុណ្នះ — កុំ force-push `main` រួម។)

### 4. បញ្ចូលបែប pull request (offline)

```bash
cd ..
git clone sandbox/origin.git sandbox/merge-work
cd sandbox/merge-work
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git switch main
git merge --no-ff origin/chore/team-checklist -m "Merge pull request: Add team checklist"
git push origin main
cd ../sandbox/origin.git
git branch -D chore/team-checklist
cd ../../playground
```

### 5. Sync ហើយសម្បាត

```bash
git switch main
git pull
git branch -d chore/team-checklist
```

ទុកឯកសារដែល ignore ក្នុង tree ដើម្បីអឲ្យ `./verify.sh` បញ្ជាក់ថាវានៅ untracked:

```bash
mkdir -p scratch
echo "secret-demo" > .env
echo "temp" > scratch/tmp.txt
```

## ជម្រើសផ្សេង: GitHub (ស្រេចចិត្ត)

ប្រើ repo បោះចោលពីលំហាត់ 09 (ឬ repo ទទេផ្សេង)។ Clone ចូល `playground/` ធ្វើតាមជំហាន 1–3 ដោយ GitHub ជា `origin` បើក PR ពិតជាមួយការពិពណ៌នា (`gh pr create` ឬ browser) merge រួចបញ្ចប់ជំហាន 5។

ឧទាហរណ៍តួ PR:

```bash
gh pr create --title "Add team checklist" --body "$(cat <<'EOF'
## Summary
- Add WORKFLOW.md with a short team checklist
- Keep secrets out via .gitignore

## Test plan
- [ ] Clone fresh and confirm .env is not tracked
- [ ] Read WORKFLOW.md renders on GitHub

EOF
)"
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] ឯកសារ secrets/scratch ត្រូវបាន ignore
- [ ] Feature branch បាន rebase លើ `main` ចោន់ក្រោយមុន merge
- [ ] ការងារចូល `main` តាម merge បែប PR (offline ឬ GitHub)
- [ ] Feature branch ក្នុងស្រុកត្រូវបានសម្បាត; `main` ផ្គូផ្គង `origin/main`

ពីថត lab (មិនមែនក្នុង `playground/`) រត់ `./verify.sh` ដើម្បីប្ងាផ្ទាត់។

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground sandbox
```

បើប្រើ GitHub លុប repo បោះចោលពេលរួច។
