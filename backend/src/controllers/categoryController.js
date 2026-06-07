import { Category } from '../models/index.js';
import { getNextId } from '../utils/idGenerator.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ id: 1 });
    res.json({ categories });
  } catch (err) {
    console.error('Ошибка получения категорий:', err.message);
    res.status(500).json({ error: err.message || 'Ошибка получения категорий' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }

    const categoryId = await getNextId('cat');
    const category = new Category({
      id: categoryId,
      name: name.trim(),
      subcategoryIds: [],
    });

    await category.save();

    res.status(201).json({
      message: 'Категория успешно создана',
      category,
    });
  } catch (err) {
    console.error('Ошибка создания категории:', err.message);
    res.status(500).json({ error: err.message || 'Ошибка создания категории' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const category = await Category.findOne({ id });
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    if (name) {
      category.name = name.trim();
    }
    if (description !== undefined) {
      category.description = description;
    }

    category.updatedAt = new Date();
    await category.save();

    res.json({
      message: 'Категория успешно обновлена',
      category,
    });
  } catch (err) {
    console.error('Ошибка обновления категории:', err.message);
    res.status(500).json({ error: err.message || 'Ошибка обновления категории' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findOne({ id });
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    // Удаляем связанные подкатегории
    const { Subcategory } = await import('../models/index.js');
    await Subcategory.deleteMany({ categoryId: id });

    // Удаляем категорию
    await Category.deleteOne({ id });

    res.json({ message: 'Категория успешно удалена' });
  } catch (err) {
    console.error('Ошибка удаления категории:', err.message);
    res.status(500).json({ error: err.message || 'Ошибка удаления категории' });
  }
};
