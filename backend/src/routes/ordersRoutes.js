import express from 'express';
import { authenticate, requireAdmin } from '../controllers/authController.js';
import {
 createOrder,
 getMyOrders,
 getAllOrdersAdmin,
 updateOrderStatusAdmin,
 cancelMyOrder,
 deleteMyOrder,
 deleteOrderAdmin,
} from '../controllers/ordersController.js';
import { validate, orderSchema } from '../utils/validation.js';

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Создать заказ
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - pickupAt
 *             properties:
 *               productId:
 *                 type: string
 *               pickupAt:
 *                 type: string
 *                 format: date-time
 *               contactPhone:
 *                 type: string
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Заказ создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post('/orders', authenticate, validate(orderSchema), createOrder);

/**
 * @swagger
 * /api/orders/my:
 *   get:
 *     tags: [Orders]
 *     summary: Получить мои заказы
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов пользователя
 */
router.get('/orders/my', authenticate, getMyOrders);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: Получить все заказы (админ)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список всех заказов
 */
router.get('/admin/orders', authenticate, requireAdmin, getAllOrdersAdmin);

/**
 * @swagger
 * /api/admin/orders/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Обновить статус заказа (админ)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, ready, completed, cancelled]
 *     responses:
 *       200:
 *         description: Статус обновлен
 */
router.put('/admin/orders/:id/status', authenticate, requireAdmin, updateOrderStatusAdmin);

/**
 * @swagger
 * /api/orders/my/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Отменить мой заказ
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказ отменён
 */
router.put('/orders/my/:id/cancel', authenticate, cancelMyOrder);

/**
 * @swagger
 * /api/orders/my/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Удалить мой заказ (в историю)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказ перемещён в историю
 */
router.delete('/orders/my/:id', authenticate, deleteMyOrder);

/**
 * @swagger
 * /api/admin/orders/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Удалить заказ (админ) - в историю
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Заказ перемещён в историю
 */
router.delete('/admin/orders/:id', authenticate, requireAdmin, deleteOrderAdmin);

export default router;
