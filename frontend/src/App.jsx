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
 * Sync the active session from the route param so the header nav is populated
 * on direct URL access or refresh, not only after the dashboard fires a
 * callback.
 */
function AnalysisRoutes({ setActiveSession }) {
  const { id } = useParams();

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
    // Hydrate from the key DashboardPage already writes on analysis start, so
    // the nav is correct on the first paint after a refresh.
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
