# Deployment

DevFlow AI deploys to Vercel as a single project that serves both the React SPA
and the Express API from one origin, so production needs no CORS preflight.

## Verify a live deployment

```bash
# the SPA is served
curl -s -o /dev/null -w '%{http_code}\n' https://<your-domain>/

# the API shell responds
curl -s https://<your-domain>/api/health
curl -s https://<your-domain>/api/projects

# the analysis runs and returns the whole result in one request
printf '{"projectId":"items-api"}' > req.json
curl -s -X POST -H 'Content-Type: application/json' --data-binary @req.json \
  https://<your-domain>/api/analysis/run
```

Pass the JSON from a **file**. Inline JSON in PowerShell loses its quotes and
sends `{projectId:items-api}`, which fails with a misleading
`SyntaxError: Expected property name or '}' in JSON`. That was originally
mistaken for a serverless incompatibility.

A 404 on `/api/health` means the function did not build or the `/api/*` route is
missing. Check the command fields in
[Required project settings](#required-project-settings) before suspecting the
code.

`/api/health` reports `"stateful": false` on Vercel, meaning a session cannot be
polled. The analysis runs through `POST /api/analysis/run` instead.

## How it fits together

| Piece | Location | Role |
|---|---|---|
| Build orchestration | `vercel.json` | Declares the build command, output directory, function config and SPA fallback routes |
| Build script | `package.json` → `vercel-build` | Installs all four packages, then builds the frontend |
| Serverless entry | `api/index.js` | Exports the Express app so Vercel can invoke it as a function |
| Express app | `backend/src/server.js` | Shared by the serverless entry and the local `npm start` server |

`api/index.js` is intentionally five lines. It re-exports `backend/src/server.js`
rather than starting a listener, because Vercel invokes the function itself.
`backend/src/index.js` is only the local entry point and calls `app.listen()`.

## Required project settings

Set these in **Vercel → your project → Settings → Build & Development Settings**.

| Setting | Value | Why |
|---|---|---|
| **Root Directory** | *leave empty* (repo root) | See below — this is the setting people get wrong |
| Framework Preset | `Other` | Set by `"framework": null` in `vercel.json` |
| Build Command | `npm run vercel-build` | Must match `vercel.json` exactly |
| Output Directory | `frontend/dist` | Must match `vercel.json` exactly |
| Install Command | `npm run install:all` | Must match `vercel.json` exactly |

**Every one of these three command fields must be set on the dashboard, or the
build fails.** `vercel.json` supplies the values, but a project created in the
dashboard keeps its own copy, and the dashboard value wins when the two
disagree. A field left at its default produces a failure that names the wrong
thing, so check all three after any settings change:

| Dashboard field left at default | Result |
|---|---|
| Install Command = `npm install` | Only root `devDependencies` install, so `backend/node_modules` never exists and `api/index.js` cannot resolve `express`. Fails at output directory or at runtime with `Cannot find module 'express'`. |
| Build Command = `npm run build` or empty | Root `build` does not install the other three packages, so Vite cannot resolve `react` and no `frontend/dist` is produced. Fails with `No entrypoint found in output directory`. |
| Output Directory = `frontend/dist` on a function-only project | Vercel searches static output for an entrypoint and fails. Leave it **empty** for a backend-rooted project. |

Note the Install Command is `npm run install:all`, not `npm install`. The root
`package.json` has only `concurrently` as a dependency, so a bare `npm install`
provisions nothing the API needs.

These settings produce a *building* deployment. To produce a *working analysis
API* the function also needs `includeFiles` for the sample project, which
`vercel.json` sets. See
[Running the analysis on Vercel](#running-the-analysis-on-vercel).

### Root Directory must stay empty

Vercel uploads **only the subtree named by Root Directory**. If it is set to
`backend`, the `frontend/` directory is never uploaded, so the SPA cannot be
built or served at all. If it is set to `frontend`, `api/index.js` and
`backend/` are missing and there is no API.

Either way the build fails first with a misleading error:

```
npm error Missing script: "vercel-build"
```

That message does not mean the script is missing from the repository. The root
`package.json` does define it. It means npm was run from a subdirectory whose
`package.json` has no such script. **Clear the field rather than adding
`vercel-build` scripts to `backend/package.json` or `frontend/package.json`** —
adding them would let the build start but still fail at the output directory,
and would leave four packages with confusing duplicate scripts.

## Verifying a deployment

```bash
npm test                 # 9/9 must pass
npm run build            # must emit frontend/dist
npm run vercel-build     # the exact command Vercel runs
```

To check the serverless entry resolves its dependencies the way Vercel will
resolve them, load it from the repository root rather than starting a server:

```bash
node -e "const app = require('./api/index.js'); console.log(typeof app.listen)"
```

Expected output: `function`.

## Running the analysis on Vercel

The analysis **does** run on Vercel. It returns the same 21 findings as a local
run, in roughly 700 ms of analysis time. An earlier revision of this document
claimed it could not; that was wrong on all three counts below, and the reasons
are worth recording so the fixes are not undone.

### The synchronous endpoint

Vercel gives each invocation a fresh module instance, so `analysisStore` is
per-instance memory. A started session therefore disappears on the next
cold-start poll:

```
GET /api/analysis/<id>/status  ->  {"error":"Session not found"}
```

This was intermittent, not consistent — a warm instance hides it, which is the
worst possible failure mode for a demo.

`POST /api/analysis/run` exists for that reason. It performs the whole workflow
inside a **single request** and returns findings, action plan and report
together, so nothing depends on state surviving between invocations.
`GET /api/health` reports `"stateful": false` when `process.env.VERCEL` is set,
and the frontend switches to that endpoint automatically. The `start` + poll
endpoints are unchanged and still serve local development.

### Three fixes that made it work

| Problem | Fix |
|---|---|
| Non-JS files never reached the function, so `documentation.js:22` saw no README and *inverted* its findings — Vercel reported `README.md is missing` and omitted `readme-no-setup`, `missing-env-docs` and `No CHANGELOG found` | `"includeFiles": "sample-project/**"` in `vercel.json` |
| `buildRelease.js:81` returns early when `npm install` fails. The install cannot succeed in a read-only bundle, so it emitted a false critical **and suppressed the real `npm test failed` finding** | Skip the install when `process.env.VERCEL` is set; `npm test` still runs |
| `includeFiles` was written as an array | It must be a **string**. The build failed with `Invalid vercel.json - functions['api/index.js'].includeFiles' should be string` |

Reproduce config errors locally instead of burning a build cycle:

```bash
npx vercel build
```

### Two things that are still deliberately limited

**Auto-remediation cannot work on Vercel.** It writes real files, and the
bundle is read-only. `api.remediateAny` fails with that reason spelled out
rather than a 404, so the UI can show an honest error. Run the backend locally
to apply fixes.

**Auto-fix still works locally**, where the store is real and the filesystem is
writable.

### `maxDuration` stays at 30s

Raising it to 300 was rejected on this plan, and it is not needed: the response
is produced in under two seconds, so the analysis never approaches the budget.

## Deploying the backend on its own

A project whose Root Directory is `backend` gets a serverless function from
`backend/api/index.js`, which mirrors the root entry one level down. It exports
`../src/server` without calling `listen()`, because Vercel invokes the function
itself. `backend/vercel.json` sets the function memory and duration, and
`backend/package.json` defines a `vercel-build` that syntax-checks the entry
files, so the project builds whatever Build Command the dashboard holds.

Settings:

| Setting | Value | Why |
|---|---|---|
| Root Directory | `backend` | Puts `backend/api/index.js` where Vercel looks for a function |
| Build Command | `npm run vercel-build` | Defined in `backend/package.json` |
| **Output Directory** | **leave empty** | There is no static build — see below |
| Install Command | leave the default | |

**Output Directory must be empty for this project.** An explicit output
directory tells Vercel to expect static output and search it for an
entrypoint, so a project with only a serverless function fails with:

```
Error: No entrypoint found in output directory: "frontend/dist". Searched for:
```

That message usually means the field was carried over from the combined
deployment, where `frontend/dist` is correct. A function-only project emits no
static files, so there is nothing for Vercel to serve as an entrypoint.

As with the frontend, `vercel-build` did not originally exist in
`backend/package.json`; a backend-rooted project asking for it produced the
same `Missing script: "vercel-build"` error.

This serves `/api/health` and `/api/projects`. The analysis also runs here via
`POST /api/analysis/run`, provided `includeFiles` in `backend/vercel.json` points
at the sample project.

## Deploying the frontend on its own

To host the UI on a separate origin from the API, deploy `frontend/` as its own
project.
 Two files in this repository make that work:

- `frontend/vercel.json` — pins `npm run build`, `dist` as the output
  directory, and the SPA fallback rewrite. Vercel reads `vercel.json` from the
  Root Directory, so with Root Directory set to `frontend` this is the file it
  finds. The root `vercel.json` is invisible in that setup.
- `frontend/package.json` defines `vercel-build` as an alias of `build`, so the
  project also builds if the dashboard Build Command is left as
  `npm run vercel-build`.

Settings:

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | leave the default |

Note the Output Directory is `dist` here, not `frontend/dist`. It shifts with
the Root Directory, which is the same trap as the backend case above.

`npm run vercel-build` is a **root-level** script for the combined deployment.
`frontend/package.json` originally defined only `dev`, `build` and `preview`, so
a frontend-rooted project asking for `vercel-build` failed with
`Missing script: "vercel-build"` — a misleading message, since the script did
exist, just in a different `package.json`. The alias above removes that failure
mode.

Set `VITE_API_URL` on the frontend project to the API origin. Vite inlines
`VITE_*` variables at build time, so changing it requires a rebuild. The
matching `FRONTEND_URL` on the API project feeds the CORS allowlist in
`backend/src/server.js:12`. Both templates already document these.

A build may also print a warning like:

```
npm warn install-scripts  esbuild@0.21.5 (postinstall: node install.js)
```

That is benign, and it confirms the failing project is the frontend one, since
esbuild arrives as a Vite dependency. esbuild resolves its platform binary
through an optional dependency rather than the postinstall, so the warning does
not fail the build.

With `VITE_API_URL` set, the standalone frontend runs the analysis against the
API project. The only unavailable feature is auto-remediation, which needs a
writable filesystem on the API side.
