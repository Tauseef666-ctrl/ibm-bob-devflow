import React, { useState, useEffect } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { FindingsPage } from './pages/FindingsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { ReportPage } from './pages/ReportPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ToastProvider } from './components/ui/Toast';

const LAST_SESSION_KEY = 'devflow_last_session';

/**
 * Sync the active session from the URL param so that all analysis sub-pages
 * (findings, action-plan, report) correctly populate the header nav even on
 * direct URL access or browser refresh.
 */
function AnalysisRoutes({ setActiveSession }) {
  const { id } = useParams();

  // Whenever this route subtree mounts or the :id changes, tell App which
  // session is active so the Header shows navigation links.
  useEffect(() => {
    if (id) setActiveSession(id);
  }, [id, setActiveSession]);

  return (
    <Routes>
      <Route index element={<AnalysisPage sessionId={id} onSessionStart={setActiveSession} />} />
      <Route path="findings" element={<FindingsPage sessionId={id} />} />
      <Route path="action-plan" element={<ActionPlanPage sessionId={id} />} />
      <Route path="report" element={<ReportPage sessionId={id} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  const [activeSession, setActiveSession] = useState(() => {
    // Hydrate from localStorage so the header nav is visible immediately on
    // refresh / direct URL access before any route-level effect fires.
    return localStorage.getItem(LAST_SESSION_KEY) || null;
  });

  return (
    <ErrorBoundary>
      <ToastProvider>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header sessionId={activeSession} />
        <main id="main-content" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<DashboardPage onSessionStart={setActiveSession} />} />
            <Route
              path="/analysis/:id/*"
              element={<AnalysisRoutes setActiveSession={setActiveSession} />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer style={{
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-4) var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-subtle)',
          background: 'var(--color-surface)',
        }}>
          <span><span aria-hidden="true">⚡</span> DevFlow AI — IBM Bob 2.0 Hackathon</span>
          <span>Built by The7th Neo</span>
        </footer>
      </ToastProvider>
    </ErrorBoundary>
  );
}
