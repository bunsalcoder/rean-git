# មន្ទីរពិសោធន៍ 19 — Fork និង remote ច្រើន

## គោលដៅ

អនុវត្តលំហូរ fork **ក្នុងស្រុក**៖ clone ច្បាប់ចម្លងរបស់អ្នក (`origin`) បន្ថែមដើមជា `upstream` push feature បន្ទាប់មក fetch ពេល upstream ផ្លាស់ទី។

មិនត្រូវការ GitHub។ Repo ប្រភេទ bare ក្នុង `sandbox/` ធ្វើជំនួស GitHub។

## ការរៀបចំ

```bash
cd labs/19-forks
mkdir -p sandbox playground

# Original project (the repo you do not write to)
git init sandbox/original-work
cd sandbox/original-work
git config user.name "Upstream Maintainer"
git config user.email "upstream@example.com"
git checkout -b main
echo "# Shared project" > README.md
git add README.md
git commit -m "Initial project"
cd ../..

git clone --bare sandbox/original-work sandbox/original.git
cd sandbox/original-work
git remote add origin ../original.git
git push -u origin main
cd ../..

# Fork = a copy of original
git clone --bare sandbox/original.git sandbox/my-fork.git

# Clone YOUR fork — this is the working copy
git clone sandbox/my-fork.git playground
cd playground
git config user.name "Lab Learner"
git config user.email "lab@example.com"
```

## ជំហាន

### 1. បន្ថែម upstream ហើយរាយ remotes

```bash
git remote add upstream ../sandbox/original.git
git remote -v
```

→ `origin` ចង្អុលទៅ fork របស់អ្នក; `upstream` ចង្អុលទៅដើម។

នៅលើ GitHub ឈ្មោះដូចគ្នាត្រូវបានប្រើបន្ទាប់ពីអ្នក fork ក្នុង UI ហើយ `git remote add upstream https://github.com/ORIGINAL/project.git`។

### 2. Feature branch, push ទៅ origin

```bash
git switch -c feat/thanks
echo "Thanks from a contributor." >> README.md
git add README.md
git commit -m "Add contributor thanks"
git push -u origin feat/thanks
git remote show origin
```

អ្នកនឹងបើក pull request ពី `origin/feat/thanks` ចូល `upstream` (មន្ទីរពិសោធន៍ 06 បានអនុវត្ត PR លើ GitHub)។

### 3. Upstream ផ្លាស់ទី

```bash
cd ../sandbox/original-work
echo "Maintainer note." >> README.md
git add README.md
git commit -m "Maintainer update"
git push origin main
cd ../../playground
```

### 4. Fetch upstream ហើយធ្វើបច្ចុប្បន្នភាព main ក្នុងស្រុក

```bash
git fetch upstream
git log --oneline --all --decorate --graph
git switch main
git merge upstream/main
git log --oneline -2
```

(`git rebase upstream/main` គឺជាជម្រើសទូទៅផ្សេងទៀត។) នៅលើ `feat/thanks` បើអ្នកនៅចង់ rebase feature ក្រោយ។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git remote -v` បង្ហាញទាំង `origin` និង `upstream`
- [ ] `feat/thanks` ត្រូវបាន push ទៅ origin
- [ ] `git fetch upstream` នាំមក `Maintainer update`
- [ ] អ្នកអាចពន្យល់ origin = fork របស់អ្នក, upstream = ដើម

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground sandbox
```
