# DevFlow AI — Demo Scenario

## Overview

This document describes the step-by-step hackathon demo scenario for DevFlow AI.
The demo takes approximately 5–8 minutes and covers the full end-to-end workflow.

> **Finding counts in this document reflect the actual analysis of `sample-project/`
> as measured during QA (see `docs/qa.md`). Numbers will match the live demo exactly
> when the sample project is in its original unmodified state.**

## Pre-Demo Setup

1. Clone the repository
2. Run `npm run install:all` to install all dependencies
3. Run `npm start` to start backend (port 3001) and frontend (port 5173)
4. Open `http://localhost:5173` in a browser
5. Ensure the `sample-project/` directory is in its **original unmodified state**
   (no `.gitignore`, no `.env.example`, original `package.json` without description/engines)

To verify the sample project is in the correct pre-demo state:

```bash
# Should NOT exist (these are created by remediations):
Test-Path sample-project/.gitignore     # expected: False
Test-Path sample-project/.env.example  # expected: False

# package.json should NOT have description or engines fields:
Get-Content sample-project/package.json
```

## Expected Analysis Results (Run 1 — Before Fixes)

**Total findings: 20**

| Category          | Findings | Critical | High | Medium | Low | Info |
|-------------------|----------|----------|------|--------|-----|------|
| Code Health       | 7        | 0        | 2    | 2      | 3   | 0    |
| Test Health       | 3        | 1        | 2    | 0      | 0   | 0    |
| Documentation     | 4        | 0        | 1    | 2      | 0   | 1    |
| Configuration     | 5        | 0        | 0    | 2      | 3   | 0    |
| Build / Release   | 1        | 1        | 0    | 0      | 0   | 0    |
| **TOTAL**         | **20**   | **2**    | **5**| **6**  | **6**| **1** |

**Action plan: 11 items, 2 automated**

The 2 automated action plan items cover 4 remediable findings:
- Medium Configuration group: add `.gitignore`, add `.env.example`
- Low Configuration group: add `package.json description`, add `engines.node`

## Expected Analysis Results (Run 2 — After Automated Fixes)

After applying the 2 automated action plan items (which fix 4 configuration findings):

**Total findings: 16** (4 fewer than Run 1)

The before/after comparison in the report will show:
- Run 1: 21 findings
- Run 2: 17 findings
- Fixed: 4 findings

Overall status changes from **Needs Attention** (critical findings present) to still
**Not Ready** (test failures remain — these require developer action) — but the
configuration section changes from **Warn** to **Pass**.

## Demo Steps

### Step 1 — Dashboard (30 seconds)

Open the Dashboard. Show:
- The "Items API" sample project card (synthetic project for demo purposes)
- The **Before/After Workflow** panel:
  - Left side: "Manual Workflow" — 7 isolated manual steps a developer would perform
  - Right side: "DevFlow Workflow" — one coordinated automated analysis
- Click **"Start Analysis"**

**Talking point:** "Instead of context-switching between terminal windows, editors, and
documentation, a developer clicks one button. DevFlow coordinates all checks in a
structured workflow."

### Step 2 — Analysis Progress (60–90 seconds)

Watch the Analysis Progress page:
- Five module status indicators update in real time: pending → running → completed
- Elapsed time counter shows actual wall-clock time
- Each module completes and records its duration

**Talking point:** "Five independent checks run in a coordinated sequence. The
orchestrator records the actual time taken for each step — this is real data, not
an estimate."

### Step 3 — Findings (60 seconds)

Navigate to Findings:
- Show all 21 findings grouped by category
- Filter to **Critical** — show the 2 critical findings: failing test suite (test-health)
  and npm test failure (build-release)
- Filter to **Code Health** — show async route handlers without try/catch, TODO/FIXME
  markers, and duplicated code block
- Show a finding card in full: title, severity, affected file, evidence snippet,
  explanation, recommendation

**Talking point:** "21 issues detected across 5 categories. Each finding shows exactly
where the problem is, what the evidence is, and what to do about it. No manual grep
required."

### Step 4 — Action Plan (60 seconds)

Navigate to Action Plan:
- Show the prioritized list (critical items first, 11 items total)
- Point out the **2 automated items** — the Medium and Low configuration groups
- Click **"Apply Fix"** on the Medium Configuration group (adds `.gitignore` and
  `.env.example`)
- Click **"Apply Fix"** on the Low Configuration group (adds `description` and
  `engines.node` to `package.json`)

**Talking point:** "The action plan is ranked by severity and business impact. For safe,
mechanical fixes — like creating a `.gitignore` or filling in missing metadata — DevFlow
applies them directly. For logic and code issues, it provides the exact recommendation;
the developer still owns the code."

### Step 5 — Re-Analysis (60 seconds)

Click **"Re-analyze"**:
- Watch the second analysis run (faster — npm dependencies already installed)
- Navigate back to Findings — confirm the 4 fixed findings now show "Fixed" status
- Overall finding count reduced from 20 to 16

**Talking point:** "After remediation, one click re-runs the full analysis. The new run
picks up the changes and the report shows exactly what improved."

### Step 6 — Release Readiness Report (60 seconds)

Navigate to the Report:
- Show the overall status banner (still **Not Ready** — test failures remain, which
  require developer action — this is honest and expected)
- Show the **Score Summary**: finding counts by severity (run 2)
- Show the **Category Results** table — Configuration now shows **Pass**; test failures
  remain in Test Health and Build/Release
- Show the **Workflow Timeline**: each step with its actual recorded duration
- Show the **Before vs After**: Run 1 (21 findings) -> Run 2 (17 findings), 4 fixed

**Talking point:** "The report shows exactly what was found, what was fixed, and what
remains. The test suite failure is still flagged — DevFlow won't give a green light
when tests are failing. This is the unified record a developer can share with their
team before merging or releasing."

## Key Points to Emphasize

1. **No invented numbers** — all timing data and finding counts are from the actual
   demo run; the counts in this document were verified by QA (see `docs/qa.md`)
2. **IBM Bob was central** — Plan mode produced the architecture before code was
   written; Agent mode implemented each sub-task
3. **Modular design** — each analysis module is an independent file; adding a new
   language means adding one new module without touching existing code
4. **Security conscious** — project path validated against allowlist; no secrets
   exposed; command allowlist enforced

## Resetting the Demo

To restore the sample project to its pre-remediation state after the demo:

```powershell
# Remove files created by automated remediations
Remove-Item sample-project/.gitignore -ErrorAction SilentlyContinue
Remove-Item sample-project/.env.example -ErrorAction SilentlyContinue

# Restore original package.json (no description, no engines field)
git checkout -- sample-project/package.json
```

Or simply restart the backend — the in-memory store resets on restart.
The sample project source files (`.js`, `tests/`) are never modified by any remediation.

## Verification

To verify findings match expected counts before the demo, start the backend and run:

```bash
# Start backend
cd backend && node src/index.js

# In a second terminal, trigger analysis via API:
curl -X POST http://localhost:3001/api/analysis/start \
  -H "Content-Type: application/json" \
  -d '{"projectId":"items-api"}'

# Then poll status and check findings count via:
# GET /api/analysis/:id/status
# GET /api/analysis/:id/findings
```

Expected: 21 findings, 2 critical, 6 high, 6 medium, 6 low, 1 info.
