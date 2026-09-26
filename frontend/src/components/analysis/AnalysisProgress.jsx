import React, { useEffect, useState } from 'react';

const MODULE_LABELS = {
  'code-health': 'Code Health',
  'test-health': 'Test Health',
  'documentation': 'Documentation',
  'configuration': 'Configuration',
  'build-release': 'Build / Release',
};

const STATUS_STYLES = {
  pending:   { color: 'var(--color-text-subtle)', bg: 'var(--color-surface)', dot: 'var(--color-border)' },
  running:   { color: 'var(--color-accent)',       bg: 'var(--color-accent-light)', dot: 'var(--color-accent)' },
  completed: { color: 'var(--color-pass)',         bg: 'var(--color-pass-bg)', dot: 'var(--color-pass)' },
  failed:    { color: 'var(--color-critical)',     bg: 'var(--color-critical-bg)', dot: 'var(--color-critical)' },
};

const MODULE_ICONS = {
  'code-health':     <><path d="M1 3h3l1.2 2M6 3l1.6 3.4a1.6 1.6 0 1 1-2.6 1.8L6 3z" /><circle cx="2" cy="3" r="1.3" /><circle cx="6.5" cy="9.5" r="1.1" /></>,
  'test-health':     <><path d="M4.5 1v3.2L1.8 10a1.2 1.2 0 0 0 1 1.8h5.4a1.2 1.2 0 0 0 1-1.8L6.5 4.2V1" /><path d="M3.4 1h4.2" /><path d="M3.6 7.6h3.8" /></>,
  'documentation':   <><path d="M2.5 1h4l2 2v7h-6z" /><path d="M6.5 1v2h2" /><path d="M4 6h3M4 8h3" /></>,
  'configuration':   <><circle cx="5" cy="5" r="2.1" /><path d="M5 .8v1.4M5 7.8v1.4M.8 5h1.4M7.8 5h1.4M2.1 2.1l1 1M6.9 6.9l1 1M7.9 2.1l-1 1M3.1 6.9l-1 1" /></>,
  'build-release':   <><path d="M5 1.2c1.7 1.7 2.6 3.1 2.6 4.2A2.6 2.6 0 0 1 5 8a2.6 2.6 0 0 1-2.6-2.6c0-1.1.9-2.5 2.6-4.2z" /><path d="M2 8.4c-.6.6-.9 1.1-.9 1.5a1 1 0 0 0 2 0c0-.4-.4-.9-1.1-1.5zM9 8.4c.6.6.9 1.1.9 1.5a1 1 0 0 1-2 0c0-.4.4-.9 1.1-1.5z" /></>,
};

function ModuleIcon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor"
         strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {MODULE_ICONS[name]}
    </svg>
  );
}

function formatElapsed(ms) {
  if (ms == null || ms < 0) return '—';
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${String(Math.floor(s % 60)).padStart(2, '0')}s`;
}

/** Ticks once a second so a running analysis shows movement between polls. */
function useNow(active) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function AnalysisProgress({ session }) {
  const moduleStatuses = session?.moduleStatuses || {};
  const moduleTimings = session?.moduleTimings || {};
  const keys = Object.keys(MODULE_LABELS);
  const done = keys.filter(k => moduleStatuses[k] === 'completed').length;
  const failed = keys.some(k => moduleStatuses[k] === 'failed');
  const allDone = done === keys.length;
  const pct = Math.round((done / keys.length) * 100);

  const running = !allDone && !failed;
  const now = useNow(running);
  const elapsed = session?.startedAt
    ? ((session.completedAt || now) - session.startedAt)
    : null;

  if (!session) return null;

  return (
    <div>
      {/* ── Overall progress ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginBottom: 8, fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)',
      }}>
        <span style={{ fontWeight: 600 }}>
          {allDone ? 'All modules complete' : failed ? 'Analysis failed' : `Running ${done + 1} of ${keys.length}`}
        </span>
        <span className="text-mono">
          {formatElapsed(elapsed)}
          {session.totalDurationMs ? ` · total ${formatElapsed(session.totalDurationMs)}` : ''}
        </span>
      </div>
      <div className="progress-track" style={{ marginBottom: 'var(--space-4)' }}>
        <div
          className={`progress-fill ${allDone ? 'progress-fill-done' : ''}`}
          style={{ width: `${failed ? 100 : pct}%` }}
        />
      </div>

      {/* ── Per-module rows ── */}
      {keys.map(key => {
        const status = moduleStatuses[key] || 'pending';
        const timing = moduleTimings[key];
        const style = STATUS_STYLES[status] || STATUS_STYLES.pending;

        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-2)',
              background: style.bg,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              transition: 'background 0.3s',
            }}
          >
            <span style={{ color: style.color, display: 'flex', minWidth: 20 }} aria-hidden="true">
              <ModuleIcon name={key} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: 13 }}>{MODULE_LABELS[key]}</div>
              {timing && (
                <div className="text-mono" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', marginTop: 2 }}>
                  {formatElapsed(timing.durationMs)}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span
                className={`status-dot ${status === 'completed' ? 'status-dot-online'
                  : status === 'failed' ? 'status-dot-offline'
                  : status === 'running' ? 'status-dot-checking' : ''}`}
                style={{ background: status === 'pending' ? 'var(--color-border)' : undefined }}
              />
              <span style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: style.color,
                textTransform: 'capitalize',
              }}>
                {status}
              </span>
            </div>
          </div>
        );
      })}

      {session.error && (
        <div style={{
          marginTop: 'var(--space-3)', padding: '10px 12px',
          background: 'var(--color-critical-bg)', border: '1px solid var(--color-critical-border)',
          borderRadius: 'var(--radius)', fontSize: 'var(--font-size-sm)', color: 'var(--color-critical)',
        }}>
          {session.error}
        </div>
      )}
    </div>
  );
}
