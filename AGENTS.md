# AGENTS.md — DevFlow AI Project Context

## Project
**DevFlow AI** — IBM Bob 2.0 Hackathon submission.
An AI-powered developer release-readiness and maintenance workflow assistant.

## Purpose
Reduces manual pre-release checking by coordinating 5 specialized analysis modules into
one workflow: Code Health → Test Health → Documentation → Configuration → Build/Release.
Produces a prioritized action plan and Release Readiness Report. Supports safe auto-remediation.

## Repository Layout
```
ibm-bob-devflow/
├── backend/          Express API server + analysis engine + 5 modules
├── frontend/         React + Vite SPA (5 pages)
├── sample-project/   Synthetic Node.js "Items API" with 13 seeded detectable issues
├── bob_sessions/     Hackathon Bob session screenshots (manual drops)
├── AGENTS.md         This file — Bob session context
├── WORKFLOW.md       Analysis pipeline documentation
├── DEMO.md           Step-by-step demo script
└── devflow-plan.md   Full implementation plan (9 sub-tasks)
```

## Stack
- **Backend:** Node.js, Express, in-memory store, child_process for npm commands
- **Frontend:** React 18, Vite 5, React Router v6, plain CSS custom properties
- **Sample project:** Node.js with node:test (built-in test runner)

## Key Design Decisions
1. No database — in-memory store sufficient for single-machine demo
2. Only 4 safe, allowlisted remediations (file creation / single-field JSON edits)
3. All timing data is real wall-clock from orchestrator — nothing invented
4. Before/After panel uses factual manual-workflow steps only
5. Security: projectPath validated to sample-project/ only; commands via execFile allowlist

## API Surface (backend :3001)
```
GET  /api/health
GET  /api/projects
POST /api/analysis/start          { projectId }
GET  /api/analysis/:id/status
GET  /api/analysis/:id/findings
GET  /api/analysis/:id/action-plan
GET  /api/analysis/:id/report
POST /api/analysis/:id/remediate  { remediationId }
POST /api/analysis/:id/reanalyze
```

## Analysis Modules
| Module | File | Key checks |
|---|---|---|
| Code Health | `backend/src/modules/codeHealth.js` | TODO/FIXME, async no try/catch, console.log, long functions |
| Test Health | `backend/src/modules/testHealth.js` | Coverage gaps, runs npm test, parses output |
| Documentation | `backend/src/modules/documentation.js` | README gaps, missing env var docs |
| Configuration | `backend/src/modules/configuration.js` | package.json fields, .gitignore, .env.example |
| Build/Release | `backend/src/modules/buildRelease.js` | npm install, npm test exit code, semver |

## IBM Bob Usage in This Project
- **Plan mode:** Architecture and 9-sub-task plan produced in `devflow-plan.md`
- **Agent mode:** All implementation sub-tasks
- **Parallel subagents:** Used for frontend/backend/doc independent review in Sub-Tasks 8 & 9
- **Document understanding:** Documentation module analyses Markdown files from sample project

## Current Sub-Task Status
See `devflow-plan.md` for status of each sub-task.

## Working on a Sub-Task?
1. Read `devflow-plan.md` → locate your sub-task → read its todo list and relevant context
2. Implement only what is in scope for that sub-task
3. After completing, mark sub-task done in `devflow-plan.md`
4. Do not edit files owned by other sub-tasks without coordination
