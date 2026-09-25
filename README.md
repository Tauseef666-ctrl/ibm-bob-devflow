# DevFlow AI

> **IBM Bob 2.0 Hackathon** — Developer Release-Readiness & Maintenance Workflow Assistant

## The Problem

Before releasing or maintaining an application, developers perform a repetitive manual checklist:

1. Run the test suite and read through output
2. Scan source files for TODO/FIXME markers
3. Check that README and documentation are complete
4. Verify package.json has required fields and configuration is correct
5. Confirm `.gitignore`, `.env.example`, and other config artifacts are present
6. Run `npm install` to confirm dependency resolution
7. Check for obvious code health issues

Each step is isolated, produces output in a different format, and requires the developer to mentally aggregate findings from multiple tools and windows. The process is slow, error-prone, and produces no unified record of what was found.

## The Solution: DevFlow AI

DevFlow AI coordinates five specialized analysis modules in a single automated workflow:

```
Select Project → Analyze → Aggregate Findings → Prioritize → Action Plan → Report → Remediate → Re-analyze
```

All findings are aggregated, deduplicated, severity-ranked, and presented in a unified, prioritized action plan and Release Readiness Report — with real timing data showing the wall-clock cost of the automated workflow vs the manual alternative.

## Architecture

```
frontend/          React + Vite SPA (port 5173)
backend/           Express API server (port 3001)
  ├── engine/      Orchestrator, aggregator, severity ranker, action plan builder, report builder
  ├── modules/     5 independent analysis modules
  ├── remediation/ Safe, allowlisted fix applicator
  └── store/       In-memory analysis session store
sample-project/    Synthetic Node.js "Items API" with 13 seeded detectable issues
```

See [`WORKFLOW.md`](WORKFLOW.md) for the full analysis pipeline description.

## Setup

### Prerequisites
- Node.js 18 or later
- npm 9 or later

### Install dependencies

```bash
npm install
npm run install:all
```

### Run the application

```bash
npm start
```

This starts:
- Backend API server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

Open `http://localhost:5173` in your browser.

## Demo

See [`DEMO.md`](DEMO.md) for the full step-by-step demo scenario.

**Quick demo flow:**
1. Open the dashboard — select the "Items API" sample project
2. Review the Before/After panel showing manual vs automated workflow
3. Click "Start Analysis"
4. Watch live progress as five modules run in sequence
5. Review findings by category and severity
6. Review the prioritized action plan
7. Apply available auto-remediations
8. Click "Re-analyze" to verify fixes
9. Review the final Release Readiness Report with before/after comparison

## IBM Bob Usage During Development

DevFlow AI was built using IBM Bob 2.0 as the core development workflow component:

| Bob Capability | How It Was Used |
|---|---|
| **Plan mode** | Full architecture and 9-sub-task implementation plan produced in `devflow-plan.md` before any code was written |
| **Agent mode** | All implementation sub-tasks executed in Agent mode |
| **Parallel subagents** | Frontend review, backend review, and documentation review run as independent parallel subagents in Sub-Tasks 8 and 9 |
| **Document understanding** | DevFlow's own Documentation module reads and analyses Markdown files from the sample project — the same Bob capability used for project understanding |

Bob session consumption summaries are in [`bob_sessions/`](bob_sessions/).

## Measurable Impact Methodology

DevFlow records the actual wall-clock duration of each workflow step using `Date.now()` timestamps in the orchestrator. These durations are exposed in the Release Readiness Report's Workflow Timeline.

**What we measure:**
- Time to complete each analysis module (actual ms)
- Total analysis workflow duration (actual ms)
- Number of findings on run 1 vs run 2 (actual counts)
- Number of auto-remediations applied (actual count)

**What we do not claim:**
- Invented or extrapolated time-savings benchmarks
- Percentage improvements not derived from actual measurements
- AI capabilities beyond static analysis and structured workflow coordination

## Analysis Categories

| Category | What It Checks |
|---|---|
| Code Health | TODO/FIXME markers, async functions without try/catch, console.log in production, very long functions |
| Test Health | Test file coverage, runs npm test, reports pass/fail counts |
| Documentation | README completeness, missing env var docs, missing sections |
| Configuration | package.json fields, .gitignore, .env.example, engines field |
| Build/Release Readiness | npm install, npm test exit code, semver validity |

## Security

- Project path is validated against an allowlist (only `sample-project/` is accepted)
- Commands are executed via `child_process.execFile` with explicit argument arrays — no shell interpolation
- Only `npm install`, `npm test`, `npm run build` are in the command allowlist
- Finding evidence is truncated to 200 characters — no env values or secrets are extracted
- Configuration module skips `.env` files entirely
- No secrets, API keys, or personal information are used anywhere in this project

## License

MIT
