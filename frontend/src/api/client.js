/**
 * API client — all backend fetch helpers.
 *
 * Resolution order:
 *   1. VITE_API_URL, if set          → absolute origin, e.g. https://api.example.com
 *   2. same origin, relative '/api'  → combined deployment, or a frontend that
 *                                      sits behind the same domain as the API
 *
 * In development Vite proxies '/api' to localhost:3001 (see vite.config.js), so
 * case 2 covers local dev with no configuration.
 *
 * VITE_API_URL is inlined at BUILD time, not read at runtime, so changing it
 * requires a rebuild rather than just a redeploy of the function.
 */

const configured = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = `${configured}/api`;

/**
 * Result cache for the serverless path.
 *
 * When the backend runs on Vercel the analysis is fetched in a single request
 * (POST /analysis/run) and the pages read the result from here, because the
 * backend's per-session endpoints cannot serve it. Keyed by sessionId and held
 * in sessionStorage so a page reload still works, and scoped to the tab so two
 * sessions never collide.
 */
const CACHE_PREFIX = 'devflow:run:';

export function cacheRunResult(sessionId, result) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + sessionId, JSON.stringify(result));
  } catch {
    // Storage full or unavailable — pages fall back to the API endpoints.
  }
}

export function getCachedRunResult(sessionId) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + sessionId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Shape a cached run result like the GET /analysis/:id/status response. */
export function cachedRunAsStatus(result) {
  return {
    sessionId: result.sessionId,
    projectId: result.projectId,
    projectName: result.projectName,
    status: result.status,
    runNumber: result.runNumber,
    totalDurationMs: result.totalDurationMs,
    moduleStatuses: result.moduleStatuses,
    moduleTimings: result.moduleTimings,
    error: null,
  };
}

let statefulCache = null;

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw Object.assign(new Error(data.error || 'API error'), { status: res.status, data });
  }
  return data;
}

