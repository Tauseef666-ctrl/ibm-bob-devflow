# DevFlow AI — Sample Project: Intentional Issues

## Purpose

The `sample-project/` directory contains a small synthetic Node.js Express REST API
called **Items API**. It is the analysis target for DevFlow AI during the hackathon demo.

The project is intentionally incomplete in specific, realistic ways so that DevFlow AI
can detect real issues across all five analysis categories. Every issue listed here was
verified to produce at least one finding when the backend analysis runs.

## Project Summary

- **Name:** Items API (`items-api`)
- **Language:** JavaScript / Node.js
- **Framework:** Express 4.x
- **Entry point:** `src/app.js`
- **Data:** In-memory (no real database, no real credentials)
- **Endpoints:** `GET /items`, `GET /items/:id`, `POST /items`, `GET /health`

## File Structure

```
sample-project/
├── package.json          — missing description, license, engines fields
├── README.md             — missing installation/setup section
├── src/
│   ├── app.js            — TODO comment, console.log statements
│   ├── routes/
│   │   └── items.js      — async handlers without try/catch, console.log, process.env usage
│   ├── services/
│   │   └── itemService.js — FIXME + TODO markers, duplicated code block, no test coverage
│   └── utils/
│       └── helpers.js    — no error handling in formatPrice()
└── tests/
    ├── items.test.js     — 5 tests, 1 intentionally failing
    └── helpers.test.js   — 7 tests, all passing
```

---

## Intentional Issues by Category

### CODE HEALTH (7 findings after aggregation)

---

**Issue 1 — TODO marker in app.js**

- **File:** `src/app.js`, line 2
- **Code:** `// TODO: add request logging middleware before deploying`
- **DevFlow detection:** Code Health module detects `// TODO` comment marker
- **Finding title:** `TODO marker`
- **Severity:** Low

---

**Issue 2 — console.log in production code (app.js)**

- **File:** `src/app.js`, lines 9 and 21
- **Code:** `console.log('Starting Items API server...')` and
  `console.log(\`Items API running on port ${PORT}\`)`
- **DevFlow detection:** Code Health module detects `console.log(` in non-test files
- **Finding title:** `console.log in production code`
- **Severity:** Low
- **Note:** Both lines deduplicate to a single finding (same file + title key)

---

**Issue 3 — Async route handlers without try/catch (routes/items.js)**

- **File:** `src/routes/items.js`, lines 6, 13, 23
- **Code:** Three `router.get/post` handlers defined as `async (req, res) => { ... }`
  with no try/catch blocks
- **DevFlow detection:** Code Health module detects async functions lacking try/catch
- **Finding title:** `async function without try/catch`
- **Severity:** High
- **Note:** All three routes deduplicate to a single finding (same file + title key)

---

**Issue 4 — console.log in production code (routes/items.js)**

- **File:** `src/routes/items.js`, line 25
- **Code:** `console.log('DB_URL configured:', !!dbUrl);`
- **DevFlow detection:** Code Health module detects `console.log(` in non-test files
- **Finding title:** `console.log in production code`
- **Severity:** Low

---

**Issue 5 — TODO/FIXME markers in itemService.js (consolidated)**

- **File:** `src/services/itemService.js`, lines 2, 61, 62
- **Code:**
  ```js
  // FIXME: duplicated fetch logic below should be refactored into a shared helper
  // TODO: add pagination support
  // TODO: add sorting and filtering options
  ```
- **DevFlow detection:** Code Health module detects all three markers; aggregator
  consolidates them into one finding per file
- **Finding title:** `FIXME/TODO markers in itemService.js (3 occurrences)`
- **Severity:** Medium (FIXME overrides the merged finding to medium)

---

**Issue 6 — Async functions without try/catch (itemService.js)**

- **File:** `src/services/itemService.js`
- **Code:** `getAllItems`, `getItemById`, `createItem`, `updateItem`, `deleteItem`
  are all declared `async` with no try/catch
- **DevFlow detection:** Code Health module detects each async function; aggregator
  deduplicates to one finding per (category + file + title) key
- **Finding title:** `async function without try/catch`
- **Severity:** High

---

