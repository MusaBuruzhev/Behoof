import express from 'express'
import { getCatalog, addProduct, initializeData } from '../controllers/catalogController.js'

const router = express.Router()

router.get('/catalog', getCatalog)

router.post('/products', addProduct)

router.post('/initialize', initializeData)

export default router
