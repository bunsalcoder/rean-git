# មន្ទីរពិសោធន៍ 12 — Bisect

## គោលដៅ

ស្វែងរកប្រវត្តិតាម binary search រក commit ដែលនាំមកនូវ bug។

## ការរៀបចំ

```bash
cd labs/14-bisect
mkdir -p playground && cd playground
git init
git config user.name "Lab Learner"
git config user.email "lab@example.com"

# Good commits
for i in 1 2 3; do
  echo "ok $i" > state.txt
  git add state.txt
  git commit -m "Good $i"
done

# Bad commit (bug introduced)
echo "BROKEN" > state.txt
git add state.txt
git commit -m "Bad: break state"

# More commits after the bug
for i in 4 5 6; do
  echo "still broken $i" >> other.txt
  git add other.txt
  git commit -m "After $i"
done

git log --oneline
```

## ជំហាន

### 1. ចាប់ផ្តើម bisect

```bash
git bisect start
git bisect bad HEAD
git bisect good HEAD~6
```

### 2. សម្គាល់ midpoint នីមួយៗ

ពិនិត្យ `state.txt`។ បើវាមាន `BROKEN` commit នោះអាក្រក់៖

```bash
if grep -q BROKEN state.txt; then git bisect bad; else git bisect good; fi
```

ធ្វើបន្ទាត់ `if grep…` ដដែលៗ រហូត Git បោះពុម្ព first bad commit។

### 3. Reset

```bash
git bisect reset
git log --oneline
```

## លក្ខខណ្ឌជោគជ័យ

- [ ] Bisect រកឃើញ commit ដែលនាំមក `BROKEN`
- [ ] អ្នកត្រឡប់ទៅ branch របស់អ្នកដោយ `git bisect reset`

## សម្អាត (ស្រេចចិត្ត)

```bash
cd ..
rm -rf playground
```
