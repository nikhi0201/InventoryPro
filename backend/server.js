// backend/server.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const supplierRoutes = require('./routes/suppliers');
const stockRoutes = require('./routes/stock');
const User = require('./models/User');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (FRONTEND_ORIGIN === '*' || origin === FRONTEND_ORIGIN) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'), false);
  },
  credentials: true,
}));

(async function initDB() {
  try {
    await connectDB();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
})();

async function seedDefaultUser() {
  try {
    const exists = await User.findOne({ email: 'admin@example.com' });
    if (!exists) {
      const hashed = await bcrypt.hash('password', 10);
      const u = new User({ name: 'Admin', email: 'admin@example.com', password: hashed, role: 'admin' });
      await u.save();
      console.log('Seeded default user -> admin@example.com / password');
    } else {
      console.log('Default user already exists');
    }
  } catch (e) {
    console.error('Seed error', e && e.message ? e.message : e);
  }
}
seedDefaultUser();

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/stock', stockRoutes);

app.get('/health', (req, res) => res.json({ ok: true }));

const ASSIGNMENT_PATH = path.resolve('/mnt/data/InventoryPro_Assignment.pdf');
app.get('/assignment', (req, res) => {
  fs.access(ASSIGNMENT_PATH, fs.constants.R_OK, (err) => {
    if (err) {
      console.warn('Assignment file not found at', ASSIGNMENT_PATH);
      return res.status(404).send('Assignment file not found');
    }
    res.sendFile(ASSIGNMENT_PATH);
  });
});

const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
if (process.env.SERVE_FRONTEND === 'true') {
  if (fs.existsSync(FRONTEND_DIST)) {
    app.use(express.static(FRONTEND_DIST));
    app.get('*', (req, res) => {
      res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
    });
    console.log('Serving frontend from', FRONTEND_DIST);
  } else {
    console.warn('FRONTEND_DIST not found, skipping static serve:', FRONTEND_DIST);
  }
}

app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({ error: err.message });
  }
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = parseInt(process.env.PORT, 10) || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (frontend origin: ${FRONTEND_ORIGIN})`);
});

function shutdown(signal) {
  console.info(`${signal} received — shutting down`);
  server.close(() => {
    console.info('HTTP server closed');
    try {
      const mongoose = require('mongoose');
      mongoose.connection.close(false, () => {
        console.info('MongoDB connection closed');
        process.exit(0);
      });
    } catch (e) {
      process.exit(0);
    }
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
