import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { FindingCard } from '../components/findings/FindingCard';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'code-health', label: 'Code Health' },
  { key: 'test-health', label: 'Test Health' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'configuration', label: 'Configuration' },
  { key: 'build-release', label: 'Build / Release' },
];

const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low', 'info'];

export function FindingsPage({ sessionId }) {
  const navigate = useNavigate();
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSeverity, setActiveSeverity] = useState('all');
  const [remediating, setRemediating] = useState(null);

  const loadFindings = useCallback(async () => {
    try {
      const data = await api.getFindings(sessionId);
      setFindings(data.findings || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => { loadFindings(); }, [loadFindings]);

  async function handleRemediate(finding) {
    setRemediating(finding.id);
    try {
      await api.remediate(sessionId, finding.remediationId, finding.id);
      await loadFindings();
    } catch (err) {
      alert('Remediation failed: ' + err.message);
    } finally {
      setRemediating(null);
    }
  }

  const filtered = findings.filter(f => {
    if (activeCategory !== 'all' && f.category !== activeCategory) return false;
    if (activeSeverity !== 'all' && f.severity !== activeSeverity && f.status !== activeSeverity) return false;
    return true;
  });

  const counts = {
    all: findings.length,
    critical: findings.filter(f => f.severity === 'critical' && f.status !== 'fixed').length,
    high: findings.filter(f => f.severity === 'high' && f.status !== 'fixed').length,
    medium: findings.filter(f => f.severity === 'medium' && f.status !== 'fixed').length,
    low: findings.filter(f => f.severity === 'low' && f.status !== 'fixed').length,
    info: findings.filter(f => f.severity === 'info').length,
    fixed: findings.filter(f => f.status === 'fixed').length,
  };

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 4 }}>Findings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
            {findings.length} findings detected · {counts.fixed} fixed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn-secondary" onClick={() => navigate(`/analysis/${sessionId}/action-plan`)}>
            Action Plan →
          </button>
          <button className="btn-secondary" onClick={() => navigate(`/analysis/${sessionId}/report`)}>
            Report →
          </button>
        </div>
      </div>

      {/* Score summary chips */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-5)' }}>
        {[
          { key: 'critical', label: 'Critical', cls: 'badge-critical' },
          { key: 'high', label: 'High', cls: 'badge-high' },
          { key: 'medium', label: 'Medium', cls: 'badge-medium' },
          { key: 'low', label: 'Low', cls: 'badge-low' },
          { key: 'info', label: 'Info', cls: 'badge-info' },
          { key: 'fixed', label: 'Fixed', cls: 'badge-fixed' },
        ].map(({ key, label, cls }) => counts[key] > 0 && (
          <span key={key} className={`badge ${cls}`} style={{ fontSize: 12 }}>
            {counts[key]} {label}
          </span>
        ))}
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 2,
        borderBottom: '1px solid var(--color-border)',
        marginBottom: 'var(--space-5)',
        overflowX: 'auto',
      }}>
        {CATEGORIES.map(cat => {
          const catCount = cat.key === 'all'
            ? findings.length
            : findings.filter(f => f.category === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${activeCategory === cat.key ? 'var(--color-accent)' : 'transparent'}`,
                borderRadius: 0,
                color: activeCategory === cat.key ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontWeight: activeCategory === cat.key ? 600 : 400,
                padding: 'var(--space-2) var(--space-4)',
                fontSize: 'var(--font-size-sm)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {cat.label} {catCount > 0 && <span style={{ opacity: 0.7, fontSize: 11 }}>({catCount})</span>}
            </button>
          );
        })}
      </div>

      {/* Severity filter */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {SEVERITIES.map(sev => (
          <button
            key={sev}
            onClick={() => setActiveSeverity(sev)}
            className={activeSeverity === sev ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px', textTransform: 'capitalize' }}
          >
            {sev}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ color: 'var(--color-critical)', padding: 'var(--space-4)', background: 'var(--color-critical-bg)', borderRadius: 'var(--radius)', marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading findings…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 'var(--space-3)' }}>✓</div>
          <p>No findings match the current filter.</p>
        </div>
      ) : (
        <div>
          {filtered.map(finding => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onRemediate={handleRemediate}
              remediating={remediating === finding.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
