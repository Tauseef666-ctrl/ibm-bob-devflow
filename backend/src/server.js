const express = require('express');
const cors = require('cors');
const analysisRouter = require('./routes/analysis');
const findingsRouter = require('./routes/findings');
const actionPlanRouter = require('./routes/actionPlan');
const reportRouter = require('./routes/report');
const remediationRouter = require('./routes/remediation');

const app = express();

// Middleware
// FRONTEND_URL accepts a comma-separated list so the standalone Vercel frontend
// and the combined single-origin deployment can both be allowed. A single
// allowed origin returned 500 rather than a CORS rejection when the other
// frontend called the API, because the cors callback rejects with an error.
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
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
