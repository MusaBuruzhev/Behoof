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
import { validate, registerSchema, loginSchema } from '../utils/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/auth/register', validate(registerSchema), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/auth/login', validate(loginSchema), login);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Получить профиль пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
 *   put:
 *     tags: [Auth]
 *     summary: Обновить профиль пользователя
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Профиль обновлен
 *   delete:
 *     tags: [Auth]
 *     summary: Удалить профиль пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль удален
 */
router.get('/auth/profile', authenticate, getProfile);
router.put('/auth/profile', authenticate, updateProfile);
router.delete('/auth/profile', authenticate, deleteProfile);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags: [Auth]
 *     summary: Верификация токена
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Токен валиден
 */
router.get('/auth/verify', authenticate, verifyToken);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Получить список пользователей (только админ)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 */
router.get('/admin/users', authenticate, requireAdmin, getAdminUsers);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Получить статистику (только админ)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика системы
 */
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

router.put('/admin/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.delete('/admin/users/:id', authenticate, requireAdmin, deleteUserByAdmin);

// Маршруты для избранного
router.post('/favorites/add', addToFavorites);
router.post('/favorites/remove', removeFromFavorites);
router.get('/favorites', getFavorites);

export default router;
