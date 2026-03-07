import express from 'express';
import { register, login, getProfile, updateProfile, verifyToken, deleteProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', getProfile);
router.put('/auth/profile', updateProfile);
router.delete('/auth/profile', deleteProfile);
router.get('/auth/verify', verifyToken);

export default router;
