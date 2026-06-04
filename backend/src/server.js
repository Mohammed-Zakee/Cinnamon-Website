require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Route imports
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const newsletterRoutes = require('./routes/newsletter');
const contactRoutes = require('./routes/contact');
const uploadRoutes = require('./routes/upload');
const settingsRoutes = require('./routes/settings');

const app = express();

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5000',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static files (frontend + uploads) ────────────────────────────────────────
// Use absolute path resolved from project root so it works on Vercel too
const FRONTEND_DIR = path.resolve(__dirname, '../../frontend');
const UPLOADS_DIR  = path.resolve(__dirname, '../uploads');

app.use(express.static(FRONTEND_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/products',   productRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact',    contactRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/settings',   settingsRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV || 'development'
  });
});

// ─── Catch-all: Serve Frontend SPA ────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// ─── DB Connection (cached for Vercel serverless) ────────────────────────────
let isConnected = false;

async function connectDB() {
  if (isConnected || !process.env.MONGO_URI) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');

    // Seed products on first run
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      await require('./seedProducts')();
    }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    isConnected = false;
  }
}

// ─── Start (local dev only — Vercel handles this via module.exports) ──────────
if (process.env.VERCEL !== '1' && require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Ceylon Gold server running on http://localhost:${PORT}`);
    });
  });
} else {
  // Vercel: connect to DB on each cold start, but reuse the connection
  connectDB();
}

module.exports = app;
