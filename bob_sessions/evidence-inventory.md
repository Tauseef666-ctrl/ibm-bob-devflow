# Evidence Inventory

Session-level record of the IBM Bob work behind DevFlow AI, cross-referenced to
the sub-task log and the commits that resulted. For the screenshots themselves,
and the member each session belongs to, see [`README.md`](README.md).

> **Important:** This inventory lists REAL Bob tasks that were actually performed
> during DevFlow AI development. It was compiled from the actual Git commit history,
> the `docs/devflow-plan.md` sub-task log, and the `CHANGELOG.md`.
>
> No task has been invented. Every task listed here corresponds to real development
> work that produced committed code or documentation.
>
> Screenshots must be captured from the actual IBM Bob session summaries for these
> tasks. Do not fabricate screenshots.

**Shot coverage.** The 12 screenshots in this folder cover 10 of the sessions
listed below. Not every session has a screenshot, and one session has two:

| Session | Shots |
|---|---|
| Tauseef — Planning & Architecture | `tauseef-01` |
| Tauseef — Backend Foundation + Engine | `tauseef-02` |
| Tauseef — Five Modules + Sample Project | `tauseef-03` |
| Tauseef — Windows npm Fix + Engine Refactor | `tauseef-04` |
| Tauseef — Documentation, Integration & Final Validation | `tauseef-05` |
| Hifza — Frontend Foundation | `hifza-01` |
| Hifza — Frontend Pages | `hifza-02`, `hifza-03`, `hifza-04` |
| Hamza — Sample Project QA, Docs & Demo Validation | `hamza-01`, `hamza-02`, `hamza-03` |
| Tauseef — Vercel Deployment + Resilience | none yet |
| Tauseef — Frontend UI Overhaul (gauge + scoring) | none yet |

The two sessions with no screenshot are the post-1.0 deployment and UI-polish
work. They happened after this folder was first filled, so they are recorded
here as sessions performed, not as evidence attached.

---

## Team Lead — Tauseef

Real Bob sessions that contributed to the final submitted DevFlow AI project:

---

### TASK: DevFlow AI — Planning & Architecture

**What was done:**
Used IBM Bob **Plan mode** to gather requirements, define the project architecture,
design the five-module analysis pipeline, specify all data models (Finding,
AnalysisSession, ActionPlanItem, ReleaseReadinessReport), define the API surface,
specify the sample project with its 13 seeded issues, the security controls, and
break the implementation into 9 sub-tasks. The full output is in
`docs/devflow-plan.md`.

**Relevance:**
This is the foundational planning document for the entire project. Every subsequent
Bob session used this plan as its context via `AGENTS.md`. The plan defines the
exact workflow DevFlow implements.

**Mode:** Plan

**Priority:** HIGH — core evidence of IBM Bob plan-mode usage

**Evidence:** Required

**Filename:** `01-team-lead-planning.png`

---

### TASK: DevFlow AI — Backend Foundation + Analysis Engine (Sub-Tasks 1–4)

**What was done:**
Used IBM Bob **Agent mode** to scaffold the repository root, create `AGENTS.md`,
set up the Express backend server, in-memory store, shared data models, all API
route stubs, and then implement the complete analysis engine pipeline:
orchestrator, aggregator, severity ranker, action plan builder, and report builder.
Produced: `backend/src/engine/orchestrator.js`, `aggregator.js`, `severityRanker.js`,
`actionPlanBuilder.js`, `reportBuilder.js`, `analysisStore.js`, all route files,
`backend/src/models/types.js`, and the root workspace configuration.

Git evidence: commits `934f8fe`, `50b73e4`.

**Relevance:**
This is the core of DevFlow AI — the orchestrator drives the entire
analysis-findings-action-plan-report workflow that the hackathon demo is built around.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `02-team-lead-backend-engine.png`

---

### TASK: DevFlow AI — Five Analysis Modules + Sample Project (Sub-Tasks 2, 5)

**What was done:**
Used IBM Bob **Agent mode** to implement all five analysis modules (`codeHealth.js`,
`testHealth.js`, `documentation.js`, `configuration.js`, `buildRelease.js`),
the safe remediator with four allowlisted operations (`remediator.js`), and the
synthetic `sample-project/` Items API with its seeded detectable defects and
intentional test failure.

Git evidence: commits `3d289c3`, `50b73e4`.

**Relevance:**
The analysis modules are what DevFlow actually does — scanning source code,
running tests, checking documentation and configuration, validating build health.
The sample project is the analysis target for every demo run.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `03-team-lead-modules-and-sample-project.png`

---

### TASK: DevFlow AI — Windows npm Fix + Engine Refactor (Sub-Task 9 debugging)

