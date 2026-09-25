import React, { useState } from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { FindingsPage } from './pages/FindingsPage';
import { ActionPlanPage } from './pages/ActionPlanPage';
import { ReportPage } from './pages/ReportPage';

function AnalysisRoutes({ setActiveSession, activeSession }) {
  const { id } = useParams();
  return (
    <Routes>
      <Route index element={<AnalysisPage sessionId={id} onSessionStart={setActiveSession} />} />
      <Route path="findings" element={<FindingsPage sessionId={id} />} />
      <Route path="action-plan" element={<ActionPlanPage sessionId={id} />} />
      <Route path="report" element={<ReportPage sessionId={id} />} />
    </Routes>
  );
}

export default function App() {
  const [activeSession, setActiveSession] = useState(null);

  return (
    <>
      <Header sessionId={activeSession} />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={<DashboardPage onSessionStart={setActiveSession} />}
          />
          <Route
            path="/analysis/:id/*"
            element={
              <AnalysisRoutes
                setActiveSession={setActiveSession}
                activeSession={activeSession}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