**Issue 7 — Duplicated code block in itemService.js**

- **File:** `src/services/itemService.js`, lines ~11–20 and ~23–33
- **Code:** The filter/map chain in `getAllItems` and `getItemById` is identical
- **DevFlow detection:** Code Health module finds 5-line n-gram duplicates
- **Finding title:** `Duplicated code block detected`
- **Severity:** Medium

---

### TEST HEALTH (3 findings)

---

**Issue 8 — No test file for app.js**

- **File:** `src/app.js`
- **DevFlow detection:** Test Health module checks each source file for a corresponding
  test file; no `app.test.js` or `tests/app.js` exists
- **Finding title:** `No test file for app.js`
- **Severity:** High

---

**Issue 9 — No test file for itemService.js**

- **File:** `src/services/itemService.js`
- **DevFlow detection:** Test Health module finds no test whose basename matches
  `itemService` (the existing test file is named `items.test.js`)
- **Finding title:** `No test file for itemService.js`
- **Severity:** High
- **Note:** `helpers.js` has no test file and *does* produce a "No test file for
  helpers.js" High finding, as Issue 9's sibling. It is left untested
  deliberately, so the seeded-issue count stays intact.

---

**Issue 10 — Intentionally failing test**

- **File:** `tests/items.test.js`, line 25
- **Code:** `assert.strictEqual(item.name, 'Widget Z')` — wrong expected value;
  `getItemById('1')` returns `{ name: 'Widget A' }`, not `'Widget Z'`
- **DevFlow detection:** Test Health module runs `npm test`; non-zero exit code
  triggers the "Test suite has failures" finding
- **Finding title:** `Test suite has failures`
- **Severity:** Critical
- **Purpose:** Demonstrates that DevFlow catches an active test regression and
  surfaces it as critical — blocking release

---

### DOCUMENTATION (4 findings)

---

**Issue 11 — README missing installation/setup instructions**

- **File:** `README.md`
- **DevFlow detection:** Documentation module scans README for keywords: `install`,
  `npm install`, `setup`, `getting started` — none are present
- **Finding title:** `README missing installation/setup instructions`
- **Severity:** High

---

**Issue 12 — PORT env var not documented in README**

- **File:** `src/app.js`, line 17: `process.env.PORT`
- **DevFlow detection:** Documentation module scans source for `process.env.X`
  references and checks whether `PORT` appears in README — it does not
- **Finding title:** `Environment variable PORT not documented in README`
- **Severity:** Medium

---

**Issue 13 — DB_URL env var not documented in README**

- **File:** `src/routes/items.js`, line 24: `process.env.DB_URL`
- **DevFlow detection:** Documentation module finds `DB_URL` in source but not README
- **Finding title:** `Environment variable DB_URL not documented in README`
- **Severity:** Medium

---

**Issue 14 — No CHANGELOG**

- **DevFlow detection:** Documentation module checks for `CHANGELOG.md` — absent
- **Finding title:** `No CHANGELOG found`
- **Severity:** Info

---

### CONFIGURATION (5 findings)

---

**Issue 15 — Missing `description` in package.json** *(remediable)*

- **File:** `package.json`
- **DevFlow detection:** Configuration module checks for `description` field — absent
- **Finding title:** `package.json missing "description" field`
- **Severity:** Low
- **Remediable:** Yes — `add-pkg-description` remediation adds a placeholder value

---

**Issue 16 — Missing `license` in package.json**

- **File:** `package.json`
- **DevFlow detection:** Configuration module checks for `license` field — absent
- **Finding title:** `package.json missing "license" field`
- **Severity:** Low
- **Remediable:** No (developer should choose the appropriate license)

---

**Issue 17 — Missing `engines.node` in package.json** *(remediable)*

- **File:** `package.json`
- **DevFlow detection:** Configuration module checks for `engines.node` field — absent
- **Finding title:** `package.json missing "engines.node" field`
- **Severity:** Low
- **Remediable:** Yes — `add-pkg-engines` remediation adds the current Node.js major version

---

**Issue 18 — Missing `.gitignore`** *(remediable)*

- **DevFlow detection:** Configuration module checks for `.gitignore` — absent in
  `sample-project/`
