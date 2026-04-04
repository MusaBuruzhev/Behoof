<template>
  <div class="notifications-page">
    <div class="container">
      <div class="page-header">
        <h1>Уведомления</h1>
        <div class="header-actions">
          <button v-if="unreadCount > 0" @click="markAllAsRead" class="action-btn">
            Отметить все прочитанными
          </button>
          <button
            v-if="hasReadNotifications"
            @click="clearReadNotifications"
            class="action-btn secondary"
          >
            Очистить прочитанные
          </button>
        </div>
      </div>

      <!-- Фильтры -->
      <div class="filters">
        <button
          v-for="filter in filters"
          :key="filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]"
          @click="setFilter(filter.value)"
        >
          {{ filter.label }}
          <span v-if="filter.count !== undefined && filter.count > 0" class="filter-count">
            {{ filter.count }}
          </span>
        </button>
      </div>

      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Загрузка уведомлений...</p>
      </div>

      <div v-else-if="notifications.length === 0" class="empty">
        <div class="empty-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ccc"
            stroke-width="1.5"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <p>У вас пока нет уведомлений</p>
      </div>

      <div v-else class="notifications-list">
        <article
          v-for="notification in notifications"
          :key="notification._id"
          :class="['notification-card', { unread: !notification.isRead }]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon" :class="getTypeClass(notification.type)">
            <component :is="getTypeIcon(notification.type)" />
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <span class="notification-title">{{ notification.title }}</span>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <span :class="['notification-type-badge', notification.type]">
                {{ getTypeLabel(notification.type) }}
              </span>
              <span v-if="notification.isNew" class="new-badge">Новое</span>
            </div>
          </div>

          <button
            class="delete-btn"
            @click.stop="deleteNotification(notification._id)"
            title="Удалить"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </article>
      </div>

      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)" class="page-btn">
          Предыдущая
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="page-btn"
        >
          Следующая
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import notificationsAPI from '@/api/notifications.js'

export default {
  name: 'NotificationsView',
  data() {
    return {
      notifications: [],
      loading: true,
      currentPage: 1,
      limit: 20,
      total: 0,
      totalPages: 1,
      unreadCount: 0,
      activeFilter: 'all',
    }
  },
  computed: {
    filters() {
      return [
        { value: 'all', label: 'Все', count: this.total },
        { value: 'unread', label: 'Непрочитанные', count: this.unreadCount },
        { value: 'read', label: 'Прочитанные' },
      ]
    },
    hasReadNotifications() {
      return this.total - this.unreadCount > 0
    },
  },
  async mounted() {
    await this.loadNotifications()
  },
  methods: {
    async loadNotifications() {
      try {
        this.loading = true
        const params = {
          page: this.currentPage,
          limit: this.limit,
        }

        if (this.activeFilter === 'unread') {
          params.isRead = false
        } else if (this.activeFilter === 'read') {
          params.isRead = true
        }

        console.log('Загрузка уведомлений с params:', params)
        const data = await notificationsAPI.getNotifications(params)
        console.log('Ответ от сервера:', data)
        this.notifications = data.notifications || []
        this.total = data.total
        this.totalPages = data.totalPages
        this.unreadCount = data.unreadCount
        console.log('Загружено уведомлений:', this.notifications.length)
      } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error)
      } finally {
        this.loading = false
      }
    },

    setFilter(filter) {
      this.activeFilter = filter
      this.currentPage = 1
      this.loadNotifications()
    },

    async changePage(page) {
      this.currentPage = page
      await this.loadNotifications()
    },

    async markAllAsRead() {
      try {
        await notificationsAPI.markAllAsRead()
        await this.loadNotifications()
      } catch (error) {
        console.error('Ошибка отметки уведомлений:', error)
      }
    },

    async clearReadNotifications() {
      try {
        await notificationsAPI.clearRead()
        await this.loadNotifications()
      } catch (error) {
        console.error('Ошибка очистки уведомлений:', error)
      }
    },

    async deleteNotification(id) {
      try {
        await notificationsAPI.deleteNotification(id)
        this.unreadCount = await notificationsAPI.getUnreadCount().then((r) => r.unreadCount)
        this.notifications = this.notifications.filter((n) => n._id !== id)
      } catch (error) {
        console.error('Ошибка удаления уведомления:', error)
      }
    },

    async handleNotificationClick(notification) {
      if (!notification.isRead) {
        try {
          await notificationsAPI.markAsRead(notification._id)
          notification.isRead = true
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        } catch (error) {
          console.error('Ошибка отметки уведомления:', error)
        }
      }

      // Проверяем роль пользователя
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      const isAdmin = user?.role === 'admin'

      // Переход по связанному объекту
      if (notification.relatedType === 'order') {
        // Для админа - в админ-панель на заказы, для пользователя - к своим заказам
        if (isAdmin) {
          this.$router.push('/admin?tab=orders')
        } else {
          this.$router.push('/orders')
        }
      } else if (notification.relatedType === 'product' && notification.relatedId) {
        this.$router.push(`/product/${notification.relatedId}`)
      }
    },

    getTypeClass(type) {
      const map = {
        new_order: 'type-order',
        order_status: 'type-status',
        new_product: 'type-product',
        promo: 'type-promo',
      }
      return map[type] || 'type-default'
    },

    getTypeLabel(type) {
      const map = {
        new_order: 'Заказ',
        order_status: 'Статус заказа',
        new_product: 'Новый товар',
        promo: 'Акция',
      }
      return map[type] || type
    },

    getTypeIcon(type) {
      // Возвращаем компонент для иконки
      return {
        template: `
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
 ${type === 'new_order' ? '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' : ''}
 ${type === 'order_status' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' : ''}
 ${type === 'new_product' ? '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>' : ''}
 ${type === 'promo' ? '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' : ''}
 </svg>
 `,
      }
    },

    formatTime(date) {
      const now = new Date()
      const d = new Date(date)
      const diff = now - d
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) return 'Только что'
      if (minutes < 60) return `${minutes} мин. назад`
      if (hours < 24) return `${hours} ч. назад`
      if (days < 7) return `${days} дн. назад`

      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
    },
  },
}
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30px 0;
}

