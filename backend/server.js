/* global process */

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import catalogRoutes from './src/routes/catalogRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import ordersRoutes from './src/routes/ordersRoutes.js';
import notificationsRoutes from './src/routes/notificationsRoutes.js';
import swaggerSpec from './src/config/swagger.js';
import logger from './src/utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём папку для логов, если нет
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ============ CORS - обрабатываем ПЕРЕД helmet ============

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONTEND_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ============ БЕЗОПАСНОСТЬ ============

// Helmet - защитные заголовки (отключаем для разработки)
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Rate limiting - защита от брутфорса (менее строгий для разработки)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 500, // максимум 500 запросов
  message: {
    error: 'Слишком много запросов. Попробуйте позже.',
    retryAfter: '15 минут',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // отключаем в разработке
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 попыток за 15 минут (достаточно)
  message: {
    error: 'Слишком много попыток входа. Попробуйте позже.',
    retryAfter: '15 минут',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development', // отключаем в разработке
});

// Применяем лимиты
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ============ PARSERS ============

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ ЛОГИРОВАНИЕ ЗАПРОСОВ ============

app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logger.httpLog(req, res, responseTime);
  });

  next();
});

// ============ SWAGGER ============

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Behoof API Documentation',
  customfavIcon: '/favicon.ico',
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ============ БАЗОВЫЙ МАРШРУТ ============

app.get('/', (req, res) => {
  res.json({
    message: 'Backend для интернет-магазина работает!',
    endpoints: {
      catalog: 'GET /api/catalog',
      products: 'GET /api/products',
      addProduct: 'POST /api/products',
      initialize: 'POST /api/initialize',
      auth: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      documentation: 'GET /api-docs',
      swaggerJson: 'GET /api-docs.json',
    },
    frontend: FRONTEND_URL,
    docs: 'Полная документация: http://localhost:5000/api-docs',
  });
});

// ============ ПОДКЛЮЧЕНИЕ МАРШРУТОВ ============

app.use('/api', catalogRoutes);
app.use('/api', authRoutes);
app.use('/api', ordersRoutes);
app.use('/api', notificationsRoutes);

// ============ 404 ============

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// ============ ОБРАБОТКА ОШИБОК ============

app.use((err, req, res, next) => {
  logger.error(`Ошибка сервера: ${err.message}`, { stack: err.stack });

  const status = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Внутренняя ошибка сервера'
    : err.message;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ============ ЗАПУСК СЕРВЕРА ============

let server;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('MongoDB подключена успешно');

    server = app.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`);
      logger.info(`Документация API: http://localhost:${PORT}/api-docs`);
      logger.info(`Frontend: ${FRONTEND_URL}`);
    });
  })
  .catch((err) => {
    logger.error('Ошибка подключения к MongoDB:', err);
    process.exit(1);
  });

// ============ GRACEFUL SHUTDOWN ============

const gracefulShutdown = (signal) => {
  logger.info(`${signal} получен. Начинаем выключение...`);

  if (server) {
    server.close(() => {
      logger.info('HTTP сервер закрыт');

      mongoose.connection.close(false, () => {
        logger.info('Соединение с MongoDB закрыто');
        process.exit(0);
      });
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Необработанное отклонение Promise:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Неперехваченное исключение:', error);
  gracefulShutdown('uncaughtException');
});
