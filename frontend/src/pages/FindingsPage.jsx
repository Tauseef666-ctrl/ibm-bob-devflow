import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { FindingCard } from '../components/findings/FindingCard';
import { useToast } from '../components/ui/Toast';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'code-health', label: 'Code Health' },
  { key: 'test-health', label: 'Test Health' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'configuration', label: 'Configuration' },
  { key: 'build-release', label: 'Build / Release' },
];

const SEVERITIES = ['all', 'critical', 'high', 'medium', 'low', 'info'];

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

const STATUSES = [
  { key: 'open', label: 'Open' },
  { key: 'fixed', label: 'Fixed' },
  { key: 'all', label: 'All' },
];

const SORTS = [
  { key: 'severity', label: 'Severity' },
  { key: 'category', label: 'Category' },
  { key: 'file', label: 'File' },
];

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconCheck({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,14 11,21 24,7" />
    </svg>
  );
}
function IconX({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="6" />
      <line x1="4.5" y1="4.5" x2="9.5" y2="9.5" />
      <line x1="9.5" y1="4.5" x2="4.5" y2="9.5" />
    </svg>
  );
}
function IconSearch({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="6" cy="6" r="4.25" />
      <line x1="9.2" y1="9.2" x2="13" y2="13" />
    </svg>
  );
}
function IconBolt({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="8,1 4,7 7,7 6,13 10,7 7,7 8,1" />
    </svg>
  );
}

