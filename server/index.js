import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import analyzeRouter from './src/routes/analyze.js';
import telemetryRouter from './src/routes/telemetry.js';
import samplesRouter from './src/routes/samples.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

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
    status: 'healthy',
    service: 'PhishGuard AI Core Engine',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve static client assets in production
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>PhishGuard AI API Server</title></head>
            <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center;">
              <h1>🛡️ PhishGuard AI Backend Running</h1>
              <p>Backend API is active on port ${PORT}. Client interface is starting or running via Vite dev server.</p>
              <p><a href="/api/health" style="color: #38bdf8;">Check /api/health</a> | <a href="/api/samples" style="color: #38bdf8;">View /api/samples</a></p>
            </body>
          </html>
        `);
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  PHISHGUARD AI SERVER STARTED ON PORT ${PORT}`);
  console.log(`🔗  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔗  Sample Scenarios: http://localhost:${PORT}/api/samples`);
  console.log(`====================================================`);
});
