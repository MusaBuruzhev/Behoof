import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phoneNumber?.trim() || null
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Регистрация успешна',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Ошибка регистрации:', err.message);

    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email уже зарегистрирован' });
    }

    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }

    res.status(500).json({ error: err.message || 'Ошибка при регистрации' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Вход успешен',
      token,
      user: user.toJSON()
    });
  } catch (err) {
    console.error('Ошибка входа:', err.message);
    res.status(500).json({ error: err.message || 'Ошибка при входе' });
  }
};

export const getProfile = async (req, res) => {
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

    res.json(user.toJSON());
  } catch {
    res.status(401).json({ error: 'Неверный или истекший токен' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Токен не найден' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const { firstName, lastName, phoneNumber, address, birthDate } = req.body;

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber: phoneNumber || undefined,
        address: address || undefined,
        birthDate: birthDate || undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({
      message: 'Профиль обновлён',
      user: user.toJSON()
    });
  } catch {
    res.status(401).json({ error: 'Неверный или истекший токен' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ valid: false, error: 'Токен не найден' });
    }

    jwt.verify(token, JWT_SECRET);
    const decoded = jwt.decode(token);
    const user = await User.findById(decoded.userId);

    res.json({
      valid: true,
      user: user.toJSON()
    });
  } catch {
    res.status(401).json({ valid: false, error: 'Неверный или истекший токен' });
  }
};
