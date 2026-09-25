import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { AnalysisProgress } from '../components/analysis/AnalysisProgress';

const POLL_INTERVAL = 1500;

export function AnalysisPage({ sessionId, onSessionStart }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!sessionId) return;

    // Start elapsed timer
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 500);

    // Poll status
    async function poll() {
      try {
        const data = await api.getStatus(sessionId);
        setSession(data);
        onSessionStart && onSessionStart(sessionId);

        if (data.status === 'completed') {
          clearInterval(intervalRef.current);
          clearInterval(timerRef.current);
          // Auto-navigate to findings after brief pause
          setTimeout(() => navigate(`/analysis/${sessionId}/findings`), 1200);
        } else if (data.status === 'failed') {
          clearInterval(intervalRef.current);
          clearInterval(timerRef.current);
          setError(data.error || 'Analysis failed');
        }
      } catch (err) {
        setError(err.message);
        clearInterval(intervalRef.current);
        clearInterval(timerRef.current);
      }
    }

    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(timerRef.current);
    };
  }, [sessionId]);

  const formatMs = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Analyzing Project
        </h1>
        {session && (
          <p style={{ color: 'var(--color-text-muted)' }}>
            {session.projectName} · Run #{session.runNumber}
          </p>
        )}
      </div>

      {error && (
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-critical-bg)',
          border: '1px solid var(--color-critical-border)',
          borderRadius: 'var(--radius)',
          color: 'var(--color-critical)',
          marginBottom: 'var(--space-4)',
        }}>
          ⚠ Analysis error: {error}
        </div>
      )}

      {/* Elapsed time */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-4)',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
      }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Elapsed
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>
            {session?.status === 'completed' && session.totalDurationMs
              ? formatMs(session.totalDurationMs)
              : formatMs(elapsed)}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {session?.status === 'running' && (
            <span className="badge badge-info">● Running</span>
          )}
          {session?.status === 'completed' && (
            <span className="badge badge-pass">✓ Complete</span>
          )}
          {session?.status === 'failed' && (
            <span className="badge badge-fail">✗ Failed</span>
          )}
          {session?.status === 'pending' && (
            <span className="badge" style={{ background: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>Pending</span>
          )}
        </div>
      </div>

      <AnalysisProgress session={session} />

      {session?.status === 'completed' && (
        <div style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--color-pass-bg)',
          border: '1px solid #bbf7d0',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}>
          <span style={{ fontSize: 24 }}>✓</span>
          <div>
            <div style={{ fontWeight: 600 }}>Analysis complete in {formatMs(session.totalDurationMs)}</div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              Redirecting to findings…
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => navigate(`/analysis/${sessionId}/findings`)}
          >
            View Findings →
          </button>
        </div>
      )}
    </div>
  );
}
