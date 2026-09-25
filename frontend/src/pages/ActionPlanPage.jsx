import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { SeverityBadge } from '../components/findings/SeverityBadge';

const EFFORT_LABELS = { low: '● Low', medium: '◆ Medium', high: '▲ High' };
const EFFORT_COLORS = {
  low: { bg: 'var(--color-pass-bg)', color: 'var(--color-pass)', border: '#bbf7d0' },
  medium: { bg: 'var(--color-medium-bg)', color: 'var(--color-medium)', border: 'var(--color-medium-border)' },
  high: { bg: 'var(--color-high-bg)', color: 'var(--color-high)', border: 'var(--color-high-border)' },
};

export function ActionPlanPage({ sessionId }) {
  const navigate = useNavigate();
  const [plan, setPlan] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remediating, setRemediating] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [planData, findingsData] = await Promise.all([
        api.getActionPlan(sessionId),
        api.getFindings(sessionId),
      ]);
      setPlan(planData.actionPlan || []);
      setFindings(findingsData.findings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { load(); }, [load]);

  async function handleRemediate(item) {
    setRemediating(item.id);
    try {
      // Apply all remediable findings in this plan item
      const remediableFindings = item.findingIds
        .map(id => findings.find(f => f.id === id))
        .filter(f => f && f.remediable && f.status !== 'fixed');

      for (const finding of remediableFindings) {
        await api.remediate(sessionId, finding.remediationId, finding.id);
      }
      await load();
    } catch (err) {
      alert('Remediation failed: ' + err.message);
    } finally {
      setRemediating(null);
    }
  }

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

  const automatedCount = plan.filter(item => item.automated).length;
  const openCount = plan.filter(item => {
    return item.findingIds.some(id => {
      const f = findings.find(f => f.id === id);
      return f && f.status !== 'fixed';
    });
  }).length;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>Action Plan</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {plan.length} items · {automatedCount} with available auto-fix · {openCount} open
          </p>
        </div>
        <button
          className="btn-ghost"
          onClick={handleReanalyze}
          disabled={reanalyzing}
        >
          {reanalyzing ? 'Starting re-analysis…' : '↺ Re-analyze Project'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--color-critical)', padding: 'var(--space-4)', background: 'var(--color-critical-bg)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading action plan…</p>
      ) : plan.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
          <p>No action items. The project looks good!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {plan.map(item => {
            const effortStyle = EFFORT_COLORS[item.effort] || EFFORT_COLORS.medium;
            const itemFindings = item.findingIds.map(id => findings.find(f => f.id === id)).filter(Boolean);
            const allFixed = itemFindings.every(f => f.status === 'fixed');
            const hasOpen = itemFindings.some(f => f && f.remediable && f.status !== 'fixed');

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  opacity: allFixed ? 0.6 : 1,
                  borderLeft: `3px solid ${allFixed ? 'var(--color-pass)' : 'var(--color-border)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                  {/* Priority badge */}
                  <div style={{
                    minWidth: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: allFixed ? 'var(--color-pass-bg)' : 'var(--color-surface)',
                    border: `1px solid ${allFixed ? '#bbf7d0' : 'var(--color-border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 'var(--font-size-sm)',
                    color: allFixed ? 'var(--color-pass)' : 'var(--color-text)',
                    flexShrink: 0,
                  }}>
                    {allFixed ? '✓' : item.priority}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
                      <SeverityBadge severity={item.severity} status={allFixed ? 'fixed' : 'open'} />
                      <span style={{
                        fontSize: 'var(--font-size-xs)',
                        padding: '1px 7px',
                        borderRadius: 20,
                        background: effortStyle.bg,
                        color: effortStyle.color,
                        border: `1px solid ${effortStyle.border}`,
                        fontWeight: 600,
                      }}>
                        {EFFORT_LABELS[item.effort]} effort
                      </span>
                      {item.automated && !allFixed && (
                        <span className="badge" style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', border: '1px solid #bfdbfe', fontSize: 11 }}>
                          ⚡ Auto-fix available
                        </span>
                      )}
                      {allFixed && (
                        <span className="badge badge-pass" style={{ fontSize: 11 }}>✓ Resolved</span>
                      )}
                    </div>

                    <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', marginBottom: 'var(--space-2)' }}>
                      {item.title}
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
                      {item.rationale}
                    </p>

                    {/* Linked findings */}
                    {itemFindings.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                        {itemFindings.slice(0, 4).map(f => f && (
                          <span key={f.id} style={{
                            fontSize: 11,
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 4,
                            padding: '1px 6px',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--color-text-muted)',
                            textDecoration: f.status === 'fixed' ? 'line-through' : 'none',
                          }}>
                            {f.affectedFile ? f.affectedFile.split('/').pop() : f.category}
                          </span>
                        ))}
                        {itemFindings.length > 4 && (
                          <span style={{ fontSize: 11, color: 'var(--color-text-subtle)' }}>+{itemFindings.length - 4} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  {hasOpen && item.automated && (
                    <button
                      className="btn-primary"
                      onClick={() => handleRemediate(item)}
                      disabled={remediating === item.id}
                      style={{ flexShrink: 0, fontSize: 'var(--font-size-sm)' }}
                    >
                      {remediating === item.id ? 'Fixing…' : '⚡ Apply Fix'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
