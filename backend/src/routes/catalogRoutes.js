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

const router = express.Router()

router.get('/catalog', getCatalog)
router.get('/products', getProducts)

router.post('/products', authenticate, requireAdmin, (req, res, next) => {
 uploadImages(req, res, (err) => {
 if (err) {
 console.error('Multer error:', err);
 return res.status(400).json({ error: err.message });
 }
 next();
 });
}, addProduct)
router.get('/products/:id', getProduct)
router.post('/products/:id/reviews', authenticate, addReview)
router.delete('/products/:id/reviews/:reviewId', authenticate, deleteReview)
router.put('/products/:id', authenticate, requireAdmin, updateProduct)
router.delete('/products/:id', authenticate, requireAdmin, deleteProduct)

router.post('/initialize', authenticate, requireAdmin, initializeData)

export default router
