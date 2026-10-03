import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import analyzeRouter from './src/routes/analyze.js';
import telemetryRouter from './src/routes/telemetry.js';
import samplesRouter from './src/routes/samples.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/samples', samplesRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PhishGuard AI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve static client assets in production
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// Fallback for client-side SPA routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      status: 'error',
      message: `API endpoint ${req.path} not found.`
    });
  }

  const indexPath = path.resolve(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(500).send('Frontend build not found. Please run npm run build.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal security engine error. Please try again later.'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🛡️  PHISHGUARD AI SERVER STARTED ON http://${HOST}:${PORT}`);
  console.log(`🔗  Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔗  Sample Scenarios: http://${HOST}:${PORT}/api/samples`);
  console.log(`====================================================`);
});
