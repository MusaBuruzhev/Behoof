import express from 'express'
import { getCatalog, addProduct, initializeData, getProduct, updateProduct, deleteProduct, uploadImages } from '../controllers/catalogController.js'

const router = express.Router()

router.get('/catalog', getCatalog)

router.post('/products', (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, addProduct)
router.get('/products/:id', getProduct)
router.put('/products/:id', updateProduct)
router.delete('/products/:id', deleteProduct)

router.post('/initialize', initializeData)

export default router
