import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const notificationsAPI = {
  // Получить все уведомления
  getNotifications(params = {}) {
    return api.get('/notifications', { params }).then(res => res.data);
  },

  // Получить количество непрочитанных
  getUnreadCount() {
    return api.get('/notifications/unread-count').then(res => res.data);
  },

  // Отметить уведомление как прочитанное
  markAsRead(id) {
    return api.put(`/notifications/${id}/read`).then(res => res.data);
  },

  // Отметить все как прочитанные
  markAllAsRead() {
    return api.put('/notifications/read-all').then(res => res.data);
  },

  // Удалить уведомление
  deleteNotification(id) {
    return api.delete(`/notifications/${id}`).then(res => res.data);
  },

  // Удалить все прочитанные
  clearRead() {
    return api.delete('/notifications/clear-read').then(res => res.data);
  },
};

export default notificationsAPI;
