// Vercel serverless entry for a project whose Root Directory is `backend`.
//
// Vercel only uploads the subtree named by Root Directory, so the repository
// root `api/index.js` is invisible in that setup. This mirrors it one level
// down: it exports the Express app without calling listen(), because Vercel
// invokes the function itself.
//
// Scope: this serves /api/health and /api/projects. Starting an analysis will
// not work, because the target is resolved as ../../../sample-project, which
// a backend-rooted upload does not include. See docs/deployment.md.
const app = require('../src/server');

module.exports = app;
