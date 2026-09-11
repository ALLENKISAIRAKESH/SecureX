const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const keysRoutes = require('./routes/keys');
const webhooksRoutes = require('./routes/webhooks');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

/* ── Security Middleware ─────────────────────────────────── */

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

/* ── Static Files ────────────────────────────────────────── */

app.use(express.static(path.join(__dirname, 'public')));

/* ── API Routes ──────────────────────────────────────────── */

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/keys', keysRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SecureX API is running.',
    version: '1.0.0',
    uptime: Math.floor(process.uptime())
  });
});

/* ── SPA Fallback ────────────────────────────────────────── */

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'Endpoint not found.' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/* ── Global Error Handler ────────────────────────────────── */

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

/* ── Database & Start ────────────────────────────────────── */

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`✓ SecureX running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });

/* ── Graceful Shutdown ───────────────────────────────────── */

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
