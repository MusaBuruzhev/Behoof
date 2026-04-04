import express from 'express'
import {
  getCatalog,
  getProducts,
  addProduct,
  initializeData,
  getProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  addReview,
  deleteReview,
} from '../controllers/catalogController.js'
import { authenticate, requireAdmin } from '../controllers/authController.js'
import { validate, productSchema, reviewSchema, updateProductSchema, validateQuery, paginationSchema } from '../utils/validation.js'
import logger from '../utils/logger.js'

const router = express.Router()

/**
 * @swagger
 * /api/catalog:
 *   get:
 *     tags: [Catalog]
 *     summary: Получить полный каталог
 *     description: Возвращает все категории, подкатегории, модели и товары
 *     responses:
 *       200:
 *         description: Каталог
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Catalog'
 */
router.get('/catalog', getCatalog)

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Получить список товаров
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price-asc, price-desc, name-asc, name-desc, date-desc]
 *     responses:
 *       200:
 *         description: Список товаров с пагинацией
 */
router.get('/products', validateQuery(paginationSchema), getProducts)

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Добавить товар (только админ)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - brand
 *               - model
 *               - categoryId
 *               - images
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               brand:
 *                 type: string
 *               model:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *               characteristics:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Товар добавлен
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Нет прав администратора
 */
router.post('/products', authenticate, requireAdmin, (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) {
      logger.warn(`Multer error: ${err.message}`);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, validate(productSchema), addProduct)

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Получить товар по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
router.get('/products/:id', getProduct)

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   post:
 *     tags: [Products]
 *     summary: Добавить отзыв к товару
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
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *               traitRatings:
 *                 type: object
 *     responses:
 *       201:
 *         description: Отзыв добавлен
 */
router.post('/products/:id/reviews', authenticate, validate(reviewSchema), addReview)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Обновить товар (только админ)
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
 *         description: Товар обновлен
 *   delete:
 *     tags: [Products]
 *     summary: Удалить товар (только админ)
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
 *         description: Товар удален
 */
router.put('/products/:id', authenticate, requireAdmin, validate(updateProductSchema), updateProduct)
router.delete('/products/:id', authenticate, requireAdmin, deleteProduct)

/**
 * @swagger
 * /api/products/{id}/reviews/{reviewId}:
 *   delete:
 *     tags: [Products]
 *     summary: Удалить отзыв
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Отзыв удален
 */
router.delete('/products/:id/reviews/:reviewId', authenticate, deleteReview)

/**
 * @swagger
 * /api/initialize:
 *   post:
 *     tags: [Admin]
 *     summary: Инициализировать начальные данные (только админ)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные инициализированы
 */
router.post('/initialize', authenticate, requireAdmin, initializeData)

export default router
