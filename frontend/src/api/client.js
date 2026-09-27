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

  /** GET /api/projects */
  listProjects: () => fetchJSON(`${BASE}/projects`),

  /** POST /api/analysis/start */
  startAnalysis: (projectId) =>
    fetchJSON(`${BASE}/analysis/start`, {
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
};
