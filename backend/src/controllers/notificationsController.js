import Notification from '../models/Notification.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Создать уведомление (экспортируется для использования в других контроллерах)
export const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    if (!userId) {
      logger.warn('createNotification: userId не передан');
      return null;
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType,
    });

    await notification.save();
    logger.info(`Уведомление создано: ${type} для пользователя ${userId}`);
    return notification;
  } catch (error) {
    logger.error('Ошибка создания уведомления:', error);
    // Не выбрасываем ошибку, чтобы не ломать основной функционал
    return null;
  }
};

// Создать уведомление для всех пользователей (для промо/новых товаров)
export const createBroadcastNotification = async (type, title, message, relatedId = null, relatedType = null) => {
  try {
    const users = await User.find({ role: 'user' }).select('_id');

    const notifications = users.map(user => ({
      userId: user._id,
      type,
      title,
      message,
      relatedId,
      relatedType,
    }));

    await Notification.insertMany(notifications);
    logger.info(`Broadcast уведомление создано для ${users.length} пользователей: ${type}`);
    return notifications.length;
  } catch (error) {
    logger.error('Ошибка создания broadcast уведомления:', error);
    throw error;
  }
};

// Получить уведомления пользователя
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, isRead, filter: filterType } = req.query;

    const filter = { userId, isDeleted: false };
    if (isRead !== undefined) {
      filter.isRead = isRead === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false, isDeleted: false }),
    ]);

    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    logger.error('Ошибка получения уведомлений:', error);
    res.status(500).json({ error: 'Ошибка получения уведомлений' });
  }
};

// Получить количество непрочитанных
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({ userId, isRead: false, isDeleted: false });
    res.json({ unreadCount: count });
  } catch (error) {
    logger.error('Ошибка получения счетчика:', error);
    res.status(500).json({ error: 'Ошибка получения счетчика' });
  }
};

// Отметить уведомление как прочитанное
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    notification.isRead = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false, isDeleted: false });

    res.json({
      message: 'Уведомление отмечено как прочитанное',
      unreadCount,
    });
  } catch (error) {
    logger.error('Ошибка отметки уведомления:', error);
    res.status(500).json({ error: 'Ошибка отметки уведомления' });
  }
};

// Отметить все как прочитанные
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: false, isDeleted: false },
      { isRead: true }
    );

    res.json({ message: 'Все уведомления отмечены как прочитанные' });
  } catch (error) {
    logger.error('Ошибка отметки всех уведомлений:', error);
    res.status(500).json({ error: 'Ошибка отметки всех уведомлений' });
  }
};

// Удалить уведомление (мягкое удаление)
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ error: 'Уведомление не найдено' });
    }

    notification.isDeleted = true;
    await notification.save();

    const unreadCount = await Notification.countDocuments({ userId, isRead: false, isDeleted: false });

    res.json({
      message: 'Уведомление скрыто',
      unreadCount,
    });
  } catch (error) {
    logger.error('Ошибка удаления уведомления:', error);
    res.status(500).json({ error: 'Ошибка удаления уведомления' });
  }
};

// Удалить все прочитанные уведомления (мягкое удаление)
export const clearReadNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { userId, isRead: true, isDeleted: false },
      { isDeleted: true }
    );

    const unreadCount = await Notification.countDocuments({ userId, isRead: false, isDeleted: false });

    res.json({
      message: 'Прочитанные уведомления скрыты',
      unreadCount,
    });
  } catch (error) {
    logger.error('Ошибка очистки уведомлений:', error);
    res.status(500).json({ error: 'Ошибка очистки уведомлений' });
  }
};

// Получить все уведомления (для админа)
export const getAllNotificationsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, isRead, filter: filterType } = req.query;

    const filter = { isDeleted: false };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('userId', 'email firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
    ]);

    const unreadCount = await Notification.countDocuments({ isRead: false, isDeleted: false });

    res.json({
      notifications,
      total,
      unreadCount,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    logger.error('Ошибка получения всех уведомлений (админ):', error);
    res.status(500).json({ error: 'Ошибка получения уведомлений' });
  }
};
