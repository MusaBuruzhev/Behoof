import express from 'express';
import { authenticate, requireAdmin } from '../controllers/authController.js';
import {
 createOrder,
 getMyOrders,
 getAllOrdersAdmin,
 updateOrderStatusAdmin,
} from '../controllers/ordersController.js';

const router = express.Router();

router.post('/orders', authenticate, createOrder);
router.get('/orders/my', authenticate, getMyOrders);
router.get('/admin/orders', authenticate, requireAdmin, getAllOrdersAdmin);
router.put('/admin/orders/:id/status', authenticate, requireAdmin, updateOrderStatusAdmin);

export default router;
