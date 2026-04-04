import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getNextId } from '../utils/idGenerator.js';
import { createNotification } from './notificationsController.js';
import logger from '../utils/logger.js';

const AVAILABLE_STATUSES = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];

const STATUS_TITLES = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтвержден',
  ready: 'Готов к выдаче',
  completed: 'Завершен',
  cancelled: 'Отменен',
};

export const createOrder = async (req, res) => {
 try {
 const { productId, pickupAt, contactPhone, comment } = req.body;

 if (!productId || !pickupAt) {
 return res.status(400).json({ error: 'productId и pickupAt обязательны' });
 }

 const product = await Product.findOne({ id: productId });
 if (!product) {
 return res.status(404).json({ error: 'Товар не найден' });
 }

 const pickupDate = new Date(pickupAt);
 if (Number.isNaN(pickupDate.getTime())) {
 return res.status(400).json({ error: 'Некорректная дата получения' });
 }

 if (pickupDate <= new Date()) {
 return res.status(400).json({ error: 'Дата получения должна быть в будущем' });
 }

 const order = new Order({
 id: await getNextId('ord'),
 userId: req.user._id,
 productId,
 pickupAt: pickupDate,
 contactPhone: contactPhone?.trim() || req.user.phoneNumber || '',
 comment: comment?.trim() || '',
 });

 await order.save();

 // Уведомление пользователю о создании заказа
 try {
   const userId = req.user._id;
   logger.info(`Создаю уведомление для пользователя ${userId}`);

   await createNotification(
     userId,
     'new_order',
     'Заказ оформлен',
     `Ваш заказ #${order.id} на ${product.name} успешно оформлен. Ожидает подтверждения.`,
     order.id,
     'order'
   );
   logger.info('Уведомление пользователю создано');

   // Уведомление админу о новом заказе
   const admins = await User.find({ role: 'admin' });
   logger.info(`Найдено админов: ${admins.length}`);

   for (const admin of admins) {
     logger.info(`Создаю уведомление для админа ${admin._id}`);
     await createNotification(
       admin._id,
       'new_order',
       'Новый заказ',
       `Поступил новый заказ #${order.id} от ${req.user.firstName} ${req.user.lastName} на сумму ${product.price} руб.`,
       order.id,
       'order'
     );
   }
 } catch (notifyError) {
   logger.error('Ошибка отправки уведомления:', notifyError);
 }

 res.status(201).json({
 message: 'Заказ успешно оформлен',
 order,
 });
 } catch (err) {
 logger.error('Ошибка создания заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка создания заказа' });
 }
};

export const getMyOrders = async (req, res) => {
 try {
 const { filter = 'active' } = req.query;

 // Фильтр по умолчанию - только активные заказы
 const baseFilter = { userId: req.user._id };
 if (filter === 'active') {
   baseFilter.isDeleted = false;
   baseFilter.status = { $in: ['pending', 'confirmed', 'ready'] };
 } else if (filter === 'history') {
   baseFilter.isDeleted = true;
 } else if (filter === 'all') {
   // Все записи включая удалённые
 }

 const orders = await Order.find(baseFilter).sort({ createdAt: -1 });
 const productIds = [...new Set(orders.map((order) => order.productId))];
 const products = await Product.find({ id: { $in: productIds } });
 const productMap = new Map(products.map((product) => [product.id, product]));

 const result = orders.map((order) => {
 const product = productMap.get(order.productId);
 return {
 ...order.toObject(),
 product: product
 ? {
 id: product.id,
 name: product.name,
 brand: product.brand,
 images: product.images,
 price: product.price,
 }
 : null,
 };
 });

 // Получаем общее количество для статистики
 const [activeCount, historyCount] = await Promise.all([
   Order.countDocuments({ userId: req.user._id, isDeleted: false, status: { $in: ['pending', 'confirmed', 'ready'] } }),
   Order.countDocuments({ userId: req.user._id, isDeleted: true })
 ]);

 res.json({
 orders: result,
 stats: {
   active: activeCount,
   history: historyCount
 }
 });
 } catch (err) {
 logger.error('Ошибка получения заказов:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка получения заказов' });
 }
};

