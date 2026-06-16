import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  deleteUserByAdmin,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController.js';
import {
  getAllNotificationsAdmin,
  sendNotificationToUser,
  getUsersForNotifications,
} from '../controllers/notificationsController.js';
import { authenticate, requireAdmin } from '../controllers/authController.js';
import { Model, Subcategory } from '../models/index.js';
import { getNextId } from '../utils/idGenerator.js';
import logger from '../utils/logger.js';

logger.info('Admin routes module loaded');

const router = express.Router();

// Admin stats
router.get('/stats', authenticate, requireAdmin, getAdminStats);

// Users management
router.get('/users', authenticate, requireAdmin, getAdminUsers);
// Users for notifications dropdown
router.get('/users-list', authenticate, requireAdmin, async (req, res) => {
  res.json({ users: [] });
});
router.put('/users/:id/role', authenticate, requireAdmin, updateUserRole);
router.delete('/users/:id', authenticate, requireAdmin, deleteUserByAdmin);

// Subcategories management (Бренды = Субкатегории)
router.get('/subcategories', authenticate, requireAdmin, async (req, res) => {
  try {
    const subcategories = await Subcategory.find({}).sort({ name: 1 });
    res.json({ subcategories });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения субкатегорий' });
  }
});

router.post('/subcategories', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) {
      return res.status(400).json({ error: 'name и categoryId обязательны' });
    }

    const existing = await Subcategory.findOne({ name, categoryId });
    if (existing) {
      return res.status(409).json({ error: 'Субкатегория с таким названием уже существует' });
    }

    const subcategoryId = await getNextId('sub');
    const subcategory = new Subcategory({
      id: subcategoryId,
      name: name.trim(),
      categoryId,
      productIds: [],
    });

    await subcategory.save();
    res.status(201).json({ message: 'Субкатегория (бренд) создана', subcategory });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка создания субкатегории' });
  }
});

router.put('/subcategories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const subcategory = await Subcategory.findOne({ id });
    if (!subcategory) {
      return res.status(404).json({ error: 'Субкатегория не найдена' });
    }

    if (name) subcategory.name = name.trim();
    await subcategory.save();

    res.json({ message: 'Субкатегория обновлена', subcategory });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка обновления субкатегории' });
  }
});

router.delete('/subcategories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findOne({ id });
    if (!subcategory) {
      return res.status(404).json({ error: 'Субкатегория не найдена' });
    }

    const productsCount = await Subcategory.countDocuments({ productIds: id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить субкатегорию: привязано ${productsCount} товаров` 
      });
    }

    await Subcategory.deleteOne({ id });
    res.json({ message: 'Субкатегория удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка удаления субкатегории' });
  }
});

// Categories management
router.get('/categories', authenticate, requireAdmin, getCategories);
router.post('/categories', authenticate, requireAdmin, createCategory);
router.put('/categories/:id', authenticate, requireAdmin, updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, deleteCategory);

// Models management
router.get('/models', authenticate, requireAdmin, async (req, res) => {
  try {
    const models = await Model.find({}).sort({ id: 1 });
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения моделей' });
  }
});

router.post('/models', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, brandId, categoryId } = req.body;
    if (!name || !brandId || !categoryId) {
      return res.status(400).json({ error: 'name, brandId, categoryId обязательны' });
    }

    const modelId = await getNextId('mod');
    const model = new Model({
      id: modelId,
      name: name.trim(),
      brandId,
      categoryId,
      productIds: [],
    });

    await model.save();
    res.status(201).json({ message: 'Модель создана', model });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка создания модели' });
  }
});

router.put('/models/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategoryId } = req.body;

    const model = await Model.findOne({ id });
    if (!model) {
      return res.status(404).json({ error: 'Модель не найдена' });
    }

    if (name) model.name = name.trim();
    if (subcategoryId) model.subcategoryId = subcategoryId;
    await model.save();

    res.json({ message: 'Модель обновлена', model });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка обновления модели' });
  }
});

// Notifications management (admin)
router.get('/notifications', authenticate, requireAdmin, getAllNotificationsAdmin);
router.post('/notifications', authenticate, requireAdmin, sendNotificationToUser);

logger.info('Admin routes registered');

export default router;
