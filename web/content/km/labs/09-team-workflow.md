# មន្ទីរពិសោធន៍ 09 — លំហូរការងារក្រុម

## គោលដៅ

អនុវត្តទម្លាប់ដែលអ្នកនឹងប្រើក្នុងក្រុមពិត៖ ignore junk, branches ខ្លី, sync ជាមួយ `main` និងសរសេរ PR description ច្បាស់។

## ការរៀបចំ

ប្រើ GitHub repo ដូចគ្នាពី មន្ទីរពិសោធន៍ 06 ឬបង្កើត repo ទទេមួយទៀត។

```bash
cd labs/09-team-workflow
mkdir -p playground && cd playground
git clone https://github.com/YOU/rean-git-lab06.git .
# or init + remote as in lab 06
git switch main
git pull
```

## ជំហាន

### 1. បន្ថែម `.gitignore`

```bash
printf ".DS_Store\n.env\n*.log\nscratch/\n" > .gitignore
mkdir -p scratch
echo "secret-demo" > .env
echo "temp" > scratch/tmp.txt
git status
```

→ `.env` និង `scratch/` **មិន** គួរបង្ខាញជា files ដើម្បី commit (ពួកវត្រូវបាន ignore)។ Stage តែ `.gitignore`៖

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

### 3. ក្លែងធ្វើថា “main បានផ្លាស់”

ក្នុង terminal មួយទៀត (ឬ GitHub UI) បន្ថែម commit គ្មានគ្រោះថ្នាក់នៅលើ `main` (កែ README)។ បន្ទាប់មកធ្វើបច្ចុប្បន្នភាព branch របស់អ្នក៖

```bash
git fetch origin
git rebase origin/main
# if conflict: fix, git add, git rebase --continue
git push --force-with-lease
```

(`--force-with-lease` សម្រាប់ feature branch *របស់អ្នក* តែប៉ុណ្ណោះ — កុំ force-push `main` រួម។)

### 4. បើក PR ដែលមាន description ពិត

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

Merge វា បន្ទាប់មកសម្រាតក្នុងមូលដ្ឋាន៖

```bash
git switch main
git pull
git branch -d chore/team-checklist
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] Secrets/scratch files ត្រូវបាន ignore
- [ ] Feature branch ត្រូវបាន rebase (ឬ merge) ទៅលើ `main` ចុងក្រោយមុនពិនិត្យ
- [ ] PR description ពន្យល់ *ហេតុអ្វី* និង រប័បសាកល្បង
- [ ] Branches local ត្រូវបានសម្រាតបន្ទាប់ពី merge

## សម្អាត (ស្រេចចិត្ត)

លុប GitHub repo បោះចោលពេលរួច។