**What was done:**
Used IBM Bob **Agent mode** to diagnose and fix a critical Windows-platform bug
where `npm` could not be spawned as `execFile` because Node.js on Windows requires
`npm.cmd`. The fix changed all five analysis modules and the test health module
to resolve the binary name per platform and use `exec` with a hardcoded command
string assembled from literals. Also eliminated the `DEP0190` deprecation warning.

Before the fix: two false critical findings were emitted on every run ("npm install
failed", "test suite has failures") and all timing data was meaningless (62 ms total).
After: correct real timing (~4300 ms total), genuine findings only.

Git evidence: commits `30cdc83`, `3f12add`.

**Relevance:**
Without this fix the core demo did not work at all on Windows. The timing data
shown in the Release Readiness Report's Workflow Timeline is the result of this fix.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `04-team-lead-windows-npm-fix.png`

---

### TASK: DevFlow AI — Documentation, Integration & Final Validation (Sub-Task 9)

**What was done:**
Used IBM Bob **Agent mode** to complete all documentation: full `README.md` with
problem statement, solution, architecture, setup, Bob usage table, and limitations;
`docs/WORKFLOW.md` with full module descriptions; `docs/DEMO.md` with step-by-step
demo script; `docs/architecture.md` with system design and control flow;
`CONTRIBUTING.md`, `CHANGELOG.md`, and `LICENSE`.

Also ran the final end-to-end validation sequence and recorded results in
`docs/devflow-plan.md` Validation Evidence section (actual command outputs, timing
before/after Windows fix).

Git evidence: commits `3480d7b`, `07392f9`, `a6961ee`, `c2173ba`.

**Relevance:**
Documentation is a judging criterion. This session produced all the documentation
in the final submitted repository.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `05-team-lead-documentation-validation.png`

---

### TASK: DevFlow AI — Vercel Deployment + Resilience (Post-1.0 work)

**What was done:**
Used IBM Bob **Agent mode** to add Vercel deployment configuration (`vercel.json`,
`api/index.js` serverless wrapper), configurable CORS via `FRONTEND_URL` env var,
`ErrorBoundary` component, `NotFoundPage`, Open Graph meta tags, responsive styles,
mobile breakpoint, accessibility improvements (skip-to-content link, main landmark),
and `uuid` upgrade from v9 to v14.

Git evidence: commits `c63d8b1`, `3c02c84`, `62f2206`, `e52280f`, `f0e466d`.

**Relevance:**
Adds deployment capability and resilience to the final submission. The Vercel
configuration allows the project to be demonstrated from a live URL rather than
only locally.

**Mode:** Agent

**Priority:** MEDIUM

**Evidence:** Optional

**Filename:** `06-team-lead-deployment-resilience.png`

---

### TASK: DevFlow AI — Frontend UI Overhaul (Release Gauge + Scoring)

**What was done:**
Used IBM Bob **Agent mode** to overhaul the frontend UI with a readiness gauge,
a scoring formula, accessibility improvements, and a project-listing refactor.

Git evidence: commits `637da81`, `14d828a`, `7d1c7d2`.

**Relevance:**
Directly improves the presentation of the Release Readiness Report — a key
hackathon demo step.

**Mode:** Agent

**Priority:** MEDIUM

**Evidence:** Optional

**Filename:** `07-team-lead-frontend-overhaul.png`

---

## Teammate 2 — Hifza Irfan (Frontend / UI)

The frontend React SPA was implemented as Sub-Task 7 and Sub-Task 8 in the plan.

---

### TASK: DevFlow AI — Frontend Foundation (Sub-Task 7)

**What was done:**
Scaffold of the React + Vite SPA: `frontend/package.json`, `vite.config.js` with
`/api` proxy, `index.html`, `main.jsx`, `App.jsx` with React Router, `client.js`
API helpers, `Header` component, stub page components, and `globals.css` with
design tokens.

Git evidence: commit `f523eb8` (frontend implementation).

**Relevance:** The frontend is one of two primary deliverables for the hackathon demo.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `01-teammate-2-frontend-foundation.png`

---

### TASK: DevFlow AI — Frontend Pages (Sub-Task 8)

**What was done:**
Full implementation of all five frontend pages: DashboardPage with project card and
Before/After panel, AnalysisPage with live module status polling, FindingsPage with
category tabs and severity filters, ActionPlanPage with remediation controls,
ReportPage with workflow timeline and before/after comparison.

**Relevance:**
All five pages are exercised in the demo. The Before/After panel is a key
differentiating hackathon element.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `02-teammate-2-frontend-pages.png`

---

## Teammate 3 — Hamza Masood (Sample Project / QA / Documentation)

---

### TASK: DevFlow AI — Sample Project QA, Documentation & Demo Validation

**What was done:**
Used IBM Bob **Agent mode** to:
- Audit the complete repository (all five analysis modules, all sample project
  source files, all existing docs)
- Run all five analysis modules directly against `sample-project/` and measure
  actual finding counts (20 findings, not the 13 stated in earlier docs)
- Discover and document BUG-001 (DEMO.md claimed 13 findings; actual is 20),
  BUG-002 (action plan automated-item count incorrect), BUG-003 (helpers.js untested)
- Add `sample-project/tests/helpers.test.js` (7 tests, all passing)
- Update `docs/DEMO.md` with accurate finding counts verified by live analysis
- Create `docs/sample-project-issues.md` (full catalogue of all 20 intentional issues)
- Create `docs/qa.md` (QA record with 8 sections, 40+ verified test entries)
- Run full security check confirming no secrets in sample project or repository
- Verify backend tests (9/9 pass) and sample project tests (12 run, 11 pass, 1
  intentional failure)

**Relevance:**
The QA work established that the demo produces truthful results. The accurate finding
counts in DEMO.md directly affect what judges see when the demo is run. The sample
project documentation explains the design of the analysis target to judges and
reviewers.

**Mode:** Agent

**Priority:** HIGH

**Evidence:** Required

**Filename:** `01-teammate-3-sample-project-qa.png`

---

## Summary Table

| Filename | Team Member | Priority | Evidence |
|----------|-------------|----------|---------|
| `team-lead/01-team-lead-planning.png` | Tauseef | HIGH | Required |
| `team-lead/02-team-lead-backend-engine.png` | Tauseef | HIGH | Required |
| `team-lead/03-team-lead-modules-and-sample-project.png` | Tauseef | HIGH | Required |
| `team-lead/04-team-lead-windows-npm-fix.png` | Tauseef | HIGH | Required |
| `team-lead/05-team-lead-documentation-validation.png` | Tauseef | HIGH | Required |
| `team-lead/06-team-lead-deployment-resilience.png` | Tauseef | MEDIUM | Optional |
| `team-lead/07-team-lead-frontend-overhaul.png` | Tauseef | MEDIUM | Optional |
| `teammate-2/01-teammate-2-frontend-foundation.png` | Hifza | HIGH | Required |
| `teammate-2/02-teammate-2-frontend-pages.png` | Hifza | HIGH | Required |
| `teammate-3/01-teammate-3-sample-project-qa.png` | Hamza | HIGH | Required |

**Total Required:** 8 screenshots (5 team-lead, 2 teammate-2, 1 teammate-3)
**Total Optional:** 2 screenshots (team-lead only)
**Total if all captured:** 10 screenshots

---

## Git evidence cross-reference

| Commit | Message | Related task |
|--------|---------|--------------|
| `934f8fe` | chore: add root workspace config, gitignore and Bob session directory | Sub-Task 1 (scaffold) |
| `50b73e4` | feat(backend): add analysis engine, five modules, remediation and REST API | Sub-Tasks 3–6 |
| `f523eb8` | feat(frontend): add React dashboard with analysis, findings, action plan and report pages | Sub-Tasks 7–8 |
| `3d289c3` | feat(sample-project): add Items API demo project with seeded issues | Sub-Task 2 |
| `3480d7b` | docs: add project README, Bob agent context, workflow and demo guides | Sub-Task 9 (docs) |
| `30cdc83` | fix: invoke npm as npm.cmd with shell enabled so analysis works on Windows | Windows bug fix |
| `3f12add` | refactor(backend): run npm via exec with a hardcoded command string | DEP0190 fix |
| `07392f9` | docs: move guides into docs/ and add an architecture overview | Sub-Task 9 |
| `a6961ee` | docs: add contributing guide, changelog and MIT license | Sub-Task 9 |
| `c2173ba` | docs: add architecture diagram and reference it from the docs | Sub-Task 9 |
| `f0e466d` | fix(frontend): guard against missing findingIds | Frontend bug fix |
| `c63d8b1` | feat(frontend): add error boundary, 404 page, meta tags | Post-1.0 resilience |
| `3c02c84` | feat(deploy): add Vercel deployment | Post-1.0 deployment |
| `e52280f` | chore(deps): upgrade backend uuid v9 to v14 | Dependency update |
| `62f2206` | docs: record deployment additions | Deployment docs |
| `637da81` | feat(frontend): UI overhaul with readiness gauge | UI overhaul |
| `14d828a` | docs(deploy): document Vercel setup | Deployment guide |
| `7d1c7d2` | refactor(frontend): extract project listing | Refactor |
