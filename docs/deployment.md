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

## Known limitations

These are recorded in `CHANGELOG.md` under Known Issues and are not yet
resolved:

- The function is capped at a 30 second duration, while a local analysis run
  takes roughly 14 seconds because the build/release module shells out to
  `npm install` and `npm test` against the sample project. A cold start may
  exceed the budget.
- The bundle is read-only, so the sample project must be present in the deployed
  output for the build/release module to run. Its `npm install` writes to
  `node_modules`, which a read-only bundle does not allow.
- Because of the above two points, local analysis is the supported path for the
  demo. Treat the Vercel deployment as the API and UI shell only.
