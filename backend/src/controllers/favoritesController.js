/* global process */

import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const addToFavorites = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { productId } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'productId обязателен' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }

    res.json({
      message: 'Товар добавлен в избранное',
      favorites: user.favorites
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка добавления в избранное:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const removeFromFavorites = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { productId } = req.body;

    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    if (!productId) {
      return res.status(400).json({ error: 'productId обязателен' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const index = user.favorites.indexOf(productId);
    if (index > -1) {
      user.favorites.splice(index, 1);
      await user.save();
    }

    res.json({
      message: 'Товар удален из избранного',
      favorites: user.favorites
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка удаления из избранного:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      favorites: user.favorites
    });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Неверный или истекший токен' });
    }
    console.error('Ошибка получения избранного:', err.message);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
