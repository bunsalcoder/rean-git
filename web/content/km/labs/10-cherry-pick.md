# Lab 10 — Cherry-pick

## គោលដៅ

ចម្លង commit មួយពី feature branch ទៅ `main` ដោយមិន merge ទាំង branch។

## Setup

```bash
cd labs/10-cherry-pick
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"
git checkout -b main
echo "base" > app.txt
git add app.txt
git commit -m "Base"
```

## ជំហាន

### 1. Feature branch ដែលមានពីរ commits

```bash
git switch -c feat/experiment
echo "experiment" >> app.txt
git add app.txt
git commit -m "Experiment WIP"

echo "critical fix" > fix.txt
git add fix.txt
git commit -m "Fix: critical patch"
FIX=$(git rev-parse HEAD)
echo "Fix SHA: $FIX"
```

### 2. Cherry-pick តែ fix ទៅ main

```bash
git switch main
git cherry-pick "$FIX"
git log --oneline --graph --all
ls
```

→ `main` មាន `fix.txt` ប៉ុន្តែគ្មានការកែ experiment (លុះត្រាអ្នក merge ក្រោយ)។

## លក្ខខណ្ឌជោគជ័យ

- [ ] Feature branch នៅតែមានទាំងពីរ commits
- [ ] `main` ទទួលបានតែ fix commit តាម cherry-pick
- [ ] Graph បង្ខាញការរើសយ៉ាងច្បាស់

## Cleanup (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
