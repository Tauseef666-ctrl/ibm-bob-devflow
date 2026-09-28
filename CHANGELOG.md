# Changelog

All notable changes to DevFlow AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-29

Analysis now runs in production on Vercel and returns findings identical to a
local run: **21 findings (2 critical, 6 high, 6 medium, 6 low, 1 info) in roughly
700 ms.**

### Added

- **`POST /api/analysis/run`** — a synchronous endpoint that performs the whole
  workflow inside a single request and returns findings, action plan and report
  together. Vercel gives each invocation a fresh module instance, so the
  in-memory store could not hold a session between requests; this removes that
  dependency entirely.
- **Capability reporting** — `GET /api/health` returns `"stateful": false` when
  `process.env.VERCEL` is set. The frontend reads it and selects the synchronous
  path automatically, so no configuration is needed per environment.
- **Client-side result cache** — the frontend stores a run result in
  `sessionStorage` and all five pages read from it, falling back to the
  per-session endpoints that still work locally.
- **Vercel deployment configuration** — `vercel.json` routes `/api/*` to a
  serverless function (`api/index.js`) that wraps the existing Express app, so
  the SPA and the API are served from a single origin and no CORS preflight is
  needed in production. A `vercel-build` script installs all four packages and
  builds the frontend.
- **Vercel deployment guide** — `docs/deployment.md` documents how the SPA and
  the API are served from one origin, the required project settings, and the
  `Root Directory` pitfall that makes the build fail with a misleading
  `Missing script: "vercel-build"` error.
- **Environment variable templates** — `.env.example` at the root and in
  `frontend/`, both containing commented placeholders only.
- **Configurable CORS** — the backend accepts a `FRONTEND_URL` environment
  variable in addition to the two localhost origins, and allows credentialed
  requests. Requests without an `Origin` header are still permitted for
  command-line and server-to-server use.
- **Frontend resilience** — an `ErrorBoundary` wraps the app so a render error
  shows a recoverable message instead of a blank page, plus a `NotFoundPage`
  for unmatched routes.
- **Accessibility and SEO** — skip-to-content link, `main` landmark id, Open
  Graph and description meta tags, and `robots.txt`.
- **Responsive styles** — a mobile breakpoint and a loading spinner in
  `globals.css`.

### Changed

- **The in-memory store is no longer on the critical path in production.** The
  `start` + poll endpoints are unchanged and still used locally; serverless
  deployments use `POST /api/analysis/run` instead.
- **Frontend deployable on its own** — `frontend/vercel.json` pins `npm run
  build`, a `dist` output directory and the SPA fallback rewrite for a project
  whose Root Directory is `frontend`, and `frontend/package.json` gains a
  `vercel-build` alias of `build`. A frontend-rooted Vercel project previously
  failed with `Missing script: "vercel-build"`, because that script only existed
  in the root `package.json`. See `docs/deployment.md`.
- **Auto-remediation reports why it is unavailable in production** rather than
  failing with a bare 404, because the analysed files live in a read-only
  bundle. It still works when the backend runs locally.
- `frontend/public/_redirects` added for static hosts that support it. On
  Vercel the equivalent SPA fallback is declared in `vercel.json`.

### Fixed

- **The analysis returned the wrong findings on Vercel: 18 instead of 21.** Two
  independent causes. Non-JS files never reached the function, so
  `documentation.js:22` saw no `README.md` and *inverted* its findings,
  reporting `README.md is missing` while omitting `readme-no-setup`,
  `missing-env-docs` and `No CHANGELOG found`. Separately, `buildRelease.js`
  returns early when `npm install` fails, and that install cannot succeed in a
  read-only bundle, so it emitted a false critical finding *and suppressed the
  real `npm test failed` one*. Fixed with `"includeFiles": "sample-project/**"`
  and by skipping the install when `process.env.VERCEL` is set.
- **Every Vercel build failed** with `Invalid vercel.json - functions['api/index.js'].includeFiles' should be string`. The field takes a string, not an array. This is now reproducible locally with `npx vercel build` rather than burning a build cycle.
- **UI text was mangled in all five pages.** A previous refactor applied its
  renames with PowerShell `-replace` piped to `Set-Content`, which decoded the
  files as single-byte text and re-encoded every multi-byte character, so em
  dashes and ellipses rendered as garbage. Restored from the last clean commit
  and reapplied with Node. Added `.gitattributes` to normalise line endings.
- **An untrusted `Origin` produced a 500** instead of a CORS rejection, because
  the `cors` callback rejected with an error. `FRONTEND_URL` also now accepts a
  comma-separated list, so the combined and standalone deployments can both be
  allowed.
- `vercel link` added a blanket `.env*` rule to `.gitignore`, which would have
  silently ignored a future `.env.example` and dropped it from the repository.
  Narrowed to local-only files.

### Removed

