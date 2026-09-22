import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB, { isDatabaseConnected } from './config/db.js';
import { seedData } from './scripts/seedDb.js';
import ensureDb from './middlewares/dbMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import mainRoutes from './routes/mainRoutes.js';

// Resolve dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config — try BOTH env locations (order mirrors scripts/seedDb.js):
// 1) server/.env  2) root .env. dotenv never overrides already-set keys,
// so a dedicated server/.env wins, and Render (dashboard env vars) is unaffected.
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Initialize App
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach Socket.io instance to Express App
app.set('socketio', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint — MUST be registered BEFORE the API mounts:
// mainRoutes applies auth middleware to every /api/* path, which would
// otherwise intercept /api/health with a 401 and fail Render's health checks.
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    db: isDatabaseConnected() ? 'connected' : 'disconnected',
    time: new Date().toISOString(),
  })
);

// Mount API Routes (guarded: fast 503 during DB outages instead of cryptic 500s)
app.use('/api/auth', ensureDb, authRoutes);
app.use('/api', ensureDb, mainRoutes);

// Serve React Frontend (production)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// Root Endpoint -> serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Fallback: serve frontend for any non-API route (React Router)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Socket.io Real-time Connection Handler
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
connectDB().then(async () => {
  try {
    await seedData({ clean: false });
  } catch (seedErr) {
    console.warn('[Seed Warning]:', seedErr.message);
  }
  server.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
});

