import express from 'express';
import { register, login, getProfile, updateProfile, verifyToken, deleteProfile } from '../controllers/authController.js';
import { addToFavorites, removeFromFavorites, getFavorites } from '../controllers/favoritesController.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', getProfile);
router.put('/auth/profile', updateProfile);
router.delete('/auth/profile', deleteProfile);
router.get('/auth/verify', verifyToken);

// Маршруты для избранного
router.post('/favorites/add', addToFavorites);
router.post('/favorites/remove', removeFromFavorites);
router.get('/favorites', getFavorites);

export default router;
