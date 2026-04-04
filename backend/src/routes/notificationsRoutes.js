import express from 'express';
import { authenticate, requireAdmin } from '../controllers/authController.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  getAllNotificationsAdmin,
} from '../controllers/notificationsController.js';

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Получить уведомления пользователя
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Список уведомлений
 */
router.get('/notifications', authenticate, getNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Получить количество непрочитанных
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Количество непрочитанных
 */
router.get('/notifications/unread-count', authenticate, getUnreadCount);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Отметить уведомление как прочитанное
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Уведомление отмечено
 */
router.put('/notifications/:id/read', authenticate, markAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     tags: [Notifications]
 *     summary: Отметить все уведомления как прочитанные
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Все уведомления отмечены
 */
router.put('/notifications/read-all', authenticate, markAllAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Удалить уведомление
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Уведомление удалено
 */
router.delete('/notifications/:id', authenticate, deleteNotification);

/**
 * @swagger
 * /api/notifications/clear-read:
 *   delete:
 *     tags: [Notifications]
 *     summary: Удалить все прочитанные уведомления
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Прочитанные уведомления удалены
 */
router.delete('/notifications/clear-read', authenticate, clearReadNotifications);

// Админские роуты
router.get('/admin/notifications', authenticate, requireAdmin, getAllNotificationsAdmin);

export default router;
