import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

const getTokenFromRequest = (req) => req.headers.authorization?.split(' ')[1];

const getUserFromToken = async (token) => {
 const decoded = jwt.verify(token, JWT_SECRET);
 const user = await User.findById(decoded.userId);
 return user;
};

export const authenticate = async (req, res, next) => {
 try {
 const token = getTokenFromRequest(req);

 if (!token) {
 return res.status(401).json({ error: 'Токен не найден' });
 }

 const user = await getUserFromToken(token);
 if (!user) {
 return res.status(401).json({ error: 'Пользователь не найден или токен недействителен' });
 }

 req.user = user;
 next();
 } catch {
 return res.status(401).json({ error: 'Неверный или истекший токен' });
 }
};

export const requireAdmin = (req, res, next) => {
 if (!req.user || req.user.role !== 'admin') {
 return res.status(403).json({ error: 'Доступ только для администратора' });
 }

 next();
};

export const register = async (req, res) => {
 try {
 const { email, password, firstName, lastName, phoneNumber } = req.body;

 if (!email || !password || !firstName || !lastName) {
 return res.status(400).json({ error: 'Все обязательные поля должны быть заполнены' });
 }

 const normalizedEmail = email.toLowerCase();
 const existingUser = await User.findOne({ email: normalizedEmail });
 if (existingUser) {
 return res.status(409).json({ error: 'Email уже зарегистрирован' });
 }

 const adminsCount = await User.countDocuments({ role: 'admin' });

 const user = new User({
 email: normalizedEmail,
 password,
 firstName: firstName.trim(),
 lastName: lastName.trim(),
 phoneNumber: phoneNumber?.trim() || null,
 role: adminsCount ===0 ? 'admin' : 'user',
 });

 await user.save();

 const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
 expiresIn: JWT_EXPIRES_IN,
 });

 res.status(201).json({
 message: 'Регистрация успешна',
 token,
 user: user.toJSON(),
 });
 } catch (err) {
 console.error('Ошибка регистрации:', err.message);

 if (err.code ===11000) {
 return res.status(409).json({ error: 'Email уже зарегистрирован' });
 }

 if (err.name === 'ValidationError') {
 const messages = Object.values(err.errors).map((e) => e.message);
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

 const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
 expiresIn: JWT_EXPIRES_IN,
 });

 res.json({
 message: 'Вход успешен',
 token,
 user: user.toJSON(),
 });
 } catch (err) {
 console.error('Ошибка входа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка при входе' });
 }
};

export const getProfile = async (req, res) => {
 res.json(req.user.toJSON());
};

export const updateProfile = async (req, res) => {
 try {
 const { firstName, lastName, phoneNumber } = req.body;

 const user = await User.findByIdAndUpdate(
 req.user._id,
 {
 firstName: firstName || undefined,
 lastName: lastName || undefined,
 phoneNumber: phoneNumber || undefined,
 updatedAt: new Date(),
 },
 { new: true, runValidators: true }
 );

 if (!user) {
 return res.status(404).json({ error: 'Пользователь не найден' });
 }

 res.json({
 message: 'Профиль обновлён',
 user: user.toJSON(),
 });
 } catch (err) {
 res.status(500).json({ error: err.message || 'Ошибка обновления профиля' });
 }
};

export const verifyToken = async (req, res) => {
 res.json({
 valid: true,
 user: req.user.toJSON(),
 });
};

export const deleteProfile = async (req, res) => {
 try {
 const user = await User.findByIdAndDelete(req.user._id);

 if (!user) {
 return res.status(404).json({ error: 'Пользователь не найден' });
 }

 res.json({
 message: 'Профиль успешно удалён',
 });
 } catch (err) {
 res.status(500).json({ error: err.message || 'Ошибка удаления профиля' });
 }
};

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

export const getAdminStats = async (req, res) => {
 try {
 const [usersCount, adminsCount, productsCount, ordersCount, pendingOrdersCount] = await Promise.all([
 User.countDocuments({}),
 User.countDocuments({ role: 'admin' }),
 Product.countDocuments({}),
 Order.countDocuments({}),
 Order.countDocuments({ status: 'pending' }),
 ]);

 res.json({
 usersCount,
 adminsCount,
 productsCount,
 ordersCount,
 pendingOrdersCount,
 });
 } catch (err) {
 res.status(500).json({ error: err.message || 'Ошибка получения статистики' });
 }
};
