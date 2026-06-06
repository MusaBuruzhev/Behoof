import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import { getNextId } from '../utils/idGenerator.js';

// Stats
export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, adminsCount, totalProducts, totalOrders, pendingOrdersCount, totalCategories, brandsCount, recentOrders, recentUsers, recentProducts] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      Category.countDocuments({}),
      Brand.countDocuments({}),
      Order.find({}).sort({ createdAt: -1 }).limit(5),
      User.find({}).sort({ createdAt: -1 }).limit(5),
      Product.find({}).sort({ createdAt: -1 }).limit(5),
    ]);

    const productBrands = await Product.distinct('brand');
    const totalBrands = Math.max(brandsCount, productBrands.length);

    res.json({
      totalUsers,
      usersCount: totalUsers,
      adminsCount,
      totalProducts,
      productsCount: totalProducts,
      totalOrders,
      ordersCount: totalOrders,
      pendingOrdersCount,
      totalCategories,
      totalBrands,
      recentOrders,
      recentUsers: recentUsers.map((user) => user.toJSON()),
      recentProducts: recentProducts.map((product) => product.toJSON()),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения статистики' });
  }
};

// Users management
export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({ users: users.map((user) => user.toJSON()) });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения пользователей' });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Некорректная роль' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ error: 'Нельзя изменить роль самому себе' });
    }

    user.role = role;
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Роль пользователя обновлена',
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка обновления роли' });
  }
};

export const deleteUserByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (String(id) === String(req.user._id)) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка удаления пользователя' });
  }
};

// Brands management
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({}).sort({ name: 1 });
    res.json({ brands });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения брендов' });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название бренда обязательно' });
    }

    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (existingBrand) {
      return res.status(409).json({ error: 'Бренд с таким названием уже существует' });
    }

    const brandId = await getNextId('brand');
    const brand = new Brand({
      id: brandId,
      name: name.trim(),
      description: description || '',
    });

    await brand.save();

    res.status(201).json({
      message: 'Бренд создан успешно',
      brand,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка создания бренда' });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const brand = await Brand.findOne({ id });
    if (!brand) {
      return res.status(404).json({ error: 'Бренд не найден' });
    }

    if (name !== undefined) {
      const existingBrand = await Brand.findOne({ 
        id: { $ne: id },
        name: { $regex: new RegExp('^' + name + '$', 'i') }
      });
      if (existingBrand) {
        return res.status(409).json({ error: 'Бренд с таким названием уже существует' });
      }
      brand.name = name.trim();
    }

    if (description !== undefined) {
      brand.description = description;
    }

    await brand.save();

    res.json({
      message: 'Бренд обновлён',
      brand,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка обновления бренда' });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findOne({ id });
    if (!brand) {
      return res.status(404).json({ error: 'Бренд не найден' });
    }

    const productsCount = await Product.countDocuments({ brand: brand.name });
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить бренд: привязано ${productsCount} товаров` 
      });
    }

    await Brand.deleteOne({ id });

    res.json({ message: 'Бренд удалён' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка удаления бренда' });
  }
};

// Categories management
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ id: 1 });
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения категорий' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название категории обязательно' });
    }

    const existingCategory = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
    if (existingCategory) {
      return res.status(409).json({ error: 'Категория с таким названием уже существует' });
    }

    const categoryId = await getNextId('cat');
    const category = new Category({
      id: categoryId,
      name: name.trim(),
      subcategoryIds: [],
    });

    await category.save();

    res.status(201).json({
      message: 'Категория создана успешно',
      category,
    });
  } catch (err) {
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

    if (name !== undefined) {
      const existingCategory = await Category.findOne({ 
        id: { $ne: id },
        name: { $regex: new RegExp('^' + name + '$', 'i') }
      });
      if (existingCategory) {
        return res.status(409).json({ error: 'Категория с таким названием уже существует' });
      }
      category.name = name.trim();
    }

    await category.save();

    res.json({
      message: 'Категория обновлена',
      category,
    });
  } catch (err) {
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

    const productsCount = await Product.countDocuments({ categoryId: category.id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        error: `Нельзя удалить категорию: привязано ${productsCount} товаров` 
      });
    }

    await Category.deleteOne({ id });

    res.json({ message: 'Категория удалена' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка удаления категории' });
  }
};
