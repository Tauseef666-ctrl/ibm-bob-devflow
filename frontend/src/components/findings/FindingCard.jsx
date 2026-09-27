import React, { useState } from 'react';
import { SeverityBadge } from './SeverityBadge';

const CATEGORY_LABELS = {
  'code-health': 'Code Health',
  'test-health': 'Test Health',
  'documentation': 'Documentation',
  'configuration': 'Configuration',
  'build-release': 'Build / Release',
};

export function FindingCard({ finding, onRemediate, remediating }) {
  const [expanded, setExpanded] = useState(false);
  const isFixed = finding.status === 'fixed';

  return (
    <div
      className="card"
      style={{
        opacity: isFixed ? 0.65 : 1,
        borderLeft: `3px solid var(--color-${isFixed ? 'pass' : finding.severity === 'critical' ? 'critical' : finding.severity === 'high' ? 'high' : finding.severity === 'medium' ? 'medium' : finding.severity === 'low' ? 'low' : 'info'})`,
        marginBottom: 'var(--space-3)',
      }}
    >
      {/* A11Y-003: use <button> so the expand toggle is keyboard-reachable */}
      <button
        aria-expanded={expanded}
        aria-controls={`finding-detail-${finding.id}`}
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
          cursor: 'pointer', width: '100%', textAlign: 'left',
          background: 'none', border: 'none', padding: 0, borderRadius: 0,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 4 }}>
            <SeverityBadge severity={finding.severity} status={finding.status} />
            <span style={{
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-subtle)',
              background: 'var(--color-surface)',
              padding: '1px 6px',
              borderRadius: 4,
              border: '1px solid var(--color-border)',
            }}>
              {CATEGORY_LABELS[finding.category] || finding.category}
            </span>
            {isFixed && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-pass)', fontWeight: 600 }}>
                ✓ Remediated
              </span>
            )}
          </div>
          <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
            {finding.title}
          </div>
          {finding.affectedFile && (
            <div style={{ marginTop: 2, fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              {finding.affectedFile}{finding.affectedLine ? `:${finding.affectedLine}` : ''}
            </div>
          )}
        </div>
        <span
          aria-hidden="true"
          style={{ color: 'var(--color-text-subtle)', fontSize: 13, flexShrink: 0, marginTop: 2 }}
        >
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div id={`finding-detail-${finding.id}`} style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Explanation
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>{finding.explanation}</p>
          </div>

          {finding.evidence && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                Evidence
              </div>
              <pre style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-3)',
                fontSize: 'var(--font-size-sm)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                color: 'var(--color-text)',
              }}>{finding.evidence}</pre>
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              Recommendation
            </div>
            <p style={{ color: 'var(--color-text)', fontSize: 'var(--font-size-base)' }}>{finding.recommendation}</p>
          </div>

          {finding.remediable && !isFixed && (
            <button
              className="btn-primary"
              aria-label={remediating ? 'Applying auto-fix…' : 'Apply auto-fix for this finding'}
              onClick={(e) => { e.stopPropagation(); onRemediate(finding); }}
              disabled={remediating}
              style={{ marginTop: 'var(--space-2)', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}
            >
              {remediating ? (
                <><span className="spinner" style={{ width: 11, height: 11, borderWidth: 2 }} /> Applying fix…</>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="8,1 4,7 7,7 6,13 10,7 7,7 8,1" />
                  </svg>
                  Apply Auto-Fix
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
