import express from 'express';
import { authenticate, requireAdmin } from '../controllers/authController.js';
import {
 createOrder,
 getMyOrders,
 getMyOrderById,
 getAllOrdersAdmin,
 updateOrderStatusAdmin,
 updateOrderDelivery,
 cancelMyOrder,
 deleteMyOrder,
 deleteOrderAdmin,
 verifyOrderCode,
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

router.put('/orders/my/:id/cancel', authenticate, cancelMyOrder);

router.put('/orders/my/:id/delivery', authenticate, updateOrderDelivery);

router.get('/orders/my/:id', authenticate, getMyOrderById);

router.delete('/orders/my/:id', authenticate, deleteMyOrder);

router.get('/admin/orders', authenticate, requireAdmin, getAllOrdersAdmin);

router.put('/admin/orders/:id/status', authenticate, requireAdmin, updateOrderStatusAdmin);

router.put('/admin/orders/:id/verify-code', authenticate, requireAdmin, verifyOrderCode);

router.delete('/admin/orders/:id', authenticate, requireAdmin, deleteOrderAdmin);

export default router;
