import express from 'express';
import {
  getAdminUsers,
  updateUserRole,
  deleteUserByAdmin,
  getAdminStats,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import {
  getAllNotificationsAdmin,
  sendNotificationToUser,
  getUsersForNotifications,
} from '../controllers/notificationsController.js';
import { authenticate, requireAdmin } from '../controllers/authController.js';
import logger from '../utils/logger.js';

logger.info('Admin routes module loaded');

const router = express.Router();

// Admin stats
router.get('/stats', authenticate, requireAdmin, getAdminStats);

// Users management
router.get('/users', authenticate, requireAdmin, getAdminUsers);
// Users for notifications dropdown
router.get('/users-list', authenticate, requireAdmin, async (req, res) => {
  res.json({ users: [] });
});
router.put('/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.delete('/users/:id', authenticate, requireAdmin, deleteUserByAdmin);

// Brands management
router.get('/brands', authenticate, requireAdmin, getBrands);
router.post('/brands', authenticate, requireAdmin, createBrand);
router.put('/brands/:id', authenticate, requireAdmin, updateBrand);
router.delete('/brands/:id', authenticate, requireAdmin, deleteBrand);

// Categories management
router.get('/categories', authenticate, requireAdmin, getCategories);
router.post('/categories', authenticate, requireAdmin, createCategory);
router.put('/categories/:id', authenticate, requireAdmin, updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, deleteCategory);

// Notifications management (admin)
router.get('/notifications', authenticate, requireAdmin, getAllNotificationsAdmin);
router.post('/notifications', authenticate, requireAdmin, sendNotificationToUser);

logger.info('Admin routes registered');

export default router;
