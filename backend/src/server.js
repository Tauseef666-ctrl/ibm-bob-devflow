const express = require('express');
const cors = require('cors');
const analysisRouter = require('./routes/analysis');
const findingsRouter = require('./routes/findings');
const actionPlanRouter = require('./routes/actionPlan');
const reportRouter = require('./routes/report');
const remediationRouter = require('./routes/remediation');

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'devflow-ai-backend', timestamp: Date.now() });
});

// Routes
app.use('/api', analysisRouter);
app.use('/api/analysis/:id/findings', findingsRouter);
app.use('/api/analysis/:id/action-plan', actionPlanRouter);
app.use('/api/analysis/:id/report', reportRouter);
app.use('/api/analysis/:id/remediate', remediationRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, _next) => {
  console.error('[server error]', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
