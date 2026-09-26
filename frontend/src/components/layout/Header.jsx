import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

/**
 * Polls the health endpoint so a dead backend is visible in the header rather
 * than only as a failed request on whichever page happens to be open.
 */
function useApiHealth(intervalMs = 20000) {
  const [state, setState] = useState('checking');

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        await api.health();
        if (!cancelled) setState('online');
      } catch {
        if (!cancelled) setState('offline');
      }
    }

    check();
    const id = setInterval(check, intervalMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [intervalMs]);

  return state;
}

const HEALTH_COPY = {
  checking: 'Checking API…',
  online:   'API connected',
  offline:  'API unreachable',
};

export function Header({ sessionId }) {
  const navigate = useNavigate();
  const health = useApiHealth();

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'var(--color-text)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-6)',
      gap: 'var(--space-6)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }}>
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: 22 }}>⚡</span>
        <span style={{
          fontWeight: 700,
          fontSize: 'var(--font-size-md)',
          letterSpacing: '-0.02em',
        }}>
          DevFlow AI
        </span>
        <span style={{
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(255,255,255,0.5)',
          marginLeft: 4,
          background: 'rgba(255,255,255,0.1)',
          padding: '1px 6px',
          borderRadius: 4,
        }}>
          Release Readiness
        </span>
      </div>

      <span
        title={HEALTH_COPY[health]}
        aria-label={HEALTH_COPY[health]}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(255,255,255,0.55)',
          marginLeft: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <span className={`status-dot status-dot-${health}`} />
        <span style={{ display: 'none' }}>{HEALTH_COPY[health]}</span>
      </span>

      {sessionId && (
        <nav style={{ display: 'flex', gap: 'var(--space-1)' }}>
          {[
            { to: `/analysis/${sessionId}`, label: 'Progress' },
            { to: `/analysis/${sessionId}/findings`, label: 'Findings' },
            { to: `/analysis/${sessionId}/action-plan`, label: 'Action Plan' },
            { to: `/analysis/${sessionId}/report`, label: 'Report' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius)',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
