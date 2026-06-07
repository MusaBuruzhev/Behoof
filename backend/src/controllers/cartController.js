/* global process */

import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const getUserFromToken = async (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(decoded.userId);
    return user;
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw err;
    }
    throw err;
  }
};

/**
 * Получить корзину пользователя
 */
export const getCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    console.log('Получен токен для корзины, длина:', token.length);
    
    const user = await getUserFromToken(token);
    if (!user) {
      console.log('Пользователь не найден по токену');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('Пользователь найден:', user._id);
    
    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      console.log('Корзина не найдена, создаём новую');
      cart = await Cart.create({
        userId: user._id,
        items: [],
        totalAmount: 0,
        itemCount: 0,
      });
    }

    console.log('Получаем полную корзину...');
    const fullCart = await cart.getFullCart();
    console.log('Корзина успешно получена');
    res.json(fullCart);
  } catch (err) {
    console.error('Ошибка получения корзины:', err.name, err.message);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Внутренняя ошибка сервера', details: err.message });
  }
};

/**
 * Добавить товар в корзину
 */
export const addToCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId обязателен' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Количество должно быть больше 0' });
    }

    // Проверяем существование товара
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    let cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      // Создаём новую корзину
      cart = await Cart.create({
        userId: user._id,
        items: [{ productId, quantity }],
      });
    } else {
      // Проверяем есть ли уже товар в корзине
      const existingItem = cart.items.find(
        item => item.productId === productId
      );

      if (existingItem) {
        // Увеличиваем количество
        existingItem.quantity += quantity;
      } else {
        // Добавляем новый товар
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    const fullCart = await cart.getFullCart();
    res.status(201).json({
      message: 'Товар добавлен в корзину',
      ...fullCart,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка добавления в корзину:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Обновить количество товара в корзине
 */
export const updateCartItem = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    const { productId } = req.params;
    const { quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'productId обязателен' });
    }

    if (quantity === undefined || quantity < 1) {
      return res.status(400).json({ error: 'Количество должно быть больше 0' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }

    const item = cart.items.find(
      item => item.productId === productId
    );

    if (!item) {
      return res.status(404).json({ error: 'Товар не найден в корзине' });
    }

    item.quantity = quantity;
    await cart.save();

    const fullCart = await cart.getFullCart();
    res.json({
      message: 'Количество обновлено',
      ...fullCart,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка обновления корзины:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Удалить товар из корзины
 */
export const removeFromCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ error: 'productId обязателен' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }

    cart.items = cart.items.filter(
      item => item.productId !== productId
    );

    await cart.save();

    const fullCart = await cart.getFullCart();
    res.json({
      message: 'Товар удалён из корзины',
      ...fullCart,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка удаления из корзины:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Очистить корзину
 */
export const clearCart = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }

    cart.items = [];
    await cart.save();

    const fullCart = await cart.getFullCart();
    res.json({
      message: 'Корзина очищена',
      ...fullCart,
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка очистки корзины:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
