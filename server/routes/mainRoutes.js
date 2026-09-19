import express from 'express';
import protect from '../middlewares/authMiddleware.js';
import adminOnly from '../middlewares/adminMiddleware.js';
import {
  getDashboardData,
  getWeather,
  getMarketPrices,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getAdminStats,
  getUsers,
  broadcastNotification,
  getSchemes
} from '../controllers/mainController.js';

const router = express.Router();

// Apply auth to all endpoints
router.use(protect);

router.get('/dashboard', getDashboardData);
router.get('/weather', getWeather);
router.get('/market-prices', getMarketPrices);
router.get('/schemes', getSchemes);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllAsRead);
router.put('/notifications/:id/read', markAsRead);

// Admin-only endpoints
router.get('/admin/dashboard', adminOnly, getAdminStats);
router.get('/admin/users', adminOnly, getUsers);
router.post('/admin/notifications', adminOnly, broadcastNotification);

export default router;
