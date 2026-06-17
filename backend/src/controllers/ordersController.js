import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { getNextId } from '../utils/idGenerator.js';
import { createNotification } from './notificationsController.js';
import logger from '../utils/logger.js';

const AVAILABLE_STATUSES = ['pending', 'processing', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering', 'completed', 'cancelled'];

const STATUS_TITLES = {
  pending: 'В обработке',
  processing: 'Проверка продавцом',
  confirmed: 'Подтверждение',
  preorder: 'Предзаказ',
  ready_for_pickup: 'Готов к выдаче',
  delivering: 'Доставляется',
  completed: 'Получен',
  cancelled: 'Отменён',
};

// Генерация 5-значного кода
const generateVerificationCode = () => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const createOrder = async (req, res) => {
 try {
 const { items, deliveryType, deliveryAddress, pickupDate, contactPhone, contactName } = req.body;

 if (!items || !Array.isArray(items) || items.length === 0) {
 return res.status(400).json({ error: 'Заказ должен содержать хотя бы один товар' });
 }

 if (!contactPhone || !contactName) {
 return res.status(400).json({ error: 'Укажите контактное имя и телефон' });
 }

 const orderItems = [];
 let totalAmount = 0;

 for (const item of items) {
 if (!item.productId || !item.quantity || item.quantity < 1) {
 return res.status(400).json({ error: 'Некорректные данные товара' });
 }

 const product = await Product.findOne({ id: item.productId });
 if (!product) {
 return res.status(404).json({ error: `Товар ${item.productId} не найден` });
 }

 orderItems.push({
 productId: item.productId,
 name: product.name,
 price: product.price,
 quantity: item.quantity,
 image: product.images?.[0] || '',
 });

 totalAmount += product.price * item.quantity;
 }

 const order = new Order({
 id: await getNextId('ord'),
 userId: req.user._id,
 items: orderItems,
 totalAmount,
 deliveryType: deliveryType || 'pickup',
 deliveryAddress: deliveryAddress?.trim() || '',
 pickupDate: pickupDate ? new Date(pickupDate) : null,
 contactPhone: contactPhone.trim(),
 contactName: contactName.trim(),
 status: 'pending',
 });

 await order.save();

 try {
   const user = await User.findById(req.user._id);
   const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;

   await createNotification(
     req.user._id,
     'new_order',
     'Заказ оформлен',
     `Ваш заказ #${order.id} на сумму ${totalAmount} ₽ оформлен. Ожидает подтверждения.`,
     order.id,
     'order'
   );

   const admins = await User.find({ role: 'admin' });
   for (const admin of admins) {
     await createNotification(
       admin._id,
       'new_order',
       'Новый заказ',
       `Поступил новый заказ #${order.id} от ${userName} на сумму ${totalAmount} ₽.`,
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

 const baseFilter = { userId: req.user._id };
 if (filter === 'active') {
   baseFilter.isDeleted = false;
   baseFilter.status = { $in: ['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering'] };
 } else if (filter === 'history') {
   baseFilter.isDeleted = true;
 }

 const orders = await Order.find(baseFilter).sort({ createdAt: -1 });

 res.json({
 orders,
 stats: {
   active: await Order.countDocuments({ userId: req.user._id, isDeleted: false, status: { $in: ['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering'] } }),
   history: await Order.countDocuments({ userId: req.user._id, isDeleted: true })
 }
 });
 } catch (err) {
 logger.error('Ошибка получения заказов:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка получения заказов' });
 }
};

export const getMyOrderById = async (req, res) => {
 try {
 const { id } = req.params;

 const order = await Order.findOne({ id, userId: req.user._id });
 if (!order) {
 return res.status(404).json({ error: 'Заказ не найден' });
 }

 res.json({ order });
 } catch (err) {
 logger.error('Ошибка получения заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка получения заказа' });
 }
};

export const getAllOrdersAdmin = async (req, res) => {
 try {
 const { filter = 'active' } = req.query;

 const baseFilter = {};
 if (filter === 'active') {
   baseFilter.isDeleted = false;
   baseFilter.status = { $in: ['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering'] };
 } else if (filter === 'history') {
   baseFilter.isDeleted = true;
 }

 const orders = await Order.find(baseFilter).populate('userId', 'firstName lastName email phoneNumber role').sort({ createdAt: -1 });

 const [activeCount, historyCount, pendingCount] = await Promise.all([
   Order.countDocuments({ isDeleted: false, status: { $in: ['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering'] } }),
   Order.countDocuments({ isDeleted: true }),
   Order.countDocuments({ isDeleted: false, status: 'pending' })
 ]);

 res.json({
 orders,
 stats: {
   total: activeCount + historyCount,
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

export const cancelMyOrder = async (req, res) => {
 try {
 const { id } = req.params;

 const order = await Order.findOne({ id, userId: req.user._id });
 if (!order) {
   return res.status(404).json({ error: 'Заказ не найден' });
 }

 if (!['pending', 'confirmed', 'preorder'].includes(order.status)) {
   return res.status(400).json({ error: 'Нельзя отменить этот заказ' });
 }

 order.status = 'cancelled';
 await order.save();

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

export const deleteMyOrder = async (req, res) => {
 try {
 const { id } = req.params;

 const order = await Order.findOne({ id, userId: req.user._id });
 if (!order) {
   return res.status(404).json({ error: 'Заказ не найден' });
 }

 if (['pending', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering'].includes(order.status)) {
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
 const { status, preorderMessage } = req.body;

 if (!AVAILABLE_STATUSES.includes(status)) {
 return res.status(400).json({ error: 'Некорректный статус заказа' });
 }

 const order = await Order.findOne({ id });
 if (!order) {
 return res.status(404).json({ error: 'Заказ не найден' });
 }

 const oldStatus = order.status;
 order.status = status;
 if (preorderMessage) {
   order.preorderMessage = preorderMessage;
 }

 // Автоматически перемещаем в историю при завершении
 if (status === 'completed') {
   order.isDeleted = true;
   order.deletedAt = new Date();
 }

 await order.save();

 try {
   const user = await User.findById(order.userId);
   const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;

   let notificationMessage = `Ваш заказ #${order.id} теперь: ${STATUS_TITLES[status]}.`;
   if (preorderMessage) {
     notificationMessage += ` ${preorderMessage}`;
   }

   await createNotification(
     order.userId,
     'order_status',
     'Статус заказа изменён',
     notificationMessage.trim(),
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

export const updateOrderDelivery = async (req, res) => {
 try {
 const { id } = req.params;
 const { deliveryType, deliveryAddress, pickupDate } = req.body;

 const order = await Order.findOne({ id, userId: req.user._id });
 if (!order) {
 return res.status(404).json({ error: 'Заказ не найден' });
 }

 if (order.status !== 'confirmed') {
 return res.status(400).json({ error: 'Можно выбрать способ получения только для подтверждённых заказов' });
 }

 if (deliveryType === 'delivery' && !deliveryAddress) {
 return res.status(400).json({ error: 'Укажите адрес доставки' });
 }

 if (deliveryType === 'pickup' && !pickupDate) {
 return res.status(400).json({ error: 'Укажите дату самовывоза' });
 }

 const pickupDateTime = pickupDate ? new Date(pickupDate) : null;
 if (pickupDateTime && (Number.isNaN(pickupDateTime.getTime()) || pickupDateTime <= new Date())) {
 return res.status(400).json({ error: 'Некорректная дата получения' });
 }

 order.deliveryType = deliveryType;
 if (deliveryAddress) order.deliveryAddress = deliveryAddress.trim();
 if (pickupDate) order.pickupDate = pickupDateTime;

 await order.save();

 res.json({
 message: 'Способ получения обновлён',
 order,
 });
 } catch (err) {
 logger.error('Ошибка обновления доставки:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка обновления доставки' });
 }
};

// Проверка кода подтверждения и выдача заказа
export const verifyOrderCode = async (req, res) => {
 try {
 const { id } = req.params;
 const { code } = req.body;

 const order = await Order.findOne({ id });
 if (!order) {
 return res.status(404).json({ error: 'Заказ не найден' });
 }

 if (order.status !== 'ready_for_pickup') {
 return res.status(400).json({ error: 'Заказ ещё не готов к выдаче' });
 }

 if (order.verificationCode !== code) {
 return res.status(400).json({ error: 'Неверный код подтверждения' });
 }

 order.codeVerified = true;
 order.status = 'completed';
 await order.save();

 try {
   const user = await User.findById(order.userId);
   const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;

   await createNotification(
     order.userId,
     'order_completed',
     'Заказ получен',
     `Ваш заказ #${order.id} успешно получен. Спасибо за покупку!`,
     order.id,
     'order'
   );
 } catch (notifyError) {
   logger.error('Ошибка отправки уведомления:', notifyError);
 }

 res.json({
 message: 'Код подтверждён. Заказ выдан.',
 order,
 });
 } catch (err) {
 logger.error('Ошибка проверки кода:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка проверки кода' });
 }
};
