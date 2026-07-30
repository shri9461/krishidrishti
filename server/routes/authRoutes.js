import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from '../controllers/authController.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router
  .route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

export default router;
