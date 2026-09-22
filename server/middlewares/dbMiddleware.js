import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/db.js';

// 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
const STATES = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

/**
 * Blocks API requests with a fast, clear 503 while MongoDB is unreachable.
 * Without this, Mongoose buffers every query (~10s) and throws a cryptic
 * "buffering timed out / MongoDB server error" 500 on each auth route.
 */
const ensureDb = (req, res, next) => {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      success: false,
      message: 'Database unreachable. The server is reconnecting to MongoDB — please retry in a few seconds.',
      db: STATES[mongoose.connection.readyState] || 'unknown',
    });
  }
  next();
};

export default ensureDb;
