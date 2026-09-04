# មន្ទីរពិសោធន៍ 20 — Submodule និង Git LFS

## គោលដៅ

ខ្ទាស់ repo Git ក្នុង nested ដោយ submodule បន្ទាប់មក (បើ `git-lfs` បានដំឡើង) រក្សាទុក pointer ឯកសារធំដោយ Git LFS។

## លក្ខខណ្ឌមុន

- ជំហាន submodule: Git តែប៉ុណ្ណោះ
- ជំហាន LFS: [Git LFS](https://git-lfs.com) (`git lfs version`)។ រំលងជំហាននោះបើមិនបានដំឡើង — `verify.sh` នឹងព្រមានជំនួសការបរាជ័យ។

## ការរៀបចំ

```bash
cd labs/20-submodules-lfs
mkdir -p sandbox/design-lib playground

# A small “design system” repo to nest later
cd sandbox/design-lib
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "button { color: blue; }" > tokens.css
git add tokens.css
git commit -m "Add design tokens"
cd ../..

# Parent app
cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "# App" > README.md
git add README.md
git commit -m "Start app"
```

## ជំហាន

### 1. បន្ថែម library ជា submodule

```bash
git -c protocol.file.allow=always submodule add ../sandbox/design-lib libs/design
git status
cat .gitmodules
git commit -m "Add design-lib submodule"
```

Git រារាំង protocol `file` សម្រាប់ submodules ជាលំនាំដើម (ការកំណត់សុវត្ថិភាព)។ Flag `-c protocol.file.allow=always` សម្រាប់ sandbox **ក្នុងស្រុក** នេះតែប៉ុណ្ណោះ។ នៅលើ GitHub អ្នកនឹងប្រើ URL `https://` ហើយមិនត្រូវការ flag។

→ Git កត់ត្រា **gitlink** (SHA commit ក្នុង tree មេ) បូក `.gitmodules` ដែលមាន URL និង path។

### 2. ប្តូរ library បន្ទាប់មក bump pin

```bash
git -C libs/design config user.name "Lab Learner"
git -C libs/design config user.email "lab@example.com"
cd libs/design
echo "button { color: navy; }" > tokens.css
git add tokens.css
git commit -m "Darken tokens"
cd ../..
git add libs/design
git commit -m "Bump design-lib"
git submodule status
```

មិត្តរួមក្រុមដែល clone មេនៅតែត្រូវការ៖

```bash
git submodule update --init --recursive
```

(ឬ `git clone --recurse-submodules`)។ ចូលចិត្តកម្មវិធីគ្រប់គ្រងកញ្ចប់ពេលអ្នកត្រូវការតែឯកសារដែលចេញផ្សាយ; ប្រើ submodule ពេលអ្នកពិតជាត្រូវការគម្រោង Git nested។

### 3. តាមដានទ្រព្យសកម្មធំដោយ LFS (ស្រេចចិត្ត)

រំលងផ្នែកនេះបើ `git lfs version` បរាជ័យ។

```bash
git lfs install --local
git lfs track "*.bin"
git add .gitattributes
printf 'fake-psd-bytes' > hero.bin
git add hero.bin
git commit -m "Track a large asset with LFS"
git lfs ls-files
```

→ `.gitattributes` រាយ filter LFS។ Git រក្សាទុក **pointer**; bytes ស្ថិតនៅលើម៉ាស៊ីនមេ LFS (ឬឧបករណ៍ផ្ទុក LFS ក្នុងស្រុកក្នុងមន្ទីរពិសោធន៍នេះ)។

### 4. ចងចាំ trade-off

Submodules ខ្ទាស់ commit មួយ។ LFS ទុក binary ធំៗចេញពី Git objects ធម្មតា។ ទាំងពីរមិនជំនួស `npm` / `pip` សម្រាប់បណ្ណាល័យប្រចាំថ្ងៃ។

## លក្ខខណ្ឌជោគជ័យ

- [ ] `.gitmodules` រាយ `libs/design`
- [ ] មេមាន commit ដែល bump submodule
- [ ] បើ Git LFS បានដំឡើង៖ `*.bin` ត្រូវបានតាមដាន ហើយ `hero.bin` ត្រូវបាន commit
- [ ] អ្នកអាចពន្យល់ clone `--recurse-submodules` vs `git lfs install`

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground sandbox
```
