import express from 'express';
import {
 register,
 login,
 getProfile,
 updateProfile,
 verifyToken,
 deleteProfile,
 authenticate,
 requireAdmin,
 getAdminUsers,
 updateUserRole,
 deleteUserByAdmin,
 getAdminStats,
} from '../controllers/authController.js';
import { addToFavorites, removeFromFavorites, getFavorites } from '../controllers/favoritesController.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, updateProfile);
router.delete('/auth/profile', authenticate, deleteProfile);
router.get('/auth/verify', authenticate, verifyToken);

router.get('/admin/users', authenticate, requireAdmin, getAdminUsers);
router.put('/admin/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.delete('/admin/users/:id', authenticate, requireAdmin, deleteUserByAdmin);
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

// Маршруты для избранного
router.post('/favorites/add', addToFavorites);
router.post('/favorites/remove', removeFromFavorites);
router.get('/favorites', getFavorites);

export default router;
