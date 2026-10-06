# លំហាត់ 08 — Remote ក្នុងស្រុក

## គោលដៅ

អនុវត្ត `remote`, `push`, `fetch` និង `pull` ដោយប្រើ **bare repo ក្នុងស្រុក** ជា `origin` — មិនត្រូវការគណនី GitHub។ លំហាត់ 09 បន្ថែមការបញ្ចូលបែប PR (នៅតែ offline បាន; GitHub ស្រេចចិត្ត)។

## ការរៀបចំ

```bash
cd labs/08-local-remote
mkdir -p playground sandbox
cd playground
git init -b main
git config user.name "Lab Learner"
git config user.email "lab@example.com"
echo "# Local remote lab" > README.md
git add README.md
git commit -m "Initial commit"
```

## ជំហាន

### 1. Create a bare remote (stand-in for GitHub)

```bash
cd ..
git clone --bare playground sandbox/origin.git
cd playground
git remote add origin ../sandbox/origin.git
git remote -v
git push -u origin main
```

### 2. Simulate another machine with a second clone

```bash
cd ..
git clone sandbox/origin.git sandbox/other
cd sandbox/other
git config user.name "Other Learner"
git config user.email "other@example.com"
echo "Hello from the other clone." >> README.md
git add README.md
git commit -m "Add note from other clone"
git push origin main
```

### 3. Bring those commits into your playground

```bash
cd ../../playground
git fetch origin
git log --oneline --graph --all
git pull
cat README.md
git status
```

→ Your playground `main` should include the other clone’s line.

## លក្ខខណ្ឌជោគជ័យ

- [ ] `git remote -v` shows `origin` pointing at `sandbox/origin.git`
- [ ] Playground `README.md` contains the other clone’s line
- [ ] Working tree is clean on `main`

ពីថត lab (មិនមែនក្នុង `playground/`) រត់ `./verify.sh` ដើម្បីប្ងាផ្ទាត់។

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground sandbox
```
