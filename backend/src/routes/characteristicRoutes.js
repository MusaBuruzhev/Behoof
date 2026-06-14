import express from 'express'
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getValues,
  createValue,
  updateValue,
  deleteValue,
  getCategoryCharacteristics,
} from '../controllers/characteristicController.js'
import { authenticate, requireAdmin } from '../controllers/authController.js'

const router = express.Router()

// Группы характеристик
router.get('/characteristic-groups', authenticate, requireAdmin, getGroups)
router.post('/characteristic-groups', authenticate, requireAdmin, createGroup)
router.put('/characteristic-groups/:id', authenticate, requireAdmin, updateGroup)
router.delete('/characteristic-groups/:id', authenticate, requireAdmin, deleteGroup)

// Значения характеристик
router.get('/characteristic-groups/:groupId/values', authenticate, requireAdmin, getValues)
router.post('/characteristic-groups/:groupId/values', authenticate, requireAdmin, createValue)
router.put('/characteristic-values/:id', authenticate, requireAdmin, updateValue)
router.delete('/characteristic-values/:id', authenticate, requireAdmin, deleteValue)

// Характеристики для категории
router.get('/categories/:categoryId/characteristics', authenticate, requireAdmin, getCategoryCharacteristics)

export default router