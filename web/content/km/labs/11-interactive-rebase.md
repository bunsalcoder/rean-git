# មន្ទីរពិសោធន៍ 11 — Interactive rebase

## គោលដៅ

Squash commits local រញ៉េរញ៉ៃទៅជា commit មួយច្បាស់ មុន “ពិនិត្យ”។

## ការរៀបចំ

```bash
cd labs/11-interactive-rebase
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "start" > file.txt
git add file.txt
git commit -m "Start"
```

## ជំហាន

### 1. បង្កើតបី commits រំខាន

```bash
echo "a" >> file.txt && git add file.txt && git commit -m "wip"
echo "b" >> file.txt && git add file.txt && git commit -m "typo"
echo "c" >> file.txt && git add file.txt && git commit -m "actually done"
git log --oneline
```

### 2. Squash ដោយ interactive rebase ដែលមាន script

នេះជៀសវាងការប្រយុទ្ធជាមួយ vim ក្នុង lab។ វាប្តូរ commit រាល់បន្ទាប់ពីទីមួយទៅ `squash` បន្ទាប់មកដាក់សារស្គាត៖

```bash
export GIT_SEQUENCE_EDITOR="sed -i -e '2,\$s/^pick/squash/'"
export GIT_EDITOR="sh -c 'printf \"%s\\n\" \"Implement file updates\" > \"\$1\"' --"
git rebase -i HEAD~3
unset GIT_SEQUENCE_EDITOR GIT_EDITOR
git log --oneline
```

នៅលើ macOS បើ `sed -i` ត្គូញត្គែរ ប្រើ៖

```bash
export GIT_SEQUENCE_EDITOR="sed -i '' -e '2,\$s/^pick/squash/'"
export GIT_EDITOR="sh -c 'printf \"%s\\n\" \"Implement file updates\" > \"\$1\"' --"
git rebase -i HEAD~3
unset GIT_SEQUENCE_EDITOR GIT_EDITOR
```

→ អ្នកគួរឃើញ `Start` បូក commit ស្គាតមួយ ជំនួសបីដែលរំខាន។

### 3. ដឹងថាអ្នកទើបធ្វើអ្វី

| Todo | អត្ថន័យ |
|------|---------|
| `pick` | រក្សា commit |
| `squash` | បត់ចូល commit មុន |

សរសេរឡើងវិញតែ commits **local** ដែលគ្មាននរណាផ្សេងសាងលើ។

## លក្ខខណ្ឌជោគជ័យ

- [ ] បី WIP commits ក្លាយជា commit ស្គាតមួយ (បូក `Start`)
- [ ] អ្នកយល់ `pick` vs `squash`
- [ ] អ្នកសរសេរឡើងវិញតែប្រវត្តិ *local*

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