export function FindingsPage({ sessionId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remediating, setRemediating] = useState(null);

  // Filters live in the URL so a filtered view can be linked or reloaded.
  const activeCategory = searchParams.get('category') || 'all';
  const activeSeverity = searchParams.get('severity') || 'all';
  const activeStatus   = searchParams.get('status') || 'all';
  const activeSort     = searchParams.get('sort') || 'severity';
  const query          = searchParams.get('q') || '';
  const onlyAutoFix    = searchParams.get('autofix') === '1';

  const setParam = useCallback((key, value, defaultValue) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!value || value === defaultValue) next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const loadFindings = useCallback(async () => {
    try {
      const data = await api.getFindings(sessionId);
      setFindings(data.findings || []);
      setError(null);
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
      toast.success(`Auto-fix applied: ${finding.title}`);
    } catch (err) {
      toast.error(`Auto-fix failed: ${err.message}`);
    } finally {
      setRemediating(null);
    }
  }

  const counts = useMemo(() => ({
    all: findings.length,
    critical: findings.filter(f => f.severity === 'critical' && f.status !== 'fixed').length,
    high: findings.filter(f => f.severity === 'high' && f.status !== 'fixed').length,
    medium: findings.filter(f => f.severity === 'medium' && f.status !== 'fixed').length,
    low: findings.filter(f => f.severity === 'low' && f.status !== 'fixed').length,
    info: findings.filter(f => f.severity === 'info').length,
    fixed: findings.filter(f => f.status === 'fixed').length,
    open: findings.filter(f => f.status !== 'fixed').length,
    autoFixable: findings.filter(f => f.remediable && f.status !== 'fixed').length,
  }), [findings]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = findings.filter(f => {
      if (activeCategory !== 'all' && f.category !== activeCategory) return false;
      if (activeSeverity !== 'all' && f.severity !== activeSeverity) return false;
      if (activeStatus === 'open' && f.status === 'fixed') return false;
      if (activeStatus === 'fixed' && f.status !== 'fixed') return false;
      if (onlyAutoFix && !f.remediable) return false;
      if (needle) {
        const haystack = [f.title, f.explanation, f.recommendation, f.affectedFile, f.category]
          .filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    const sorted = [...result];
    sorted.sort((a, b) => {
      if (activeSort === 'file') {
        return (a.affectedFile || 'zzz').localeCompare(b.affectedFile || 'zzz');
      }
      if (activeSort === 'category') {
        const byCat = a.category.localeCompare(b.category);
        if (byCat !== 0) return byCat;
      }
      return (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9);
    });
    return sorted;
  }, [findings, activeCategory, activeSeverity, activeStatus, onlyAutoFix, query, activeSort]);

  const filtersActive =
    activeCategory !== 'all' || activeSeverity !== 'all' || activeStatus !== 'all' ||
    onlyAutoFix || query.trim() !== '';

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      {/* Header — flex-wrap so buttons stack on mobile */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Findings</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
            {findings.length} finding{findings.length !== 1 ? 's' : ''} detected
            {counts.fixed > 0 && <> · <span style={{ color: 'var(--color-pass)' }}>{counts.fixed} fixed</span></>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate(`/analysis/${sessionId}/action-plan`)}>
            Action Plan →
          </button>
          <button className="btn-secondary" style={{ fontSize: 13 }} onClick={() => navigate(`/analysis/${sessionId}/report`)}>
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
              onClick={() => setParam('category', cat.key, 'all')}
              aria-current={activeCategory === cat.key}
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

      {/* ── Toolbar: search, status, auto-fix, sort ── */}
      <div style={{
        display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div className="search-wrap" style={{ flex: '1 1 220px', minWidth: 180 }}>
          <span className="search-icon"><IconSearch /></span>
          <input
            className="input"
            type="search"
            value={query}
            placeholder="Search title, explanation, file…"
            aria-label="Search findings"
            onChange={e => setParam('q', e.target.value, '')}
          />
          {query && (
            <button className="search-clear" onClick={() => setParam('q', '', '')} aria-label="Clear search">
              &times;
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {STATUSES.map(s => {
            const cnt = s.key === 'all' ? counts.all : counts[s.key];
            const active = activeStatus === s.key;
            return (
              <button
                key={s.key}
                className={`chip ${active ? 'chip-active' : ''}`}
                aria-pressed={active}
                onClick={() => setParam('status', s.key, 'all')}
              >
                {s.label} ({cnt})
              </button>
            );
          })}
        </div>

        <button
          className={`chip ${onlyAutoFix ? 'chip-active' : ''}`}
          aria-pressed={onlyAutoFix}
          disabled={counts.autoFixable === 0}
          onClick={() => setParam('autofix', onlyAutoFix ? '' : '1', '')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          title="Show only findings DevFlow can fix automatically"
        >
          <IconBolt /> Auto-fixable ({counts.autoFixable})
        </button>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          Sort
          <select
            className="input"
            value={activeSort}
            aria-label="Sort findings"
            onChange={e => setParam('sort', e.target.value, 'severity')}
          >
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {/* Result count + clear */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8, marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-subtle)', flexWrap: 'wrap',
      }}>
        <span>
          Showing <strong style={{ color: 'var(--color-text-muted)' }}>{filtered.length}</strong>
          {' '}of {findings.length}
        </span>
        {filtersActive && (
          <button
            className="btn-ghost"
            style={{ fontSize: 'var(--font-size-xs)', padding: '3px 10px' }}
            onClick={resetFilters}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Severity filter — with count per severity */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        {SEVERITIES.map(sev => {
          const cnt = sev === 'all' ? findings.length : (counts[sev] ?? 0);
          const active = activeSeverity === sev;
          return (
            <button
              key={sev}
              className={`chip ${active ? 'chip-active' : ''}`}
              aria-pressed={active}
              onClick={() => setParam('severity', sev, 'all')}
            >
              {sev === 'all' ? 'All' : sev} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Error state — structured */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16,
          background: 'var(--color-critical-bg)', border: '1px solid var(--color-critical-border)',
          borderRadius: 'var(--radius)', padding: '12px 14px',
        }}>
          <IconX size={14} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-critical)' }}>Failed to load findings</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{error}</div>
          </div>
        </div>
      )}

      {loading ? (
        /* Loading state — spinner */
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--color-text-muted)', fontSize: 13, padding: '24px 0' }}>
          <span className="spinner" />
          Loading findings…
        </div>
      ) : filtered.length === 0 ? (
        /* Empty state — SVG icon, no emoji */
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          background: 'var(--color-surface)', border: '1px dashed var(--color-border)',
          borderRadius: 'var(--radius-lg)', color: 'var(--color-text-muted)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10, color: 'var(--color-pass)' }}>
            <IconCheck size={32} />
          </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--color-pass)' }}>
            {findings.length === 0
              ? 'No findings detected'
              : filtered.length === 0
                ? 'No findings match these filters'
                : 'Nothing to show'}
          </div>
          <p style={{ fontSize: 13 }}>
            {findings.length === 0
              ? 'The project looks clean!'
              : filtersActive
                ? 'Try widening or clearing the filters.'
                : 'Try a different category or severity filter.'}
          </p>
        </div>
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
