# Git ពីសូន្យទៅជំនាញ

> **គម្រោង:** `rean-git`  
> **ទស្សនិកជន:** អ្នកចាប់ផ្តើមពេញលេញរហូតដល់កម្រិតខ្ពស់ — បង្កើតជំនាញពិត មិនមែនជំនឿខុស  
> **រចនាប័ទ្ម:** បញ្ហាពិតមុន បន្ទាប់មកពាក្យបញ្ជាដែលដោះស្រាយ — រួមទាំងមន្ទីរពិសោធន៍ក្នុង repo នេះ

---

## របៀបប្រើមគ្គុទ្ទេសក៍នេះ

1. អានជំពូកនីមួយៗតាមលំដាប់ (ពួកវាស្ថាបនាលើគ្នាទៅវិញទៅមក)។
2. វាយពាក្យបញ្ជាដោយខ្លួនអ្នក — កុំអានតែប៉ុណ្ណោះ។
3. បន្ទាប់ពីជំពូកស្នូល បំពេញមន្ទីរពិសោធន៍ដែលត្រូវគ្នាក្រោម `labs/`។
4. រក្សា terminal ឲ្យបើកនៅឫសគម្រោងនេះ (កន្លែងដែលអ្នក clone repo):

```bash
cd path/to/rean-git
```

**រូបរាងផ្លូវ**

| ដំណាក់កាល | ជំពូក | គោលដៅ |
|-------|----------|------|
| មូលដ្ឋាន | 1–5 | គិតជា commits |
| ការសហការ | 6–13 | Branch, merge, ដឹកជញ្ជូនជាមួយក្រុម |
| ឧបករណ៍ខ្លាំង | 14–20 | Stash, tags, rewrite, debug ប្រវត្តិ |
| អាជីព | 21–24 | Hooks, signing, forks, ទ្រព្យធំៗ |
| ជំនាញខ្ពស់ | 25–27 | ផ្នែកខាងក្នុង, តារាងសង្ខេប, បញ្ជីពិនិត្យ |

**អនុសញ្ញាដែលប្រើនៅទីនេះ**

| និមិត្តសញ្ញា | អត្ថន័យ |
|--------|---------|
| `$` | រត់ក្នុង host terminal របស់អ្នក |
| `#` | មតិយោបល់ / ការពន្យល់ |
| `→` | គំនិត / លទ្ធផលដែលរំពឹងទុក |

**មុនពេលចាប់ផ្តើម**

