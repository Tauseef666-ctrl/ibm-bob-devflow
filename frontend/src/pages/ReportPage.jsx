import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const STATUS_CONFIG = {
  'ready':           { label: '✓ Release Ready',       bg: 'var(--color-pass-bg)',     border: '#bbf7d0',                       color: 'var(--color-pass)' },
  'needs-attention': { label: '⚠ Needs Attention',     bg: 'var(--color-medium-bg)',   border: 'var(--color-medium-border)',    color: 'var(--color-medium)' },
  'not-ready':       { label: '✗ Not Release Ready',   bg: 'var(--color-critical-bg)', border: 'var(--color-critical-border)',  color: 'var(--color-critical)' },
};

const CATEGORY_STATUS_CONFIG = {
  pass: { label: '✓ Pass', cls: 'badge-pass' },
  warn: { label: '⚠ Warn', cls: 'badge-warn' },
  fail: { label: '✗ Fail', cls: 'badge-fail' },
};

export function ReportPage({ sessionId }) {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => {
    api.getReport(sessionId)
      .then(data => {
        if (data.status) {
          setError('Analysis not yet complete. Status: ' + data.status);
        } else {
          setReport(data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  async function handleReanalyze() {
    setReanalyzing(true);
    try {
      const { sessionId: newId } = await api.reanalyze(sessionId);
      navigate(`/analysis/${newId}`);
    } catch (err) {
      alert('Re-analysis failed: ' + err.message);
      setReanalyzing(false);
    }
  }

  const formatMs = (ms) => {
    if (!ms) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatDate = (epoch) => {
    if (!epoch) return '—';
    return new Date(epoch).toLocaleTimeString();
  };

  if (loading) return <div style={{ padding: 'var(--space-8)', color: 'var(--color-text-muted)' }}>Loading report…</div>;

  if (error) return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ padding: 'var(--space-4)', background: 'var(--color-medium-bg)', border: '1px solid var(--color-medium-border)', borderRadius: 'var(--radius)', color: 'var(--color-medium)' }}>
        {error}
      </div>
      <button className="btn-secondary" onClick={() => navigate(-1)} style={{ marginTop: 'var(--space-4)' }}>← Back</button>
    </div>
  );

  const statusCfg = STATUS_CONFIG[report.overallStatus] || STATUS_CONFIG['needs-attention'];
  const { scoreSummary, categoryResults, beforeAfter, workflowTimeline } = report;

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>Release Readiness Report</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            Run #{report.runNumber} · Generated {formatDate(report.generatedAt)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn-ghost" onClick={handleReanalyze} disabled={reanalyzing}>
            {reanalyzing ? 'Starting…' : '↺ Re-analyze'}
          </button>
        </div>
      </div>

      {/* Overall status banner */}
      <div style={{
        padding: 'var(--space-5)',
        background: statusCfg.bg,
        border: `1px solid ${statusCfg.border}`,
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-8)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
      }}>
        <div style={{ fontSize: 32 }}>
          {report.overallStatus === 'ready' ? '✅' : report.overallStatus === 'needs-attention' ? '⚠️' : '🚫'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)', color: statusCfg.color }}>
            {statusCfg.label}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {scoreSummary.total} open findings ·
            {scoreSummary.critical > 0 && ` ${scoreSummary.critical} critical,`}
            {scoreSummary.high > 0 && ` ${scoreSummary.high} high,`}
            {` ${scoreSummary.medium} medium, ${scoreSummary.low} low`}
            {scoreSummary.fixed > 0 && ` · ${scoreSummary.fixed} fixed`}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>

        {/* Score summary */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)' }}>Score Summary</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <tbody>
              {[
                { label: 'Critical', key: 'critical', cls: 'badge-critical' },
                { label: 'High', key: 'high', cls: 'badge-high' },
                { label: 'Medium', key: 'medium', cls: 'badge-medium' },
                { label: 'Low', key: 'low', cls: 'badge-low' },
                { label: 'Info', key: 'info', cls: 'badge-info' },
                { label: 'Fixed', key: 'fixed', cls: 'badge-fixed' },
                { label: 'Total Open', key: 'total', cls: null },
              ].map(({ label, key, cls }) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '6px 0', color: 'var(--color-text-muted)' }}>{label}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600 }}>
                    {cls
                      ? <span className={`badge ${cls}`}>{scoreSummary[key]}</span>
                      : <strong>{scoreSummary[key]}</strong>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Category results */}
        <div className="card">
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)' }}>Category Results</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {(categoryResults || []).map(cat => {
              const cfg = CATEGORY_STATUS_CONFIG[cat.status] || CATEGORY_STATUS_CONFIG.warn;
              return (
                <div key={cat.category} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <span className={`badge ${cfg.cls}`} style={{ minWidth: 64 }}>{cfg.label}</span>
                  <span style={{ fontWeight: 500, flex: 1 }}>{cat.label}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-subtle)' }}>
                    {cat.findingCount} finding{cat.findingCount !== 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Before / After comparison */}
      {beforeAfter && (
        <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-4)' }}>
            Before vs After (Run 1 → Run {report.runNumber})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
            {[
              { label: 'Run 1 Findings', value: beforeAfter.run1FindingCount, color: 'var(--color-high)' },
              { label: `Run ${report.runNumber} Findings`, value: beforeAfter.run2FindingCount, color: 'var(--color-accent)' },
              { label: 'Fixed', value: beforeAfter.fixedCount, color: 'var(--color-pass)' },
              { label: 'Remaining', value: beforeAfter.remainingCount, color: 'var(--color-medium)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
                  {value}
                </div>
                <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Timeline */}
      {workflowTimeline && workflowTimeline.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
          <h2 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
            Workflow Timeline
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)', marginBottom: 'var(--space-4)' }}>
            Actual wall-clock durations recorded during this analysis run.
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em' }}>Module</th>
                <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em' }}>Duration</th>
                <th style={{ textAlign: 'right', padding: '6px 0', color: 'var(--color-text-subtle)', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em' }}>Started</th>
              </tr>
            </thead>
            <tbody>
              {workflowTimeline.map((step, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '8px 0', fontWeight: 500 }}>
                    {step.step.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-accent)' }}>
                    {formatMs(step.durationMs)}
                  </td>
                  <td style={{ padding: '8px 0', textAlign: 'right', color: 'var(--color-text-subtle)', fontFamily: 'var(--font-mono)' }}>
                    {formatDate(step.startedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
        <button className="btn-secondary" onClick={() => navigate(`/analysis/${sessionId}/findings`)}>
          ← Back to Findings
        </button>
        <button className="btn-secondary" onClick={() => navigate(`/analysis/${sessionId}/action-plan`)}>
          ← Action Plan
        </button>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          New Analysis
        </button>
      </div>
    </div>
  );
}
