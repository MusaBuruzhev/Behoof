import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.js';

const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Получить корзину пользователя
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Корзина пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalAmount:
 *                   type: number
 *                 itemCount:
 *                   type: number
 */
router.get('/cart', getCart);

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     tags: [Cart]
 *     summary: Добавить товар в корзину
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
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 default: 1
 *     responses:
 *       201:
 *         description: Товар добавлен в корзину
 */
router.post('/cart/items', addToCart);

/**
 * @swagger
 * /api/cart/items/:productId:
 *   put:
 *     tags: [Cart]
 *     summary: Обновить количество товара в корзине
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
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
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Количество обновлено
 */
router.put('/cart/items/:productId', updateCartItem);

/**
 * @swagger
 * /api/cart/items/:productId:
 *   delete:
 *     tags: [Cart]
 *     summary: Удалить товар из корзины
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар удалён из корзины
 */
router.delete('/cart/items/:productId', removeFromCart);

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     tags: [Cart]
 *     summary: Очистить корзину
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Корзина очищена
 */
router.delete('/cart', clearCart);

export default router;