- `uuid` (ESM-only) is no longer a dependency. It was replaced with
  `backend/src/ids.js`, which uses `node:crypto.randomUUID()`. The original
  concern was unfounded — these projects run Node 24, which supports
  `require(ESM)` — but the dependency was unnecessary either way.

### Known Issues

- **Auto-remediation is unavailable on Vercel.** It writes real files and the
  function bundle is read-only, so the button reports that reason instead of
  failing silently. Run the backend locally to apply fixes. Re-analysis *does*
  work on the hosted deployment — it re-runs the workflow and caches the result
  — but with no fixes to apply, the before/after comparison has nothing to show
  and the two runs match.
- The Vercel **Root Directory** setting must be left empty so the build runs at
  the repository root. This cannot be enforced from the repository, because
  Vercel does not read a root directory from `vercel.json`. See
  `docs/deployment.md`.
- **Output Directory must be empty on a function-only Vercel project.** An
  explicit value makes Vercel search the output for a static entrypoint and
  fail with `No entrypoint found in output directory`. The value also shifts
  with the Root Directory: `frontend/dist` for the combined deployment, `dist`
  for a frontend-rooted one, and empty for a backend-rooted one. See
  `docs/deployment.md`.
- `maxDuration` is 30s. Raising it to 300 is rejected on the current Vercel
  plan, and is not needed: the synchronous endpoint answers in under two seconds.
- An untrusted `Origin` still returns 500 rather than a clean CORS rejection. The
  request is correctly refused; only the status code is unhelpful.

## [1.0.0] - 2026-09-26

First complete end-to-end release of DevFlow AI, built for the IBM Bob 2.0
Hackathon by team The7th Neo.

### Added

- **Analysis engine** — sequential orchestrator driving five independent
  analysis modules (code health, test health, documentation, configuration,
  build/release readiness), with real per-module wall-clock timings.
- **Finding pipeline** — aggregation with deduplication and consolidation,
  severity ranking, and generation of a prioritised action plan grouped by
  severity and category.
- **Release Readiness Report** — overall status, category breakdown, workflow
  timeline, and before/after comparison across re-analysis runs.
- **Auto-remediation** — four allowlisted, non-destructive fixes (add
  `.gitignore`, add `.env.example`, add `package.json` `description`, add
  `engines.node`), each validated against a `sample-project/`-only path
  allowlist. Unknown remediation IDs are rejected.
- **Re-analysis** — a second run compares against its parent so the effect of
  applied remediations is visible.
- **REST API** on port 3001 — health, projects, analysis start/status/findings/
  action-plan/report, remediate, reanalyze.
- **React + Vite SPA** on port 5173 — dashboard with before/after panel, live
  analysis progress, findings, action plan, and report pages.
- **Sample project** — synthetic "Items API" containing 13 deliberately seeded
  detectable defects plus one intentionally failing test assertion.
- **Backend unit tests** — 9 tests covering the aggregator, severity ranker and
  action plan builder.
- **Documentation** — README, architecture overview, analysis workflow, demo
  scenario, implementation plan, and contributing guide.

### Fixed

- npm could not be spawned on Windows, where it resolves to `npm.cmd`. Every
  `npm install` / `npm test` call failed with `ENOENT`, which the orchestrator
  incorrectly surfaced as two false critical findings against the target
  project. The binary is now selected per platform and executed with
  `shell: true`, which Node >=18.20 requires for `.cmd` scripts. Real command
  execution and real timing data now work on Windows.

### Changed

- Root `install:all` now installs all four packages, including
  `sample-project/`, which was previously skipped.
- npm is now invoked via `exec` with a command string built from hardcoded
  literals, replacing the `execFile` + `shell: true` approach. Same behaviour,
  but it no longer makes Node print a `DEP0190` deprecation warning on every
  analysis run.
- Documentation consolidated into `docs/`; added `CONTRIBUTING.md`,
  `CHANGELOG.md` and an MIT `LICENSE` to match the licence already stated in
  the README.
- Security documentation corrected: commands are restricted to a fixed
  allowlist with hardcoded arguments and no user-supplied input, but they *are*
  executed through a shell, because `npm` resolves to `npm.cmd` on Windows.
  The previous "no shell interpolation" claim no longer matched the code.

### Known Issues

- `sample-project/package-lock.json` gains an `engines` entry whenever the
  build/release module runs `npm install`. This is harmless and does not affect
  the seeded defects the analysis is meant to detect.
- Remediations have not yet been validated end-to-end across a re-analysis run.
  **Done** — all four applied, all four findings moved to `fixed`, re-analysis
  went 21 → 17, and the report's `beforeAfter` block read
  `fixedCount: 4`. Evidence in `docs/devflow-plan.md`.

[Unreleased]: https://github.com/Tauseef666-ctrl/ibm-bob-devflow/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/Tauseef666-ctrl/ibm-bob-devflow/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Tauseef666-ctrl/ibm-bob-devflow/releases/tag/v1.0.0
