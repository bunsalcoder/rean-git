# មន្ទីរពិសោធន៍ 17 — ចុះហត្ថលេខា commits

## គោលដៅ

ចុះហត្ថលេខា commit ដោយ SSH key បោះចោល បន្ទាប់មកផ្ទៀងផ្ទាត់ហត្ថលេខាក្នុងស្រុក។

## លក្ខខណ្ឌមុន

- Git **2.34+** (`git version`)
- `ssh-keygen` (OpenSSH)

មន្ទីរពិសោធន៍នេះប្រើ Git config **ក្នុងស្រុក** ដូច្នេះមិនផ្លាស់ប្តូរការចុះហត្ថលេខា global របស់អ្នក។ នៅលើម៉ាស៊ីនពិត អ្នកនឹងប្រើ `--global` ហើយបន្ថែម public key ដូចគ្នាជា signing key នៅលើ GitHub។

## ការរៀបចំ

```bash
cd labs/17-signing
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "# Signed notes" > README.md
git add README.md
git commit -m "Start unsigned"
```

## ជំហាន

### 1. បង្កើត SSH key បោះចោល

```bash
ssh-keygen -t ed25519 -f ./lab-signing-key -N "" -C "lab@example.com"
```

→ File ពីរ៖ `lab-signing-key` (private) និង `lab-signing-key.pub`។ ទុកទាំងពីរ **untracked**។

### 2. បើកការចុះហត្ថលេខា SSH តែក្នុង repo នេះ

```bash
git config gpg.format ssh
git config user.signingkey "$(pwd)/lab-signing-key.pub"
git config commit.gpgsign true
```

### 3. ប្រាប់ Git ថា key ណាដែលត្រូវទុកចិត្តពេល verify

```bash
{
  printf 'lab@example.com namespaces="git" '
  cat lab-signing-key.pub
} > allowed_signers
git config gpg.ssh.allowedSignersFile "$(pwd)/allowed_signers"
```

អ៊ីមែលក្នុង `allowed_signers` ត្រូវតែផ្គូផ្គង `user.email`។

### 4. ចុះហត្ថលេខា commit ហើយពិនិត្យ

```bash
echo "This commit is signed." >> README.md
git add README.md
git commit -m "Add signed note"
git log --show-signature -1
git verify-commit HEAD
```

→ `verify-commit` គួរចេញ 0។ `git log --show-signature` គួររាយការណ៍ហត្ថលេខាល្អ។

### 5. ប្រៀបធៀបជាមួយ commit គ្មានហត្ថលេខា

```bash
git log --show-signature --oneline -2
```

Commit ដំបូង (`Start unsigned`) គ្មានហត្ថលេខា។ ការសរសេរប្រវត្តិឡើងវិញ (amend, rebase) ទម្លាក់ ឬចុះហត្ថលេខាឡើងវិញ — នោះជារឿងធម្មតា។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `gpg.format` គឺ `ssh` ហើយ `commit.gpgsign` បើកក្នុង repo នេះ
- [ ] `git verify-commit HEAD` ជោគជ័យ
- [ ] អ្នកអាចពន្យល់ថាហេតុអ្វី GitHub នៅតែត្រូវការបន្ថែម public key ជា signing key

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