- **Finding title:** `.gitignore is missing`
- **Severity:** Medium
- **Remediable:** Yes — `add-gitignore-node` remediation creates a standard Node.js
  `.gitignore` with `node_modules/` and `.env`

---

**Issue 19 — Missing `.env.example`** *(remediable)*

- **DevFlow detection:** Configuration module detects `process.env.*` usage in source
  and checks for `.env.example` — absent
- **Finding title:** `.env.example is missing`
- **Severity:** Medium
- **Remediable:** Yes — `add-env-example` remediation scans source and creates
  `.env.example` listing `DB_URL=` and `PORT=`

---

### BUILD / RELEASE (1 finding)

---

**Issue 20 — npm test fails (release blocker)**

- **DevFlow detection:** Build/Release module runs `npm test` — non-zero exit code
  (1 failing test) triggers the finding
- **Finding title:** `npm test failed — project is not release-ready`
- **Severity:** Critical
- **Note:** This is the same root cause as Issue 10 (the intentional test failure).
  It appears as a separate finding in the Build/Release category because the
  Build/Release module runs `npm test` independently

---

## Summary Table

| # | Issue | Category | Severity | File | Remediable |
|---|-------|----------|----------|------|------------|
| 1 | TODO marker | Code Health | Low | src/app.js | No |
| 2 | console.log (app.js) | Code Health | Low | src/app.js | No |
| 3 | Async handlers without try/catch | Code Health | High | src/routes/items.js | No |
| 4 | console.log (routes/items.js) | Code Health | Low | src/routes/items.js | No |
| 5 | TODO/FIXME markers (3 occurrences) | Code Health | Medium | src/services/itemService.js | No |
| 6 | Async functions without try/catch | Code Health | High | src/services/itemService.js | No |
| 7 | Duplicated code block | Code Health | Medium | src/services/itemService.js | No |
| 8 | No test for app.js | Test Health | High | src/app.js | No |
| 9 | No test for itemService.js | Test Health | High | src/services/itemService.js | No |
| 10 | Test suite failure | Test Health | Critical | tests/items.test.js | No |
| 11 | README missing setup instructions | Documentation | High | README.md | No |
| 12 | PORT not in README | Documentation | Medium | README.md | No |
| 13 | DB_URL not in README | Documentation | Medium | README.md | No |
| 14 | No CHANGELOG | Documentation | Info | — | No |
| 15 | package.json missing description | Configuration | Low | package.json | **Yes** |
| 16 | package.json missing license | Configuration | Low | package.json | No |
| 17 | package.json missing engines | Configuration | Low | package.json | **Yes** |
| 18 | .gitignore missing | Configuration | Medium | — | **Yes** |
| 19 | .env.example missing | Configuration | Medium | — | **Yes** |
| 20 | npm test fails (build blocker) | Build/Release | Critical | — | No |
| 21 | No test file for helpers.js | Test Health | High | src/utils/helpers.js | No |

**Total: 21 findings** — 2 Critical, 6 High, 6 Medium, 6 Low, 1 Info  
**Remediable: 4 findings** (covered by 2 automated action plan items)

## What Is NOT an Issue

The following may look unusual but are intentional design decisions:

- **In-memory data store** — appropriate for a demo; no real database needed
- **No authentication** — the sample API is intentionally minimal
- **`helpers.js` missing error handling in `formatPrice()`** — noted in a code comment
  but does NOT produce a DevFlow finding because there is no `TODO`/`FIXME` marker on
  that line and the function is not async
- **`itemService.js` async functions are in-memory** — they don't strictly need
  try/catch but the code health checker flags them because they are declared `async`
  without error handling — this is a valid code-quality finding

## Resetting the Sample Project

After a demo run, the remediations may have created:
- `sample-project/.gitignore`
- `sample-project/.env.example`
- Modified `sample-project/package.json` (added `description` and `engines`)

To reset:

```powershell
Remove-Item sample-project/.gitignore -ErrorAction SilentlyContinue
Remove-Item sample-project/.env.example -ErrorAction SilentlyContinue
git checkout -- sample-project/package.json
```