.container {
  width: 85%;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

h1 {
  font-size: 32px;
  color: #263141;
  margin: 0;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 10px 20px;
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #e63939;
  transform: translateY(-2px);
}

.action-btn.secondary {
  background: #f5f7fa;
  color: #666;
}

.action-btn.secondary:hover {
  background: #e8ecf1;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 10px 20px;
  background: #fff;
  border: 2px solid #e8ecf1;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-btn:hover {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.filter-btn.active {
  background: #ff4d4d;
  border-color: #ff4d4d;
  color: white;
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.3);
}

.loading {
  background: #fff;
  padding: 60px;
  border-radius: 16px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff4d4d;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty {
  background: #fff;
  padding: 60px;
  border-radius: 16px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
}

.empty p {
  font-size: 18px;
  color: #666;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  position: relative;
}

.notification-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  background: #fff;
  border-color: #ff4d4d;
}

.notification-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.type-order {
  background: #e3f2fd;
  color: #1976d2;
}

.notification-icon.type-status {
  background: #fff8e1;
  color: #f57c00;
}

.notification-icon.type-product {
  background: #e8f5e9;
  color: #388e3c;
}

.notification-icon.type-promo {
  background: #fce4ec;
  color: #e91e63;
}

.notification-icon.type-default {
  background: #f5f7fa;
  color: #666;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
  gap: 12px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #263141;
}

.notification-time {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
}

.notification-message {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.notification-type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.notification-type-badge.new_order {
  background: #e3f2fd;
  color: #1976d2;
}

.notification-type-badge.order_status {
  background: #fff8e1;
  color: #f57c00;
}

.notification-type-badge.new_product {
  background: #e8f5e9;
  color: #388e3c;
}

.notification-type-badge.promo {
  background: #fce4ec;
  color: #e91e63;
}

.new-badge {
  padding: 4px 10px;
  background: #ff4d4d;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.delete-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
  position: absolute;
  top: 12px;
  right: 12px;
}

.delete-btn:hover {
  color: #ff4d4d;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 30px;
}

.page-btn {
  padding: 10px 20px;
  background: #fff;
  border: 2px solid #e8ecf1;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

@media (max-width: 640px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .action-btn {
    flex: 1;
    text-align: center;
  }

  .notification-card {
    flex-wrap: wrap;
  }

  .notification-header {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
