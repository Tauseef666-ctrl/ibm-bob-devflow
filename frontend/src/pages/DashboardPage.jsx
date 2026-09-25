import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const MANUAL_STEPS = [
  { step: 'Open terminal, run npm test', note: 'Read output manually' },
  { step: 'Grep source for TODO/FIXME', note: 'Context-switch to editor' },
  { step: 'Open README, check completeness', note: 'Subjective judgment' },
  { step: 'Inspect package.json fields', note: 'Know what to look for' },
  { step: 'Check .gitignore exists', note: 'Easy to forget' },
  { step: 'Check .env.example exists', note: 'Often missing' },
  { step: 'Run npm install, check errors', note: 'Separate terminal' },
  { step: 'Mentally aggregate all findings', note: 'Error-prone, no record' },
  { step: 'Decide priority, write notes', note: 'Undocumented' },
];

const DEVFLOW_STEPS = [
  { step: 'Select project', note: 'One click' },
  { step: 'All 5 modules run automatically', note: 'Coordinated pipeline' },
  { step: 'Findings aggregated & deduplicated', note: 'Structured data' },
  { step: 'Severity assigned, plan generated', note: 'Prioritized for you' },
  { step: 'Apply safe auto-fixes', note: 'One click per fix' },
  { step: 'Re-analyze to verify', note: 'Before/after comparison' },
  { step: 'Release Readiness Report', note: 'Shareable record' },
];

export function DashboardPage({ onSessionStart }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listProjects()
      .then(data => setProjects(data))
      .catch(() => setError('Could not connect to backend. Is it running on port 3001?'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStart(projectId) {
    setStarting(true);
    setError(null);
    try {
      const { sessionId } = await api.startAnalysis(projectId);
      onSessionStart(sessionId);
      navigate(`/analysis/${sessionId}`);
    } catch (err) {
      setError(err.message);
      setStarting(false);
    }
  }

  return (
    <div style={{ maxWidth: 'var(--content-max)', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>

      {/* Hero */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginBottom: 'var(--space-3)',
        }}>
          DevFlow AI
        </h1>
        <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-muted)', maxWidth: 600 }}>
          Automated release-readiness and maintenance analysis for Node.js projects.
          Replace manual checklists with a single coordinated workflow.
        </p>
      </div>

      {/* Before vs After */}
      <div style={{ marginBottom: 'var(--space-10)' }}>
        <h2 className="section-title">Before vs After</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          {/* Manual */}
          <div className="card" style={{ borderTop: '3px solid var(--color-critical)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
              😓 Manual Workflow
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
              9 isolated steps • no unified record • easy to miss items
            </p>
            <ol style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {MANUAL_STEPS.map((item, i) => (
                <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  <span style={{ fontWeight: 500 }}>{item.step}</span>
                  <span style={{ color: 'var(--color-text-subtle)', marginLeft: 6 }}>— {item.note}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* DevFlow */}
          <div className="card" style={{ borderTop: '3px solid var(--color-pass)' }}>
            <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--color-text)' }}>
              ⚡ DevFlow Workflow
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-subtle)', marginBottom: 'var(--space-3)' }}>
              1 coordinated workflow • prioritized findings • shareable report
            </p>
            <ol style={{ paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {DEVFLOW_STEPS.map((item, i) => (
                <li key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                  <span style={{ fontWeight: 500 }}>{item.step}</span>
                  <span style={{ color: 'var(--color-pass)', marginLeft: 6 }}>— {item.note}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Project selection */}
      <div>
        <h2 className="section-title">Select a Project to Analyze</h2>

        {error && (
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--color-critical-bg)',
            border: '1px solid var(--color-critical-border)',
            borderRadius: 'var(--radius)',
            color: 'var(--color-critical)',
            marginBottom: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
          }}>
            ⚠ {error}
          </div>
        )}

        {loading && (
          <p style={{ color: 'var(--color-text-muted)' }}>Connecting to DevFlow backend…</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {projects.map(project => (
            <div key={project.id} className="card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-6)',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{project.name}</span>
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    padding: '1px 6px',
                    borderRadius: 4,
                    color: 'var(--color-text-muted)',
                  }}>
                    {project.language}
                  </span>
                  <span style={{
                    fontSize: 'var(--font-size-xs)',
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    padding: '1px 6px',
                    borderRadius: 4,
                    color: '#c2410c',
                    fontWeight: 600,
                  }}>
                    Demo Project
                  </span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
                  {project.description}
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleStart(project.id)}
                disabled={starting}
                style={{ flexShrink: 0, fontSize: 'var(--font-size-md)', padding: 'var(--space-3) var(--space-6)' }}
              >
                {starting ? 'Starting…' : '▶ Start Analysis'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