export const api = {
  /** GET /api/health */
  health: () => fetchJSON(`${BASE}/health`),

  /**
   * Whether the backend keeps sessions in memory, i.e. whether a started
   * session can be polled. Cached after the first successful check.
   */
  isStateful: async () => {
    if (statefulCache === null) {
      try {
        const health = await fetchJSON(`${BASE}/health`);
        // Treat an older backend without the flag as stateful.
        statefulCache = health.stateful !== false;
      } catch {
        statefulCache = true;
      }
    }
    return statefulCache;
  },

  /**
   * Start an analysis using whichever path the backend supports.
   *
   * Stateful backend: start a session and let the caller poll it.
   * Serverless backend: run the whole workflow in one request and cache the
   * result, because the session cannot be polled afterwards.
   */
  startOrRun: async (projectId) => {
    if (await api.isStateful()) {
      return api.startAnalysis(projectId);
    }
    const result = await fetchJSON(`${BASE}/analysis/run`, {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    });
    cacheRunResult(result.sessionId, result);
    return { sessionId: result.sessionId, status: result.status };
  },

  /** GET /api/projects */
  listProjects: () => fetchJSON(`${BASE}/projects`),

  /** POST /api/analysis/start */
  startAnalysis: (projectId) =>
    fetchJSON(`${BASE}/analysis/start`, {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  /**
   * POST /api/analysis/run
   * Runs the whole workflow in one request and returns findings, action plan and
   * report together. This is the serverless path: the backend's in-memory store
   * does not survive between invocations, so a started session cannot be polled.
   */
  runAnalysis: (projectId) =>
    fetchJSON(`${BASE}/analysis/run`, {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    }),

  /** GET /api/analysis/:id/status */
  getStatus: (sessionId) => fetchJSON(`${BASE}/analysis/${sessionId}/status`),

  /** GET /api/analysis/:id/findings */
  getFindings: (sessionId) => fetchJSON(`${BASE}/analysis/${sessionId}/findings`),

  /** GET /api/analysis/:id/action-plan */
  getActionPlan: (sessionId) => fetchJSON(`${BASE}/analysis/${sessionId}/action-plan`),

  /** GET /api/analysis/:id/report */
  getReport: (sessionId) => fetchJSON(`${BASE}/analysis/${sessionId}/report`),

  /** POST /api/analysis/:id/remediate */
  remediate: (sessionId, remediationId, findingId) =>
    fetchJSON(`${BASE}/analysis/${sessionId}/remediate`, {
      method: 'POST',
      body: JSON.stringify({ remediationId, findingId }),
    }),

  /** POST /api/analysis/:id/reanalyze */
  reanalyze: (sessionId) =>
    fetchJSON(`${BASE}/analysis/${sessionId}/reanalyze`, { method: 'POST' }),

  // ---------------------------------------------------------------------------
  // Cache-aware readers. These serve a result produced by POST /analysis/run,
  // falling back to the per-session endpoints, which only work when the backend
  // keeps its store in memory (local development). Response shapes match the
  // endpoints they stand in for, so callers cannot tell the difference.
  // ---------------------------------------------------------------------------

  /** Status: cached run result when present, else GET /analysis/:id/status. */
  getStatusAny: (sessionId) => {
    const cached = getCachedRunResult(sessionId);
    if (cached) return Promise.resolve(cachedRunAsStatus(cached));
    return fetchJSON(`${BASE}/analysis/${sessionId}/status`);
  },

  /** Findings: cached run result when present, else GET /analysis/:id/findings. */
  getFindingsAny: (sessionId) => {
    const cached = getCachedRunResult(sessionId);
    if (cached) return Promise.resolve({ sessionId, findings: cached.findings });
    return fetchJSON(`${BASE}/analysis/${sessionId}/findings`);
  },

  /** Action plan: cached run result when present, else GET /analysis/:id/action-plan. */
  getActionPlanAny: (sessionId) => {
    const cached = getCachedRunResult(sessionId);
    if (cached) return Promise.resolve({ sessionId, actionPlan: cached.actionPlan });
    return fetchJSON(`${BASE}/analysis/${sessionId}/action-plan`);
  },

  /** Report: cached run result when present, else GET /analysis/:id/report. */
  getReportAny: (sessionId) => {
    const cached = getCachedRunResult(sessionId);
    if (cached) return Promise.resolve(cached.report);
    return fetchJSON(`${BASE}/analysis/${sessionId}/report`);
  },

  /**
   * Re-run the analysis. A serverless backend cannot build a child session, so
   * the workflow is run again and the result cached under the same session id,
   * which keeps the current view and its navigation valid.
   */
  reanalyzeAny: async (sessionId) => {
    if (await api.isStateful()) {
      return fetchJSON(`${BASE}/analysis/${sessionId}/reanalyze`, { method: 'POST' });
    }
    const cached = getCachedRunResult(sessionId);
    if (!cached) {
      throw new Error('This result is no longer available in this tab. Start a new analysis.');
    }
    const result = await fetchJSON(`${BASE}/analysis/run`, {
      method: 'POST',
      body: JSON.stringify({ projectId: cached.projectId }),
    });
    cacheRunResult(sessionId, { ...result, sessionId });
    return { sessionId, status: result.status };
  },

  /**
   * Apply an auto-fix. Only possible when the backend can write to the analysed
   * files. On the hosted deployment the sample project lives in a read-only
   * bundle, so this fails with a clear reason rather than a 404.
   */
  remediateAny: async (sessionId, remediationId, findingId) => {
    if (await api.isStateful()) {
      return fetchJSON(`${BASE}/analysis/${sessionId}/remediate`, {
        method: 'POST',
        body: JSON.stringify({ remediationId, findingId }),
      });
    }
    throw new Error(
      'Auto-fix is unavailable on the hosted deployment because the analysed ' +
      'files are in a read-only bundle. Run the backend locally to apply fixes.',
    );
  },
};
