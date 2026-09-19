import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { seedData } from './scripts/seedDb.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import mainRoutes from './routes/mainRoutes.js';

// Load config
dotenv.config();

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

// Resolve dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api', mainRoutes);

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
  console.error('Unhandled Server Error:', err.message);
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

