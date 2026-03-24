import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { getNextId } from '../utils/idGenerator.js';

const AVAILABLE_STATUSES = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];

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

 res.status(201).json({
 message: 'Заказ успешно оформлен',
 order,
 });
 } catch (err) {
 console.error('Ошибка создания заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка создания заказа' });
 }
};

export const getMyOrders = async (req, res) => {
 try {
 const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
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

 res.json({ orders: result });
 } catch (err) {
 console.error('Ошибка получения заказов:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка получения заказов' });
 }
};

export const getAllOrdersAdmin = async (req, res) => {
 try {
 const orders = await Order.find({}).populate('userId', 'firstName lastName email phoneNumber role').sort({ createdAt: -1 });
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

 res.json({ orders: result });
 } catch (err) {
 console.error('Ошибка получения всех заказов:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка получения заказов' });
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

 order.status = status;
 await order.save();

 res.json({
 message: 'Статус заказа обновлён',
 order,
 });
 } catch (err) {
 console.error('Ошибка обновления статуса заказа:', err.message);
 res.status(500).json({ error: err.message || 'Ошибка обновления заказа' });
 }
};