- Git បានដំឡើង (`git --version`)
- កម្មវិធីកែអត្ថបទដែលអ្នកស្គាល់
- គណនី [GitHub](https://github.com) ឥតគិតថ្លៃ (ត្រូវការពី remotes ទៅមុខ)

---

## មាតិកា

1. [Git ដោះស្រាយបញ្ហាអ្វី?](#1-what-problem-does-git-solve)
2. [គំរូគំនិតស្នូល](#2-core-mental-model)
3. [ដំឡើង និងកំណត់រចនាសម្ព័ន្ធដំបូង](#3-install--first-config)
4. [repository ដំបូងរបស់អ្នក](#4-your-first-repository)
5. [Staging, commits និងប្រវត្តិ](#5-staging-commits-and-history)
6. [Branching](#6-branching)
7. [Merging](#7-merging)
8. [Conflicts](#8-conflicts)
9. [Rebase (ប្រើដោយប្រុងប្រយ័ត្ន)](#9-rebase-carefully)
10. [ត្រឡប់កំហុស](#10-undoing-mistakes)
11. [Remotes និង GitHub](#11-remotes--github)
12. [Pull requests](#12-pull-requests)
13. [លំហូរការងារក្រុម](#13-team-workflows)
14. [Stash](#14-stash)
15. [Tags និងការចេញផ្សាយ](#15-tags--releases)
16. [Cherry-pick](#16-cherry-pick)
17. [Interactive rebase](#17-interactive-rebase)
18. [Bisect](#18-bisect)
19. [Worktrees និង detached HEAD](#19-worktrees--detached-head)
20. [ពិនិត្យប្រវត្តិ](#20-inspecting-history)
21. [Hooks](#21-hooks)
22. [ចុះហត្ថលេខា commits](#22-signing-commits)
23. [Forks និង remotes ច្រើន](#23-forks--multiple-remotes)
24. [Submodules និង Git LFS](#24-submodules--git-lfs)
25. [របៀបដែល Git ដំណើរការខាងក្នុង](#25-how-git-works-inside)
26. [តារាងសង្ខេប](#26-cheat-sheet)
27. [បញ្ជីផ្លូវសិក្សា](#27-learning-path-checklist)

---

## 1. Git ដោះស្រាយបញ្ហាអ្វី?

### បញ្ហាពិភពពិត

អ្នកកំពុងបង្កើតគេហទំព័រគម្រោងសាលាជាមួយមិត្ត។

- អ្នកបំបែកទំព័រដើម ហើយចង់បានកំណែម្សិលមិញវិញ
- មិត្តអ្នកក៏កែ `index.html` ដែរ — zip របស់អ្នកណាជា “final”?
- ការដាក់ចេញថ្ងៃសុក្របរាជ័យ — តើអ្វីបានផ្លាស់ប្តូរចាប់ពីថ្ងៃច័ន្ទ?

បើគ្មាន Git មនុស្សបង្កើត `project-v2-FINAL-really.zip`។ នោះមិនអាចពង្រីកបានទេ។

### ចម្លើយរបស់ Git (សាមញ្ញ)

**Git គឺជាប្រព័ន្ធគ្រប់គ្រងកំណែ។** វារក្សាទុករូបថតនៃគម្រោងអ្នក ដើម្បីឲ្យអ្នកអាច:

- ត្រឡប់ក្រោយពេលវេលា
- ធ្វើការលើគំនិតស្របគ្នា (branches)
- បញ្ចូលការងារពីមនុស្សច្រើនជាងម្នាក់
- ត្រឡប់កំហុសដោយមិនត្រូវទាយថា zip ណាត្រូវបើក

### Git vs GitHub (កុំច្រឡំគ្នា)

| | អ្វីវាជា |
|--|------------|
| **Git** | ឧបករណ៍នៅលើកុំព្យូទ័រអ្នកដែលតាមដានប្រវត្តិ |
| **GitHub** | គេហទំព័រដែល *បង្ហោះ* Git repos, PRs និងការពិនិត្យ |

Git ដំណើរការដោយគ្មានអ៊ីនធឺណិត។ GitHub គឺកន្លែងដែលអ្នកចែករំលែក និងសហការ។

### តំណមន្ទីរពិសោធន៍

បន្ទាប់ពីជំពូក 3–5 → [មន្ទីរពិសោធន៍ 01 — Repo ដំបូង](./lab.html?id=01-first-repo)

---

## 2. គំរូគំនិតស្នូល

### រូបភាពពិភពពិត

ស្រមៃថាកំពុងវេចឥវ៉ាន់ទៅដំណើរ:

1. សម្លៀកបំពាក់នៅលើគ្រែ = ឯកសារដែលអ្នកកែ (**working tree**)
2. វ៉ាលីដែលអ្នកកំពុងដាក់ = អ្វីដែលអ្នកជ្រើសសម្រាប់ដំណើរ *នេះ* (**staging**)
3. វ៉ាលីដែលបានបិទជិតមានស្លាក = ដំណើរដែលបានរក្សាទុក (**commit**)
4. អាល់ប៊ុមរូបថតនៃរាល់ដំណើរ = **history**

អ្នកមិនដាក់បន្ទប់ទាំងមូលចូលវ៉ាលីរាល់លើកទេ — អ្នកជ្រើសអ្វីដែលសមនឹង commit *នេះ*។

### ពាក្យបួនដែលសំខាន់

| ពាក្យ | អត្ថន័យ |
|------|---------|
| **Working tree** | ឯកសារដែលអ្នកឃើញនិងកែ |
| **Staging** | តំបន់រង់ចាំសម្រាប់ commit *បន្ទាប់* (`git add`) |
| **Commit** | រូបថតដែលបានរក្សាទុកមានសារ |
| **Branch** | កំណត់ចំណាំដែលចង្អុលទៅ commit (ជាធម្មតា `main`) |

```
edit files  →  git add  →  staging  →  git commit  →  history
                                              ↓
                                        git push → remote (GitHub)
```

### ហេតុអ្វីវាសំខាន់នៅការងារ

អ្នកជួសជុល bug ចូលប្រព័ន្ធ *ហើយ* ចាប់ផ្តើមពិសោធមិនស្អាតក្នុងថតតែមួយ។ Staging ឲ្យអ្នក commit **តែការជួសជុលចូលប្រព័ន្ធ** ហើយទុកការពិសោធចេញ។ គំនិតមួយនេះសម្អាត “ភាពច្រឡំ Git” ពាក់កណ្តាល។

---

## 3. ដំឡើង និងកំណត់រចនាសម្ព័ន្ធដំបូង

### បញ្ហាពិភពពិត

អ្នកព្យាយាម commit ហើយ Git ថាវាមិនស្គាល់ថាអ្នកជាអ្នកណា។ រាល់ commit ត្រូវការអ្នកនិពន្ធ — ដូចចុះហត្ថលេខាលើកំណត់ហេតុផ្លាស់ប្តូរនៅការងារ។

### ដំឡើង

- **macOS:** `xcode-select --install` ឬ [git-scm.com](https://git-scm.com)
- **Windows:** [Git for Windows](https://git-scm.com/download/win)
- **Linux:** `sudo apt install git` / `sudo dnf install git`

```bash
git --version
```

### កំណត់អត្តសញ្ញាណរបស់អ្នក (ធ្វើម្តងគ្រប់គ្រាន់)

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

ប្រើ **អ៊ីមែលដូចគ្នា** ជាមួយ GitHub ដើម្បីឲ្យ commits បង្ហាញនៅលើប្រវត្តិរូបអ្នក។

### តម្លៃលំនាំដើមមានប្រយោជន៍

```bash
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.editor "code --wait"   # or nano / vim
```

```bash
git config --list --show-origin
```

---

## 4. repository ដំបូងរបស់អ្នក

### បញ្ហាពិភពពិត

អ្នកចាប់ផ្តើមគេហទំព័រកំណត់ចំណាំផ្ទាល់ខ្លួន (ឬថតកិច្ចការផ្ទះ)។ អ្នកចង់បានប្រវត្តិពីថ្ងៃដំបូង — មិនមែនបន្ទាប់ពីបាត់សេចក្តីព្រាងល្អហើយទេ។

### A) គម្រោងថ្មីទាំងស្រុងនៅលើកុំព្យូទ័រអ្នក

```bash
mkdir my-notes && cd my-notes
git init
```

→ បង្កើតថត `.git/` ដែលលាក់។ អ្នកស្ថិតក្នុង repo ហើយ។

### B) ចូលរួមគម្រោងដែលមានស្រាប់ (clone)

```bash
git clone https://github.com/bunsalcoder/rean-git.git
cd rean-git
```

→ ទាញយកឯកសារ **និង** ប្រវត្តិពេញលេញ។ នេះជារបៀបដែលអ្នកចូលរួម repo ក្រុមនៅការងារ។

### ពេលអ្នកវង្វេង: សួរ `git status`

```bash
git status
```

វាតែងតែឆ្លើយ: branch ណា អ្វីបានផ្លាស់ប្តូរ អ្វីគួរធ្វើបន្ទាប់។ ធ្វើជាទម្លាប់ — ដូចពិនិត្យស្ថានភាព build មុនពេលចាកចេញពីការងារ។

### ពិធី commit ដំបូង

```bash
echo "# My notes" > README.md
git status
git add README.md
git status
git commit -m "Add README"
git log --oneline
```

### មន្ទីរពិសោធន៍

បំពេញ **[មន្ទីរពិសោធន៍ 01 — Repo ដំបូង](./lab.html?id=01-first-repo)** មុនពេលបន្ត។

---

## 5. Staging, commits និងប្រវត្តិ

### បញ្ហាពិភពពិត

ថ្ងៃនេះអ្នកបានផ្លាស់ប្តូរបីយ៉ាង:

1. ជួសជុលកំហុសអក្ខរាវិរុទ្ធនៅទំព័រដើម (ដាក់ចេញបាន)
2. ចាប់ផ្តើម dark mode ពាក់កណ្តាល (មិនទាន់រួច)
3. កែកំណត់ចំណាំផ្ទាល់ខ្លួន (មិនពាក់ព័ន្ធ)

អ្នកចង់បាន **commit ស្អាតមួយ** សម្រាប់កំហុសអក្ខរាវិរុទ្ធ — មិនមែនចាក់អ្វីៗទាំងអស់។ នោះហើយជាហេតុដែលមាន staging។

### Stage តែអ្វីដែលសមនឹងគ្នា

```bash
git add index.html            # just the typo fix
git add -p                    # pick hunks interactively
git restore --staged FILE     # oops — unstage, keep edits
```

`git add .` stage *អ្វីៗទាំងអស់*។ មានប្រយោជន៍ ប៉ុន្តែប្រុងប្រយ័ត្នពេលថតមិនស្អាត។

### សាររបស់ commit ដែលជួយអ្នកនាពេលអនាគត

នៅការងារ មនុស្សស្វែងរកប្រវត្តិថា “តើ login បែកពេលណា?” សារមិនច្បាស់បំផ្លាញម៉ោង។

គួរជ្រើស:

```text
Fix login redirect after password reset
```

មិនមែន:

```text
fix
update
asdf
```

```bash
git commit -m "Fix login redirect after password reset"
```

### មើលអ្វីដែលផ្លាស់ប្តូរ / អ្វីដែលអ្នករក្សាទុក

```bash
git diff              # edits not staged yet
git diff --staged     # what the next commit will include
git log --oneline
git log --oneline --graph --all
git show HEAD         # latest commit details
```

`HEAD` = “commit ដែលខ្ញុំកំពុងនៅឥឡូវនេះ។”

---

## 6. Branching

### បញ្ហាពិភពពិត

`main` គឺជាគេហទំព័រផ្ទាល់។ មិត្តរួមការងារសុំឲ្យអ្នកបន្ថែមទំព័រ “Contact” — ប៉ុន្តែ bug ក្តៅទើបមកដល់នៅទំព័រដើម។

បើអ្នកកែ `main` ផ្ទាល់ ការងារ Contact មិនទាន់រួចអាចដាក់ចេញជាមួយការជួសជុល bug។ **Branches** ឲ្យអ្នកញែកការងារចេញ។

### បង្កើតខ្សែការងារដែលមានសុវត្ថិភាព

```bash
git switch -c feat/contact-page     # new branch + switch
# older style: git checkout -b feat/contact-page
```

ក្រោយមក សម្រាប់ bug:

```bash
git switch main
git switch -c fix/homepage-crash
```

### មើលថាអ្នកនៅឯណា

```bash
git branch          # local branches (* = current)
git branch -a       # include remotes
```

### រូបភាពគំនិត

```
main:              A---B---C
                            \
feat/contact-page:           D---E
```

អក្សរនីមួយៗគឺ commit។ Branch គ្រាន់តែជា pointer មានឈ្មោះ។

### ច្បាប់ដែលត្រូវនឹងការងារពិត

- រក្សា `main` ឲ្យមានសុវត្ថិភាពសម្រាប់ដាក់ចេញ
- ដាក់ឈ្មោះ branches តាមការងារ: `fix/login-crash`, `feat/signup-form`
- មួយគោលបំណងក្នុងមួយ branch

### មន្ទីរពិសោធន៍

**[មន្ទីរពិសោធន៍ 02 — Branch និង merge](./lab.html?id=02-branch-merge)**

---

## 7. Merging

### បញ្ហាពិភពពិត

ទំព័រ Contact របស់អ្នករួចហើយ និងបានពិនិត្យ។ អ្នកត្រូវការនាំ commits ទាំងនោះទៅ `main` ដើម្បីឲ្យគេហទំព័រអាចចេញផ្សាយ។ **Merge** = “នាំការងាររួចនេះចូល branch ដែលយើងដាក់ចេញពី។”

### ជំហានមូលដ្ឋាន

```bash
git switch main
git merge feat/contact-page
```

### អ្វីដែលអ្នកនឹងឃើញ

**Fast-forward** — `main` គ្មាន commits ថ្មីខណៈអ្នកធ្វើការ។ Git គ្រាន់តែរុញ pointer `main` ទៅមុខ។ ប្រវត្តិនៅជាបន្ទាត់ត្រង់។

**Merge commit** — អ្នកផ្សេងបាន merge ទៅ `main` ខណៈអ្នកធ្វើការ។ Git ភ្ជាប់ខ្សែទាំងពីរ ហើយអាចបង្កើត commit ដែលមាន parents ពីរ។

```bash
git log --oneline --graph --all
```

### សម្អាត branch ដែលរួចហើយ

```bash
git branch -d feat/contact-page
```

ប្រើ `-D` តែពេលអ្នកចង់ថា “បោះបង់ branch នេះ។”

### មន្ទីរពិសោធន៍

ការអនុវត្តដូច branching: **[មន្ទីរពិសោធន៍ 02 — Branch និង merge](./lab.html?id=02-branch-merge)**

---

## 8. Conflicts

### បញ្ហាពិភពពិត

អ្នកនិងមិត្តរួមក្រុមទាំងពីរប្ដូរអត្ថបទប៊ូតុងទំព័រដើម៖

- អ្នក៖ `Sign up`
- ពួកគេ៖ `Get started`

Git មិនអាចទាយបានថាពាក្យណាត្រូវរក្សា។ នោះជា**conflict**— មិនមែនជាកំហុសទេ ការសម្រេចចិត្ត។

### តើឯកសារមើលទៅដូចអ្វី

```text
<<<<<<< HEAD
Sign up
=======
Get started
>>>>>>> feat/other
```

### ដោះស្រាយដោយស្ងប់ស្ងាត់ (ដូចនៅកន្លែងធ្វើការ)

1. បើកឯកសារ
2. ជ្រើសរើសអត្ថបទចុងក្រោយ (ឬផ្សំគំនិត) ហើយ**លុបសញ្ញាសម្គាល់**3. បញ្ចប់ការmerge៖

```bash
git add index.html
git commit          # message is often pre-filled
```

ប៊ូតុងភ័យស្លន់ស្លោ៖

```bash
git merge --abort
```

### ជៀសឲ្យផុតពីការប្រយុទ្ធធំ

- Pull / mergeជាញឹកញាប់ដូច្នេះconflictនៅតូច
- និយាយនៅពេលដែលមនុស្សពីរនាក់ជាម្ចាស់ឯកសារក្តៅដូចគ្នា។
- `git status` បញ្ជីឯកសារនៅតែមិនត្រូវបានបញ្ចូល

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 03 — Conflict](./lab.html?id=03-conflict)**

---

## 9. Rebase (ប្រើដោយប្រុងប្រយ័ត្ន)

### បញ្ហាពិភពពិត

branch featureរបស់អ្នកមានcommitចំនួនបី។ ទន្ទឹមនឹងនេះ `main` បានទទួលការជួសជុលសុវត្ថិភាព។ មុនពេលអ្នកបើក PR អ្នកចង់ឲ្យការងាររបស់អ្នកអង្គុយ**នៅលើ**ចុងក្រោយបំផុត `main` — ប្រវត្តិស្អាត ការភ្ញាក់ផ្អើលតិចជាងនៅក្នុងការពិនិត្យ។**Rebase**= ចាក់ឡើងវិញ * your* commits on top of another branch .

```bash
git switch feat/contact-page
git fetch origin
git rebase main
```

### Merge vs rebase (ពេលណាត្រូវប្រើមួយណា)

| | Merge | Rebase |
|--|-------|--------|
| ប្រវត្តិ | រក្សា branch ពិតចូលរួម | មើលទៅដូចជាបន្ទាត់ត្រង់ |
| branch ចែករំលែក | សុវត្ថិភាពជាងមុន | ប្រថុយប្រសិនបើអ្នកផ្សេងទាញcommitរបស់អ្នករួចហើយ |
| ការប្រើប្រាស់ធម្មតា | featuremerge → `main` | ធ្វើបច្ចុប្បន្នភាពលក្ខណៈពិសេស *របស់អ្នក* ទៅកាន់ `main` |

### ច្បាប់មាស (ចងចាំនេះ)**កុំធ្វើបាបអ្នកដ៏ទៃដែលបានបង្កើតរួចហើយ**— ជាពិសេសចែករំលែក `main`។

បង្កើត branch feature *local* របស់អ្នកឡើងវិញ។ ចូលចិត្តការmerge (ឬត្រឡប់) សម្រាប់ប្រវត្តិដែលមនុស្សគ្រប់គ្នាចែករំលែក។

### មើលជាមុន៖ commits ស្អាតមុនបើក PR

```bash
git rebase -i HEAD~3
```

Squash "oops" ចូលទៅក្នុងរឿងច្បាស់លាស់មួយ។ អ្នកនឹងកាន់តែស៊ីជម្រៅនៅក្នុង**ជំពូកទី 17**។ អនុវត្តលើ branch បោះចោលជាមុនសិន។

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 04 — Rebase](./lab.html?id=04-rebase)**

---

## 10. ត្រឡប់កំហុស

### បញ្ហាពិភពពិត

អ្នកប្រព្រឹត្តឯកសារខុស វាយបញ្ចូលសារ ឬលុបកូដល្អដោយចៃដន្យ។ ការភ័យស្លន់ស្លោគឺស្រេចចិត្ត — ជ្រើសរើសឧបករណ៍ដោយ**អ្វីដែលអ្នកនៅតែចង់រក្សា**។

### "ខ្ញុំបានកែសម្រួលឯកសារខុស បោះចោលការកែសម្រួលរបស់ខ្ញុំ"

```bash
git restore FILE                 # discard unstaged edits in that file
```

### "ខ្ញុំធ្វើរឿងច្រើនពេកហើយ"

```bash
git restore --staged FILE        # unstage; keep the edits
```

### “សារចុងក្រោយគឺខុស” (មិនទាន់បានpush)

```bash
git commit --amend -m "Better message"
```

### "ខ្ញុំភ្លេចឯកសារមួយនៅក្នុងcommitចុងក្រោយ" (មិនត្រូវបានpush)

```bash
git add forgotten.txt
git commit --amend --no-edit
```

### "បោះបង់commitចុងក្រោយ រក្សាការងាររបស់ខ្ញុំ"

```bash
git reset --soft HEAD~1          # back one commit; changes stay staged
git reset HEAD~1                 # back one; changes stay unstaged
```

### "Nuke អ្វីគ្រប់យ៉ាងត្រលប់ទៅcommitចុងក្រោយ" (គ្រោះថ្នាក់)

```bash
git reset --hard HEAD~1
```

⚠️ បំផ្លាញការងារដែលមិនបានសម្រេច។ លុះត្រាតែអ្នកប្រាកដ។

### “យើងបានpushរួចហើយ — កុំសរសេរប្រវត្តិសាស្ត្រឡើងវិញ”

```bash
git revert COMMIT_SHA            # new commit that undoes an old one
```

នៅកន្លែងធ្វើការ**ចូលចិត្ត `revert` នៅលើ branch រួម**។ `reset --hard` នៅលើប្រវត្តិពីចម្ងាយធ្វើឲ្យមិត្តរួមក្រុមរងទុក្ខ។

### "ខ្ញុំគិតថាខ្ញុំបាត់បង់commit"

```bash
git reflog
git switch -c recover HASH       # bring it back on a new branch
```

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 05 — ត្រឡប់វិញ](./lab.html?id=05-undo)**

---

## 11. Remotes និង GitHub

### បញ្ហាពិភពពិត

កុំព្យូទ័រយួរដៃរបស់អ្នកស្លាប់ ឬមិត្តរួមក្រុមត្រូវការលេខកូដ។ Local Git តែម្នាក់ឯងមិនមែនជាការបម្រុងទុកទេ។**ពីចម្ងាយ**(ជាធម្មតា GitHub ដែលមានឈ្មោះថា `origin`) គឺជាច្បាប់ចម្លងដែលបានចែករំលែក។

### មើលពីចម្ងាយ

```bash
git remote -v
```

### គម្រោងថ្មី → GitHub

1. បង្កើត repo ទទេនៅលើ GitHub (រំលង README ប្រសិនបើអ្នកមានcommitក្នុងតំបន់រួចហើយ)
2. ភ្ជាប់ និងpush៖

```bash
git remote add origin https://github.com/YOU/REPO.git
git push -u origin main
```

`-u` ចងចាំupstream ដូច្នេះក្រោយមក `git push` / `git pull` ខ្លីជាង។

### សមកាលកម្មប្រចាំថ្ងៃ (ដូចគ្នានឹងការងារភាគច្រើន)

```bash
git fetch origin          # download updates; don’t change your files yet
git pull                  # fetch + merge into your current branch
git push                  # upload your commits
```

`origin/main` គឺជា *រូបភាព* របស់កុំព្យូទ័រយួរដៃរបស់អ្នក `main` របស់ GitHub។ `fetch` ធ្វើបច្ចុប្បន្នភាពរូបភាព; `pull` នាំយកcommitទាំងនោះទៅក្នុង branch របស់អ្នក។

### សិទ្ធិ

- HTTPS + personal access token ឬ
- SSH (`git@github.com:YOU/REPO.git`)

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 06 — Remote និង PR](./lab.html?id=06-remote-pr)**(ត្រូវការគណនី GitHub)

---

## 12. Pull requests

### បញ្ហាពិភពពិត

អ្នកបានជួសជុលកំហុសក្នុងការចូល។ អ្នកមិនគួរ**មិន**pushត្រង់ទៅ `main` នៅលើក្រុមមួយ។**សំណើរទាញ (PR)**និយាយថា៖ "សូមពិនិត្យមើល branch នេះ បន្ទាប់មកបញ្ចូលវាចូលគ្នា។"

នោះហើយជារបៀបដែលក្រុមពិតប្រាកដដឹកជញ្ជូន៖ ពិនិត្យមើលជាមុនសិន បន្ទាប់មកចុះចតនៅលើ `main`។

### លំហូរធម្មតា។

```bash
git switch main
git pull
git switch -c fix/login-redirect
# …make commits…
git push -u origin fix/login-redirect
```

នៅលើ GitHub:**ប្រៀបធៀប & ទាញសំណើ**។

### អ្វីដែលអ្នកពិនិត្យពិតជាចង់បាន

- PR តូច - គោលបំណងមួយ។
- ចំណងជើងដែលបញ្ជាក់ពីការជួសជុល (`Fix login redirect after password reset`)
- ការពិពណ៌នាខ្លី៖ * ហេតុអ្វី * របៀបសាកល្បង
- គ្មានឯកសារភ្ញាក់ផ្អើល (គ្មាន `.env` ទេ `node_modules`)

### បន្ទាប់ពីវាត្រូវបានmerge

```bash
git switch main
git pull
git branch -d fix/login-redirect
git push origin --delete fix/login-redirect   # optional cleanup
```

### មន្ទីរពិសោធន៍

បញ្ចប់ការអនុវត្តពីចម្ងាយ៖**[មន្ទីរពិសោធន៍ 06 — Remote និង PR](./lab.html?id=06-remote-pr)**

---

## 13. លំហូរការងារក្រុម

### បញ្ហាពិភពពិត

មនុស្សប្រាំនាក់pushcommitដោយចៃដន្យទៅកាន់ `main`។ ដាក់ពង្រាយការបំបែក។ គ្មាននរណាដឹងថាបានដឹកជញ្ជូនអ្វីទេ។ លំហូរការងារមាន ដូច្នេះក្រុមការងាររក្សាបានលឿន * និង * មានសុវត្ថិភាព។

### ទម្លាប់ដែលមានមាត្រដ្ឋាន

| ទម្លាប់ | ហេតុអ្វី |
|--------|-----|
| branch អាយុខ្លី | រសាត់តិចពី `main` conflictតូចជាង |
| បើក PRs ញឹកញាប់ | Feedback ដើមមិនមែន 2,000-line surprise |
| ការពារ `main` | ការពិនិត្យឡើងវិញ + CI ទាមទារ; គ្មានការpushដោយផ្ទាល់ |
| ព្រងើយកន្តើយ | អាថ៍កំបាំងនិងលទ្ធផលបង្កើតមិនដែលបុក repo |

### ការពារ `main` នៅលើ GitHub (ច្បាប់ទូទៅ)

- ទាមទារការពិនិត្យ PR
- ទាមទារ CI ដើម្បីឆ្លងកាត់
- រារាំងការpushដោយផ្ទាល់ទៅ `main`

### អនុវត្តអនាម័យ

```gitignore
.DS_Store
.env
*.log
node_modules/
```

កុំប្រព្រឹត្តអាថ៌កំបាំង ឬ `node_modules/`។ ការផ្លាស់ប្តូរឡូជីខលមួយក្នុងមួយcommitនៅពេលដែលអ្នកអាចធ្វើបាន។

### មុននឹងអ្នកសុំពិនិត្យ

```bash
git switch main && git pull
git switch feat/your-branch
git merge main                 # or: git rebase main (local only)
```

ធ្វើបច្ចុប្បន្នភាព branch របស់អ្នកជាមួយនឹង `main` ចុងក្រោយបំផុតជាមុនសិន — អ្នកត្រួតពិនិត្យមិនគួរជួសជុលconflictmergeរបស់អ្នកសម្រាប់អ្នកទេ។

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 07 — លំហូរការងារក្រុម](./lab.html?id=07-team-workflow)**

---

## 14. Stash

### បញ្ហាពិភពពិត

អ្នកមានលក្ខណៈពិសេសពាក់កណ្តាលជាមួយនឹងការកែសម្រួលដែលមិនបានសម្រេចដ៏រញ៉េរញ៉ៃ។ កំហុសផលិតកម្មត្រូវការកម្មវិធីជួសជុល *ឥឡូវនេះ* នៅលើ `main`។ អ្នកមិនអាចធ្វើការខូចខាតពាក់កណ្តាលនោះទេ ហើយអ្នកក៏មិនចង់បាត់បង់វាដែរ។**Stash**= ធ្នើបណ្តោះអាសន្នសម្រាប់ការផ្លាស់ប្តូរដែលមិនមានការអនុញ្ញាត។

### ចលនាមូលដ្ឋាន

```bash
git stash push -m "wip contact form"
git status                 # clean working tree
git switch main
# …fix the bug, commit, push…
git switch feat/contact
git stash list
git stash pop              # re-apply + drop from list
```

### វ៉ារ្យ៉ង់មានប្រយោជន៍

```bash
git stash push -u -m "include untracked"   # also stash new files
git stash apply stash@{0}                  # re-apply, keep stash
git stash drop stash@{0}
git stash show -p stash@{0}                # preview
```

### ច្បាប់ងាយៗចងចាំ

- Stash គឺlocal - វាមិនទៅ GitHub ទេ។
- ចូលចិត្តដាក់ឈ្មោះ stashes (`-m`) ដូច្នេះអ្នកចងចាំពួកគេ។
- កុំទុកចោលច្រើនសប្តាហ៍

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 08 — Stash](./lab.html?id=08-stash)**

---

## 15. Tags និងការចេញផ្សាយ

### បញ្ហាពិភពពិត

អតិថិជនដំណើរការ "កំណែ 1.4.2"។ ការដាក់ពង្រាយស្គ្រីបត្រូវការ**ឈ្មោះថេរ**សម្រាប់commit មិនមែន “អ្វីក៏ដោយ `main` គឺថ្ងៃនេះ។

ស្លាក**ស្លាក**គឺជាស្លាកស្អិតនៅលើ commit។ ក្រុមប្រើស្លាកសម្រាប់ការចេញផ្សាយ។

### ទម្ងន់ស្រាលធៀបនឹងការរៀបរាប់

```bash
git tag v1.0.0-beta                 # lightweight pointer
git tag -a v1.0.0 -m "Ship v1.0.0"  # annotated (preferred for releases)
git tag -l
git show v1.0.0
```

### ចែករំលែក tags

```bash
git push origin v1.0.0
git push origin --tags              # all local tags (be careful)
```

### ផ្លាស់ទីដោយប្រុងប្រយ័ត្ន

```bash
git tag -d v1.0.0                   # delete local
git push origin --delete v1.0.0     # delete remote
```

ការផ្លាស់ទីស្លាកដែលបានបោះពុម្ពធ្វើឲ្យខូចអ្នកដែលទាញវារួចហើយ។ ចូលចិត្តកំណែថ្មី (`v1.0.1`)។

### SemVer (លំនាំទូទៅ)

`MAJOR.MINOR.PATCH` — breaking / feature / fix។ ហុទាហរណ៍៖ `v2.1.0`។

### មន្ទីរពិសោធន៍**[មន្ទីរពិសោធន៍ 09 — Tags](./lab.html?id=09-tags)**

---

## 16. Cherry-pick

### បញ្ហាពិតក្នុងការងារ

ការជួសជុលដ៏សំខាន់មួយបានមកដល់ `feat/billing` ។ Production ត្រូវការ *តែ commit នោះមួយ* នៅលើ `main` — មិនមែនជាលក្ខណៈពិសេសដែលមិនទាន់បានបញ្ចប់ទាំងស្រុងនោះទេ។

**Cherry-pick** ចម្លង commit ទៅលើ branch បច្ចុប្បន្នរបស់អ្នក។

```bash
git switch main
git pull
git log feat/billing --oneline      # find the fix SHA
git cherry-pick abc1234
git push
```

### Conflicts

សញ្ញាសម្គាល់ដូចគ្នានឹង merge ។ ជួសជុលឯកសារបន្ទាប់មក៖

```bash
git add .
git cherry-pick --continue
# or
git cherry-pick --abort
```

### ពេលណាមិនគួរ cherry-pick

- ចូលចិត្ត merge/rebase នៅពេលអ្នកចង់បាន *ទាំងមូល* branch
- Cherry-picking ការជួសជុលដូចគ្នាទៅនឹង branches ដែលមានអាយុកាលយូរជាច្រើនអាចបង្កើត commits ស្ទួន — ទំនាក់ទំនងជាមួយក្រុម

### Lab

**[Lab 10 — Cherry-pick](./lab.html?id=10-cherry-pick)**

---

## 17. Interactive rebase

### បញ្ហាពិតក្នុងការងារ

PR របស់អ្នកមាន៖ `wip`, `fix typo`, `actually fix login`, `oops` ។ អ្នកត្រួតពិនិត្យសមនឹងទទួលបានរឿងច្បាស់លាស់មួយ។

**Interactive rebase** អនុញ្ញាតឱ្យអ្នកតម្រៀបឡើងវិញ កែសម្រួល កម្ទេច ឬទម្លាក់ commits *មុនពេល* ផ្សេងទៀតបង្កើតនៅលើពួកវា។

```bash
git switch feat/login
git rebase -i HEAD~4        # or: git rebase -i main
```

កម្មវិធីនិពន្ធបើកជាមួយបន្ទាត់ដូចជា៖

```text
pick a111 fix login
pick b222 wip
pick c333 typo
```

### ពាក្យបញ្ជាដែលត្រូវធ្វើធម្មតា។

| Command | អត្ថន័យ |
|---------|---------|
| `pick` | រក្សាដូច |
| `reword` | រក្សាការផ្លាស់ប្តូរ កែសម្រួលសារ |
| `squash` / `fixup` | បត់ទៅ commit មុន។ |
| `edit` | ផ្អាកដើម្បីកែប្រែ commit នោះ។ |
| `drop` | ដក commit |

រក្សាទុក និងបិទ → ការចាក់ឡើងវិញ Git ។ ដោះស្រាយជម្លោះជាមួយ `--continue` / `--abort` ដូចជា rebase ធម្មតា។

### ច្បាប់មាស (ដូចគ្នានឹងជំពូកទី ៩)

- សរសេរឡើងវិញ **local** commits (ឬ branch គ្មាននរណាម្នាក់ផ្សេងទៀតប្រើ)
- បន្ទាប់ពីសរសេរ branch ដែលបានរុញឡើងវិញ៖ `git push --force-with-lease` (មានសុវត្ថិភាពជាង `--force`)
- មិនដែល force-push `main`

### Lab

**[Lab 11 — Interactive rebase](./lab.html?id=11-interactive-rebase)**

---

## 18. Bisect

### បញ្ហាពិតក្នុងការងារ

"ការចូលបានខូចពេលខ្លះកាលពីខែមុន។" ការស្មានដោយខ្វាក់ ខ្ជះខ្ជាយក្នុងមួយថ្ងៃ។ **Bisect** ប្រវត្តិសាស្រ្តស្វែងរកប្រព័ន្ធគោលពីរដើម្បីស្វែងរក commit អាក្រក់ដំបូង។

```bash
git bisect start
git bisect bad                  # current commit is broken
git bisect good v1.2.0          # or an old SHA that worked
# Git checks out a midpoint. Test the app, then:
git bisect good                 # if this midpoint works
# or
git bisect bad                  # if this midpoint is broken
# …repeat until Git prints the first bad commit…
git bisect reset                # return to where you started
```

### ស្វ័យប្រវត្តិនៅពេលអ្នកធ្វើតេស្ត

```bash
git bisect start HEAD v1.2.0
git bisect run ./scripts/check-login.sh
```

លេខកូដចេញ `0` = ល្អ មិនមែនសូន្យ = អាក្រក់។

### Lab

**[Lab 12 — Bisect](./lab.html?id=12-bisect)**

---

## 19. Worktrees និង detached HEAD

### បញ្ហាពិតក្នុងការងារ

អ្នកត្រូវពិនិត្យមើល PR ខណៈពេលដែលលក្ខណៈពិសេសរបស់អ្នក branch គឺកខ្វក់។ Stashing ដំណើរការ — ឬអ្នកពិនិត្យមើល **second working folder** ជាមួយ `git worktree` ។

### Detached HEAD (តើវាមានន័យយ៉ាងណា)

```bash
git switch --detach v1.0.0
# or older: git checkout v1.0.0
```

អ្នកស្ថិតនៅលើឈ្មោះ commit, **not** និង branch ។ commits ថ្មីអាចពិបាករក លុះត្រាតែអ្នកបង្កើត branch៖

```bash
git switch -c hotfix/from-tag
```

`git status` នឹងព្រមានអ្នកនៅពេលអ្នកត្រូវបានផ្ដាច់។ សូមអានការព្រមាននោះ។

### Worktrees

```bash
git worktree add ../rean-git-pr-42 pr-42-branch
cd ../rean-git-pr-42
# review / test…
cd -
git worktree remove ../rean-git-pr-42
git worktree list
```

worktree នីមួយៗមានឯកសារផ្ទាល់ខ្លួន។ ពួកគេចែករំលែកមូលដ្ឋានទិន្នន័យវត្ថុ `.git` ដូចគ្នា។

### ពេលណាត្រូវប្រើ

| Tool | ប្រើ |
|------|-----|
| Stash | ការផ្លាស់ប្តូរបរិបទរហ័ស មានរយៈពេលខ្លី |
| Worktree | ការងារស្របគ្នាសម្រាប់ម៉ោង/ថ្ងៃ |
| New clone | ភាពឯកោខ្លាំង (remotes/config ផ្សេងគ្នា) |

---

## 20. ពិនិត្យប្រវត្តិ

### បញ្ហាពិតក្នុងការងារ

"អ្នកណាផ្លាស់ប្តូរខ្សែនេះ?" "អ្វីដែលបានចុះចតកាលពីថ្ងៃអង្គារ?" "បង្ហាញតែ commits ដែលប៉ះ `auth/` ។" វីរបុរសអានប្រវត្តិសាស្ត្រយ៉ាងស្ទាត់ជំនាញ។

### អ្នកណាប៉ះខ្សែនេះ?

```bash
git blame FILE
git blame -L 20,40 FILE
```

### Powerful `log`

```bash
git log --oneline --graph --all --decorate
git log --since="2 weeks ago" --author="Ada"
git log -S "redirect" -p          # pickaxe: commits that add/remove that string
git log -- PATH/TO/FILE
git log --grep="login" -i
git show HASH
git show HASH:path/to/file        # file contents at that commit
```

### Compare branches / ranges

```bash
git log main..feat/login          # on feat but not main
git diff main...feat/login        # triple-dot: changes since branches diverged
git shortlog -sn                  # commit counts by author
```

### Cleaner diffs

```bash
git diff --stat
git diff --word-diff
git range-diff main...feat/login  # compare two histories after rebase
```

គ្រប់គ្រងទាំងនេះ ហើយ UI របស់ GitHub ក្លាយជាជម្រើសសម្រាប់ការស៊ើបអង្កេត។

---

## 21. Hooks

### បញ្ហាពិតក្នុងការងារ

មាននរណាម្នាក់រុញ commit ដែលបរាជ័យ។ CI ចាប់វានៅពេលក្រោយ — បន្ទាប់ពីពេលវេលាពិនិត្យត្រូវបានដុត។ **Hooks** ដំណើរការស្គ្រីបនៅព្រឹត្តិការណ៍ Git នៅលើម៉ាស៊ីនរបស់អ្នក (ឬម៉ាស៊ីនមេ) ។

### អតិថិជន hooks អ្នកនឹងជួប

| Hook | ពេលណា |
|------|------|
| `pre-commit` | មុនពេល commit ត្រូវបានបង្កើតឡើង |
| `commit-msg` | ធ្វើឱ្យមានសុពលភាព / ធ្វើទ្រង់ទ្រាយសារ |
| `pre-push` | មុនពេល `git push` ផ្ញើវត្ថុ |

Hooks រស់នៅក្នុង `.git/hooks/` (មិនប្រព្រឹត្តតាមលំនាំដើម)។ ឯកសារគំរូបញ្ចប់ដោយ `.sample` ។

### ឧទាហរណ៍តិចតួចបំផុត។

```bash
# .git/hooks/pre-commit  (chmod +x)
#!/bin/sh
npm test || exit 1
```

### គំរូមិត្តភាពជាក្រុម

Commit a `scripts/hooks/` ឬប្រើឧបករណ៍ ([Husky](https://typicode.github.io/husky/), `pre-commit` framework) ដូច្នេះអ្នកគ្រប់គ្នាចែករំលែកការត្រួតពិនិត្យដូចគ្នា។ កុំពឹងផ្អែកលើ hooks ក្នុងស្រុក - នៅតែដំណើរការ CI ។

### Server / platform hooks

ការត្រួតពិនិត្យដែលត្រូវការ GitHub **branch protection** + គឺជា "ម៉ាស៊ីនមេ hook" ទំនើប។ `update` hooks បុរាណមាននៅលើម៉ាស៊ីនមេទទេដែលអ្នកបង្ហោះដោយខ្លួនឯង។

---

## 22. ចុះហត្ថលេខា commits

### បញ្ហាពិតក្នុងការងារ

នរណាម្នាក់អាចកំណត់ `user.name` ទៅឈ្មោះរបស់អ្នក។ **Signed commits** បង្ហាញថាអ្នកនិពន្ធគ្រប់គ្រងការទុកចិត្ត GitHub សំខាន់ៗ — មានប្រយោជន៍សម្រាប់ការចេញផ្សាយ និងអង្គការដែលងាយនឹងសុវត្ថិភាព។

### ការចុះហត្ថលេខា SSH (សាមញ្ញនៅលើ GitHub ទំនើប)

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
# Add the same SSH key as a “Signing key” on GitHub
```

### GPG / SSH ផ្ទៀងផ្ទាត់ក្នុងស្រុក

```bash
git log --show-signature -1
git verify-commit HEAD
```

### កែប្រែ និងកំណត់ចំណាំ rebase

ការសរសេរប្រវត្តិសាស្រ្តឡើងវិញ ចុះហត្ថលេខាឡើងវិញ (ឬទម្លាក់ហត្ថលេខា) ។ វាត្រូវបានរំពឹងទុកបន្ទាប់ពី interactive rebase ។

ក្រុមជាច្រើនធ្វើការចុះហត្ថលេខាជាជម្រើសសម្រាប់ juniors; អ្នកខ្លះត្រូវការវានៅលើ `main` ។ ផ្គូផ្គងកន្លែងធ្វើការរបស់អ្នក។

---

## 23. Forks និង remotes ច្រើន

### បញ្ហាពិតក្នុងការងារ

អ្នកចូលរួមចំណែកក្នុងប្រភពបើកចំហដែលអ្នកមិនសរសេរចូលប្រើ។ លំនាំ៖

1. **Fork** នៅលើ GitHub (ច្បាប់ចម្លងរបស់អ្នក)
2. Clone *your* fork
3. បន្ថែមដើមជា `upstream`
4. រុញ branches ទៅ `origin` បើក PR ចូលទៅក្នុង `upstream`

```bash
git clone https://github.com/YOU/project.git
cd project
git remote add upstream https://github.com/ORIGINAL/project.git
git remote -v
git fetch upstream
git switch main
git merge upstream/main          # or: git rebase upstream/main
git push origin main
```

### remotes ច្រើននៅកន្លែងធ្វើការ

```bash
git remote add staging git@github.com:Acme/app-staging.git
git push staging feat/demo:main
```

ឈ្មោះគឺបំពាន - `origin` គ្រាន់តែជាអនុសញ្ញាប៉ុណ្ណោះ។

### Mirror / backup

```bash
git clone --mirror URL
git push --mirror BACKUP_URL
```

ប្រើដោយប្រុងប្រយ័ត្ន — កញ្ចក់សរសេរឡើងវិញនូវឯកសារយោងដែលត្រូវគ្នា។

---

## 24. Submodules និង Git LFS

### បញ្ហាពិតក្នុងការងារ

កម្មវិធីរបស់អ្នកត្រូវការការចែករំលែកប្រព័ន្ធរចនាដែលបានចែករំលែក ឬទ្រព្យសកម្មវីដេអូ 2 GB។ Git commits ធម្មតាស្អប់ប្រព័ន្ធគោលពីរដ៏ធំ ហើយ nested-repos គឺឆ្គង។

### Submodules (nested Git repos)

```bash
git submodule add https://github.com/Acme/design-system.git libs/design
git submodule update --init --recursive
```

បន្ទាប់ពី clone នៃ repo មេ៖

```bash
git clone --recurse-submodules URL
# or later:
git submodule update --init --recursive
```

**Trade-off:** Submodules កំណត់ commit ជាក់លាក់។ មិត្តរួមក្រុមត្រូវតែចងចាំដើម្បី init/update ។ ចូលចិត្តកម្មវិធីគ្រប់គ្រងកញ្ចប់នៅពេលដែលអ្នកអាចធ្វើបាន។ ប្រើ submodules នៅពេលដែលអ្នកពិតជាត្រូវការគម្រោង Git ដែលមានមូលដ្ឋាន។

### Git LFS (Large File Storage)

```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
git add hero.psd
git commit -m "Add hero artwork via LFS"
```

LFS រក្សាទុកទ្រនិចនៅក្នុង Git និងឯកសារធំៗនៅលើម៉ាស៊ីនមេ LFS ។ ត្រូវការ `git-lfs` ដំឡើងសម្រាប់អ្នកគ្រប់គ្នាដែលពិនិត្យឯកសារទាំងនោះ។

### Alternatives

- បញ្ជីឈ្មោះកញ្ចប់ / CDN សម្រាប់ទ្រព្យសម្បត្តិ
- Subtree បញ្ចូលគ្នា (`git subtree`) — មិនសូវសាមញ្ញ ទទួលបានតិចជាង submodules សម្រាប់ក្រុមមួយចំនួន

---

## 25. របៀបដែល Git ដំណើរការខាងក្នុង

### បញ្ហាពិតក្នុងការងារ

ពាក្យបញ្ជាមានអារម្មណ៍ដូចជាវេទមន្តរហូតដល់អ្នកឃើញគំរូ។ នៅពេលអ្នកធ្វើ `reset`, `rebase`, និង "detached HEAD" ឈប់គួរឱ្យខ្លាច។

### អ្វីគ្រប់យ៉ាងត្រូវបានដោះស្រាយដោយមាតិកា

Git រក្សាទុកវត្ថុដែលត្រូវបានបំបែកដោយមាតិកា (SHA-1 ឬ SHA-256 នៅក្នុងឃ្លាំងថ្មីជាងនេះ)៖

| Object | កាន់ |
|--------|-------|
| **blob** | មាតិកាឯកសារ |
| **tree** | បញ្ជីរាយបញ្ជី → blobs/trees |
| **commit** | ឪពុកម្តាយ + tree + អ្នកនិពន្ធ + សារ |
| **tag** | វត្ថុ tag កំណត់ចំណាំ |

```bash
git cat-file -t HEAD
git cat-file -p HEAD
git rev-parse HEAD
ls .git/objects
```

### ឯកសារយោងគឺជាឈ្មោះសម្រាប់ commits

```bash
cat .git/HEAD                     # ref: refs/heads/main
cat .git/refs/heads/main          # current tip SHA
git show-ref
```

A **branch** គឺជាឯកសារយោងដែលអាចចល័តបាន។ ** tag** ជាធម្មតាមិនអាចផ្លាស់ទីបាន។ ** Remote-tracking** យោងបន្តផ្ទាល់ក្រោម `refs/remotes/origin/…` ។

### trees ទាំងបី (ម្តងទៀតសម្រាប់ពិត)

1. ថតការងារ - ឯកសាររបស់អ្នក។
2. Index (staging) — `.git/index`
3. `HEAD` commit — រូបថតចុងក្រោយនៅលើ branch នេះ។

`git status` ប្រៀបធៀបទាំងបីនេះ។

### Packfiles

វត្ថុរលុងនៅទីបំផុតខ្ចប់ទៅជាឯកសារ `.git/objects/pack/` ប្រកបដោយប្រសិទ្ធភាព។ `git gc` សម្អាត។ អ្នកកម្រត្រូវការប៉ះនេះណាស់។

### ហេតុអ្វីបានជារឿងនេះធ្វើឱ្យអ្នកក្លាយជាវីរបុរស

- Cherry-pick = ចម្លងវត្ថុ commit ទៅលើមេផ្សេងទៀត។
- កំណត់ឡើងវិញ = ផ្លាស់ទីឯកសារយោង branch (ហើយប្រហែលជា index/worktree)
- Reflog = កំណត់ហេតុប្រចាំតំបន់នៃកន្លែងដែល HEAD ចង្អុលបង្ហាញ

### លើសពីសៀវភៅណែនាំនេះ (ផែនទីនៅសល់)

ឥឡូវនេះអ្នកជាម្ចាស់ Git ប្រចាំថ្ងៃ បូកនឹងឧបករណ៍ថាមពល។ ទាំងនេះបង្ហាញតិចជាញឹកញាប់ — រៀនពួកគេនៅពេលដែលការងារពិតត្រូវការពួកគេ៖

| Topic | នៅពេលដែលអ្នកត្រូវការវា។ |
|-------|------------------|
| `git sparse-checkout` | monorepo ដ៏ធំ; គ្រាន់តែពិនិត្យមើលថតមួយចំនួន |
| clone ផ្នែកខ្លះ (`--filter`) | ប្រវត្តិ Clone / blobs តាមតម្រូវការ |
| `git filter-repo` / BFG | លុបអាថ៌កំបាំង ឬឯកសារធំៗចេញពីប្រវត្តិជាអចិន្ត្រៃយ៍ |
| `git notes` | ភ្ជាប់ទិន្នន័យមេតាដោយមិនផ្លាស់ប្តូរសញ្ញា commit |
| `git format-patch` / `am` | លំហូរការងារបំណះផ្អែកលើអ៊ីមែល |
| `rerere` | ប្រើដំណោះស្រាយជម្លោះដែលបានកត់ត្រាឡើងវិញ |
| `git replace` | ប្តូរវត្ថុមួយទៅវត្ថុមួយទៀតជាបណ្តោះអាសន្ន |
| Credential helpers | ឃ្លាំងសម្ងាត់ HTTPS សញ្ញាសម្ងាត់ដោយសុវត្ថិភាព |
| ការថែទាំ (`git maintenance`) | រក្សាឃ្លាំងធំឱ្យបានលឿន |

ការជ្រមុជទឹកជ្រៅជាផ្លូវការ៖ [សៀវភៅ Pro Git](https://git-scm.com/book/en/v2) (ឥតគិតថ្លៃ)។

### Lab

**[Lab 13 — Internals](./lab.html?id=13-internals)**

---

## 26. តារាងសង្ខេប

### Setup

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git init
git clone URL
```

### ប្រចាំថ្ងៃ

```bash
git status
git add FILE
git add -p
git commit -m "message"
git log --oneline --graph --all --decorate
git diff
git diff --staged
```

### Branches និងបញ្ចូលគ្នា

```bash
git switch -c branch-name
git switch main
git branch -d branch-name
git merge branch-name
git rebase main
git rebase -i HEAD~3
git cherry-pick HASH
```

### ត្រឡប់វិញ

```bash
git restore FILE
git restore --staged FILE
git commit --amend
git reset --soft HEAD~1
git reset --hard HEAD~1
git revert HASH
git reflog
git stash push -m "wip"
git stash pop
```

### Remotes និង tags

```bash
git remote -v
git fetch
git pull
git push
git push -u origin branch-name
git push --force-with-lease
git tag -a v1.0.0 -m "msg"
git push origin v1.0.0
```

### ពិនិត្យ

```bash
git blame FILE
git log -S "symbol" -p
git show HASH
git bisect start
git worktree add ../other branch
```

### មើលផ្នែកខាងក្នុង

```bash
git rev-parse HEAD
git cat-file -p HEAD
git show-ref
```

---

## 27. បញ្ជីផ្លូវសិក្សា

ប្រើនេះជាក្តារតាមដានវឌ្ឍនភាព — មូលដ្ឋានមុន បន្ទាប់មកជំនាញស្នូល។

### មូលដ្ឋាន

- [ ] Git បានដំឡើង ហើយ `user.name` / `user.email` បានកំណត់
- [ ] អ្នកអាចពន្យល់ working tree vs staging vs commit (រឿងវ៉ាលី)
- [ ] Lab 01 បានបញ្ចប់

### សហការជាមួយខ្លួនឯងក្នុងមូលដ្ឋាន

- [ ] បង្កើត branches សម្រាប់ features និង bug fixes
- [ ] Merge ការងាររួចទៅក្នុង `main`
- [ ] ដោះស្រាយ conflict មួយដោយចេតនា
- [ ] Labs 02–03 បានបញ្ចប់

### ជំនាញប្រវត្តិ

- [ ] Rebase feature *local* ទៅលើ `main` ចុងក្រោយ
- [ ] ជ្រើស restore / reset / revert តាមស្ថានការណ៍
- [ ] Labs 04–05 បានបញ្ចប់

### Remote និងក្រុម

- [ ] Push branch ហើយបើក PR
- [ ] ប្រើ `.gitignore` និង branches រយៈពេលខ្លី
- [ ] Labs 06–07 បានបញ្ចប់

### ឧបករណ៍មានថាមពល

- [ ] Stash ការងារមិនទាន់រួច ហើយស្តារវិញ
- [ ] Tag ការចេញផ្សាយ ហើយ push tag
- [ ] Cherry-pick commit មួយទៅ branch ផ្សេង
- [ ] Squash commits ដោយ interactive rebase
- [ ] រក commit អាក្រក់ដោយ bisect
- [ ] Labs 08–12 បានបញ្ចប់

### Git វិជ្ជាជីវៈ

- [ ] ពន្យល់ detached HEAD និងពេលណា worktrees ជួយ
- [ ] ប្រើ `blame` / `log -S` ដើម្បីស៊ើបអង្កេតការផ្លាស់ប្តូរ
- [ ] ដឹងថា hooks និង signed commits សម្រាប់អ្វី
- [ ] បន្ថែម remote `upstream` លើ fork
- [ ] ពន្យល់ពេលណាគួរប្រើ submodules vs LFS vs packages

### ជំនាញជាន់ខ្ពស់

- [ ] ពណ៌នា blob / tree / commit / ref ដោយភាសាសាមញ្ញ
- [ ] Lab 13 បានបញ្ចប់
- [ ] អ្នកចាប់ `git status` មុនពេលទាយ

---

អ្នកមិនទាន់ឈប់រៀន Git រហូតអស់ពេល — ecosystem នៅតែវិវត្ត — ប៉ុន្តែឥឡូវអ្នកមានគំរូគំនិតពេញលេញ៖ លំហូរការងារប្រចាំថ្ងៃ ឧបករណ៍មានថាមពល លំនាំសហការ និងរបៀបដែលមូលដ្ឋានទិន្នន័យខាងក្រោមដំណើរការ។ រក្សា terminal ឲ្យបើក អាន `git status` ហើយអនុវត្តក្នុង labs។
