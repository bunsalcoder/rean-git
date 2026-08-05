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
