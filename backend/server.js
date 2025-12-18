import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import catalogRoutes from './src/routes/catalogRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB подключена успешно'))
  .catch((err) => console.error('Ошибка подключения к MongoDB:', err));

app.get('/', (req, res) => {
  res.json({
    message: 'Backend для интернет-магазина работает!',
    endpoints: {
      catalog: 'GET /api/catalog',
      addProduct: 'POST /api/products',
      initialize: 'POST /api/initialize'
    },
    frontend: FRONTEND_URL
  });
});

app.use('/api', catalogRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.listen(PORT, () => {
  console.log(`   Сервер запущен на порту ${PORT}`);
  console.log(`   Доступные эндпоинты:`);
  console.log(`   GET  http://localhost:${PORT}/api/catalog`);
  console.log(`   POST http://localhost:${PORT}/api/products`);
  console.log(`   POST http://localhost:${PORT}/api/initialize`);
  console.log(`   Frontend URL: ${FRONTEND_URL}`);
});
