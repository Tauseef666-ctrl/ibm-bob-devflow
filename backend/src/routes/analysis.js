const express = require('express');
const path = require('path');
const { uuidv4 } = require('../ids');
const store = require('../store/analysisStore');
const orchestrator = require('../engine/orchestrator');

const router = express.Router();

// On Vercel each invocation can get a fresh module instance, so the in-memory
// store cannot be relied on across requests: a /status poll on a cold start
// returns "Session not found". The analysis itself is deterministic, so
// POST /analysis/run performs the whole workflow inside a single request and
// returns the result directly. No cross-invocation state is needed.
const IS_SERVERLESS = !!process.env.VERCEL;

// Registered sample projects (allowlist)
const SAMPLE_PROJECTS = [
  {
    id: 'items-api',
    name: 'Items API',
    description: 'A synthetic Node.js Express REST API with intentional development issues for demo purposes.',
    language: 'JavaScript / Node.js',
    path: path.resolve(__dirname, '../../../sample-project'),
  },
];

function getProjectById(id) {
  return SAMPLE_PROJECTS.find(p => p.id === id) || null;
}

const PENDING_MODULE_STATUSES = {
  'code-health': 'pending',
  'test-health': 'pending',
  'documentation': 'pending',
  'configuration': 'pending',
  'build-release': 'pending',
};

function createSessionFor(project, { runNumber = 1, parentSessionId = null } = {}) {
  return store.createSession({
    id: uuidv4(),
    projectId: project.id,
    projectPath: project.path,
    projectName: project.name,
    status: 'pending',
    startedAt: Date.now(),
    completedAt: null,
    runNumber,
    parentSessionId,
    moduleStatuses: { ...PENDING_MODULE_STATUSES },
    moduleTimings: {},
    totalDurationMs: 0,
    error: null,
  });
}

/**
 * GET /api/projects
 * List available sample projects.
 */
router.get('/projects', (req, res) => {
  res.json(SAMPLE_PROJECTS.map(({ id, name, description, language }) => ({
    id, name, description, language,
  })));
});

/**
 * POST /api/analysis/run
 * Body: { projectId: string }
 * Run the full workflow synchronously and return the complete result.
 *
 * This is the serverless-safe path: everything is produced inside one request,
 * so it does not depend on the session surviving in module memory. Used by the
 * frontend when GET /api/health reports stateful: false.
 */
router.post('/analysis/run', async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }

  const project = getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: `Unknown projectId: ${projectId}` });
  }

  const session = createSessionFor(project);

  try {
    await orchestrator.runAnalysis(session.id);
  } catch (err) {
    console.error(`[orchestrator] session ${session.id} failed:`, err.message);
    return res.status(500).json({ error: err.message, sessionId: session.id });
  }

  const finalSession = store.getSession(session.id);
  res.json({
    sessionId: session.id,
    status: finalSession.status,
    runNumber: finalSession.runNumber,
    projectId: finalSession.projectId,
    projectName: finalSession.projectName,
    totalDurationMs: finalSession.totalDurationMs,
    moduleStatuses: finalSession.moduleStatuses,
    moduleTimings: finalSession.moduleTimings,
    findings: store.getFindings(session.id),
    actionPlan: store.getActionPlan(session.id),
    report: store.getReport(session.id),
  });
});

/**
 * POST /api/analysis/start
 * Body: { projectId: string }
 * Start a new analysis session.
 */
router.post('/analysis/start', async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: 'projectId is required' });
  }

  const project = getProjectById(projectId);
  if (!project) {
    return res.status(404).json({ error: `Unknown projectId: ${projectId}` });
  }

  const session = store.createSession({
    id: uuidv4(),
    projectId: project.id,
    projectPath: project.path,
    projectName: project.name,
    status: 'pending',
    startedAt: Date.now(),
    completedAt: null,
    runNumber: 1,
    parentSessionId: null,
    moduleStatuses: {
      'code-health': 'pending',
      'test-health': 'pending',
      'documentation': 'pending',
      'configuration': 'pending',
      'build-release': 'pending',
    },
    moduleTimings: {},
    totalDurationMs: 0,
    error: null,
  });

  // Start analysis asynchronously
  orchestrator.runAnalysis(session.id).catch(err => {
    console.error(`[orchestrator] session ${session.id} failed:`, err.message);
    store.updateSession(session.id, { status: 'failed', error: err.message, completedAt: Date.now() });
  });

  res.status(202).json({ sessionId: session.id, status: session.status });
});

/**
 * GET /api/analysis/:id/status
 * Get current status of an analysis session.
 */
router.get('/analysis/:id/status', (req, res) => {
  const session = store.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  res.json({
    sessionId: session.id,
    projectId: session.projectId,
    projectName: session.projectName,
    status: session.status,
    runNumber: session.runNumber,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    totalDurationMs: session.totalDurationMs,
    moduleStatuses: session.moduleStatuses,
    moduleTimings: session.moduleTimings,
    error: session.error,
  });
});

/**
 * POST /api/analysis/:id/reanalyze
 * Start a re-analysis of the same project (creates a new session linked to the parent).
 */
router.post('/analysis/:id/reanalyze', async (req, res) => {
  const parent = store.getSession(req.params.id);
  if (!parent) return res.status(404).json({ error: 'Parent session not found' });

  if (parent.status === 'running' || parent.status === 'pending') {
    return res.status(409).json({ error: 'Parent session is still running' });
  }

  const session = store.createSession({
    id: uuidv4(),
    projectId: parent.projectId,
    projectPath: parent.projectPath,
    projectName: parent.projectName,
    status: 'pending',
    startedAt: Date.now(),
    completedAt: null,
    runNumber: parent.runNumber + 1,
    parentSessionId: parent.id,
    moduleStatuses: {
      'code-health': 'pending',
      'test-health': 'pending',
      'documentation': 'pending',
      'configuration': 'pending',
      'build-release': 'pending',
    },
    moduleTimings: {},
    totalDurationMs: 0,
    error: null,
  });

  orchestrator.runAnalysis(session.id).catch(err => {
    console.error(`[orchestrator] session ${session.id} failed:`, err.message);
    store.updateSession(session.id, { status: 'failed', error: err.message, completedAt: Date.now() });
  });

  res.status(202).json({ sessionId: session.id, status: session.status });
});

module.exports = router;
module.exports.getProjectById = getProjectById;
