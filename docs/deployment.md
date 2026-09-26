# Deployment

DevFlow AI deploys to Vercel as a single project that serves both the React SPA
and the Express API from one origin, so production needs no CORS preflight.

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
| Build Command | `npm run vercel-build` | From `vercel.json`; shown for reference only |
| Output Directory | `frontend/dist` | From `vercel.json`; shown for reference only |
| Install Command | `npm install` | From `vercel.json`; shown for reference only |

These settings produce a *building* deployment. They do not produce a *working
analysis API* — see [The analysis API cannot run on Vercel](#the-analysis-api-cannot-run-on-vercel)
below, which is a deliberate design limit rather than a misconfiguration.

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

## The analysis API cannot run on Vercel

This is a hard limitation, verified, not a configuration mistake. Do not spend
build cycles on it.

Three independent requirements break in a serverless bundle:

| Requirement | Where | Why it fails on Vercel |
|---|---|---|
| The analysis target is resolved as a fixed relative path, `../../../sample-project` from `backend/src/routes/` | `backend/src/routes/analysis.js:16` | Any Root Directory other than the repo root changes that path, and a subfolder root does not upload `sample-project/` at all |
| The build/release module shells out to `npm install` and `npm test` with `cwd` inside the target | `backend/src/modules/buildRelease.js:66`, `backend/src/modules/testHealth.js:140` | The bundle is read-only apart from `/tmp`, so `npm` cannot write `node_modules` |
| Auto-remediation writes real files (`.gitignore`, `.env.example`, `package.json` fields) | `backend/src/remediation/remediator.js:57` | Same read-only bundle; the before/after panel depends on these writes succeeding |

There is also a duration problem, though it is secondary: the function is
capped at 30 seconds, and a local analysis run takes roughly 14 seconds, so a
cold start can exceed the budget.

Making this work on Vercel would mean removing the `npm` shell-outs and the
write-based remediation. That is a redesign, not a config change, and it would
also remove the real wall-clock per-module timings that `AGENTS.md` records as a
core design decision. It has not been done deliberately.

**Conclusion: run the demo locally with `npm start`.** A Vercel deployment can
host the UI shell, but analysis has to happen on a machine with a writable
filesystem and a working `npm`.

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

This serves `/api/health` and `/api/projects`. Starting an analysis does not
work here — see above.

## Deploying the frontend on its own

If you want the UI on Vercel even though the API cannot run there, deploy
`frontend/` as a separate project. Two files in this repository make that work:

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

Without a reachable API the deployed SPA renders its error state, so this is a
UI preview only.