export const getAllOrdersAdmin = async (req, res) => {
 try {
 const { filter = 'active' } = req.query;

 const baseFilter = {};
 if (filter === 'active') {
   baseFilter.isDeleted = false;
   baseFilter.status = { $in: ['pending', 'confirmed', 'ready'] };
 } else if (filter === 'history') {
   baseFilter.isDeleted = true;
 }

 const orders = await Order.find(baseFilter).populate('userId', 'firstName lastName email phoneNumber role').sort({ createdAt: -1 });
 const productIds = [...new Set(orders.map((order) => order.productId))];
 const products = await Product.find({ id: { $in: productIds } });
 const productMap = new Map(products.map((product) => [product.id, product]));

 const result = orders.map((order) => {
 const product = productMap.get(order.productId);
 return {
 ...order.toObject(),
 product: product
 ? {
 id: product.id,
 name: product.name,
 brand: product.brand,
 images: product.images,
 price: product.price,
 }
 : null,
 };
 });

 // Статистика
 const [activeCount, historyCount, pendingCount] = await Promise.all([
   Order.countDocuments({ isDeleted: false, status: { $in: ['pending', 'confirmed', 'ready'] } }),
   Order.countDocuments({ isDeleted: true }),
   Order.countDocuments({ isDeleted: false, status: 'pending' })
 ]);

 res.json({
 orders: result,
 stats: {
   active: activeCount,
   history: historyCount,
   pending: pendingCount
 }
 });
 } catch (err) {
 logger.error('Ошибка получения всех заказов:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка получения заказов' });
 }
};

// Отмена заказа пользователем
export const cancelMyOrder = async (req, res) => {
 try {
 const { id } = req.params;

 const order = await Order.findOne({ id, userId: req.user._id });
 if (!order) {
   return res.status(404).json({ error: 'Заказ не найден' });
 }

 // Можно отменить только активные заказы
 if (!['pending', 'confirmed', 'ready'].includes(order.status)) {
   return res.status(400).json({ error: 'Нельзя отменить завершённый или уже отменённый заказ' });
 }

 order.status = 'cancelled';
 await order.save();

 // Уведомление админу
 try {
   const admins = await User.find({ role: 'admin' });
   for (const admin of admins) {
     await createNotification(
       admin._id,
       'order_status',
       'Заказ отменён',
       `Пользователь отменил заказ #${order.id}`,
       order.id,
       'order'
     );
   }
 } catch (notifyError) {
   logger.error('Ошибка уведомления:', notifyError);
 }

 res.json({
   message: 'Заказ отменён',
   order
 });
 } catch (err) {
 logger.error('Ошибка отмены заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка отмены заказа' });
 }
};

// Мягкое удаление заказа (в историю)
export const deleteMyOrder = async (req, res) => {
 try {
 const { id } = req.params;

 const order = await Order.findOne({ id, userId: req.user._id });
 if (!order) {
   return res.status(404).json({ error: 'Заказ не найден' });
 }

 // Нельзя удалить активный заказ - только отменить
 if (['pending', 'confirmed', 'ready'].includes(order.status)) {
   return res.status(400).json({ error: 'Сначала отмените заказ' });
 }

 order.isDeleted = true;
 order.deletedAt = new Date();
 await order.save();

 res.json({
   message: 'Заказ перемещён в историю',
   order
 });
 } catch (err) {
 logger.error('Ошибка удаления заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка удаления заказа' });
 }
};

// Мягкое удаление заказа админом
export const deleteOrderAdmin = async (req, res) => {
 try {
 const { id } = req.params;

 const order = await Order.findOne({ id });
 if (!order) {
   return res.status(404).json({ error: 'Заказ не найден' });
 }

 order.isDeleted = true;
 order.deletedAt = new Date();
 await order.save();

 res.json({
   message: 'Заказ перемещён в историю',
   order
 });
 } catch (err) {
 logger.error('Ошибка удаления заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка удаления заказа' });
 }
};

export const updateOrderStatusAdmin = async (req, res) => {
 try {
 const { id } = req.params;
 const { status } = req.body;

 if (!AVAILABLE_STATUSES.includes(status)) {
 return res.status(400).json({ error: 'Некорректный статус заказа' });
 }

 const order = await Order.findOne({ id });
 if (!order) {
 return res.status(404).json({ error: 'Заказ не найден' });
 }

 const oldStatus = order.status;
 order.status = status;
 await order.save();

 // Получаем информацию о товаре
 const product = await Product.findOne({ id: order.productId });

 // Уведомление пользователю об изменении статуса
 try {
   await createNotification(
     order.userId,
     'order_status',
     'Статус заказа изменен',
     `Ваш заказ #${order.id} на ${product?.name || 'товар'} теперь: ${STATUS_TITLES[status]}`,
     order.id,
     'order'
   );
 } catch (notifyError) {
   logger.error('Ошибка отправки уведомления:', notifyError);
 }

 res.json({
 message: 'Статус заказа обновлён',
 order,
 });
 } catch (err) {
 logger.error('Ошибка обновления статуса заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка обновления заказа' });
 }
};
