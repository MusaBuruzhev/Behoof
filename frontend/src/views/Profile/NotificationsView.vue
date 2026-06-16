<template>
  <div class="notifications-view">
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Уведомления</h1>
          <p class="page-subtitle">Будьте в курсе всех событий</p>
        </div>
        <div class="header-actions">
          <button
            v-if="hasUnread"
            class="btn btn-secondary btn-sm"
            @click="markAllAsRead"
          >
            Отметить все прочитанными
          </button>
          <button
            v-if="notifications.length > 0"
            class="btn btn-outline btn-sm"
            @click="clearRead"
          >
            Очистить прочитанные
          </button>
        </div>
      </div>
    </header>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка уведомлений...</p>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="notifications.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <h3 class="empty-title">Нет уведомлений</h3>
      <p class="empty-text">Здесь будут появляться уведомления о заказах и акциях</p>
    </div>
    
    <!-- Notifications List -->
    <div v-else class="notifications-list">
      <div
        v-for="(group, date) in groupedNotifications"
        :key="date"
        class="notification-group"
      >
        <h3 class="group-date">{{ formatGroupDate(date) }}</h3>
        
        <div class="group-notifications">
          <div
            v-for="notification in group"
            :key="notification.id"
            :class="['notification-card', { unread: !notification.isRead }]"
          >
            <div class="notification-icon" :class="notification.type">
              <component :is="getNotificationIcon(notification.type)" />
            </div>
            
            <div class="notification-content">
              <div class="notification-header">
                <h4 class="notification-title">{{ notification.title }}</h4>
                <span v-if="!notification.isRead" class="unread-badge"></span>
              </div>
              <p class="notification-message">{{ notification.message }}</p>
              <div class="notification-meta">
                <span class="notification-time">{{ formatNotificationTime(notification.createdAt) }}</span>
                <span v-if="!notification.isRead" class="notification-type-label">Новое</span>
              </div>
            </div>
            
            <div class="notification-actions">
              <button
                v-if="!notification.isRead"
                class="action-btn"
                title="Отметить прочитанным"
                @click="markAsRead(notification.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <button
                class="action-btn delete-btn"
                title="Удалить"
                @click="deleteNotificationById(notification.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { getNotifications, markAsRead as markAsReadApi, markAllAsRead as markAllAsReadApi, deleteNotification, clearReadNotifications } from '@/api'
import { useNotificationsStore } from '@/stores'
import type { Notification, NotificationType } from '@/types'

const notificationsStore = useNotificationsStore()

const notifications = ref<Notification[]>([])
const isLoading = ref(true)

const hasUnread = computed(() => {
  return notifications.value.some(n => !n.isRead)
})

const groupedNotifications = computed(() => {
  const groups: Record<string, Notification[]> = {}
  
  notifications.value.forEach(notification => {
    const date = new Date(notification.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(notification)
  })
  
  return groups
})

const getNotificationIcon = (type: NotificationType) => {
  const icons: Record<NotificationType, any> = {
    new_order: OrderIcon,
    order_status: StatusIcon,
    promo: PromoIcon,
    new_product: ProductIcon,
  }
  return icons[type] || DefaultIcon
}

const formatGroupDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера'
  }
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const loadNotifications = async () => {
  isLoading.value = true
  try {
    const response = await getNotifications({ limit: 50 })
    notifications.value = response.data.notifications || []
    notificationsStore.setNotifications(notifications.value)
    notificationsStore.setUnreadCount(response.data.unreadCount || 0)
  } catch (error) {
    console.error('Failed to load notifications:', error)
  } finally {
    isLoading.value = false
  }
}

const markAsRead = async (notificationId: string) => {
  try {
    await markAsReadApi(notificationId)
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.isRead = true
      notificationsStore.markAsRead(notificationId)
    }
  } catch (error) {
    console.error('Failed to mark as read:', error)
  }
}

const markAllAsRead = async () => {
  try {
    await markAllAsReadApi()
    notifications.value.forEach(n => n.isRead = true)
    notificationsStore.markAllAsRead()
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

const deleteNotificationById = async (notificationId: string) => {
  try {
    await deleteNotification(notificationId)
    notifications.value = notifications.value.filter(n => n.id !== notificationId)
  } catch (error) {
    console.error('Failed to delete notification:', error)
  }
}

const clearRead = async () => {
  try {
    await clearReadNotifications()
    await loadNotifications()
  } catch (error) {
    console.error('Failed to clear read notifications:', error)
  }
}

// Icons
const OrderIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414' })
  ])
}

const StatusIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('polyline', { points: '12 6 12 12 16 14' })
  ])
}

const PromoIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z' }),
    h('line', { x1: '7', y1: '7', x2: '7.01', y2: '7' })
  ])
}

const ProductIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('path', { d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' }),
    h('path', { d: 'M2 12h20' })
  ])
}

const DefaultIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('circle', { cx: '12', cy: '12', r: '10' }),
    h('line', { x1: '12', y1: '8', x2: '12', y2: '12' }),
    h('line', { x1: '12', y1: '16', x2: '12.01', y2: '16' })
  ])
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notifications-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.page-header {
  margin-bottom: var(--spacing-2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.page-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--spacing-3);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-small);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: var(--spacing-4);
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}

.empty-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.empty-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-6) 0;
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.notification-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.group-date {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  margin: 0;
}

.group-notifications {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* Notification Card */
.notification-card {
  display: flex;
  gap: var(--spacing-6);
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}

.notification-card.unread {
  background: var(--color-background);
  border-left-color: var(--color-primary);
  box-shadow: var(--shadow-lg);
}

.notification-card:hover {
  box-shadow: var(--shadow-lg);
}

.notification-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon svg {
  width: 28px;
  height: 28px;
}

.notification-icon.new_order {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.notification-icon.order_status {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.notification-icon.promo {
  background: rgba(236, 72, 153, 0.1);
  color: #EC4899;
}

.notification-icon.new_product {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

.notification-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.notification-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.notification-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.unread-badge {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  flex-shrink: 0;
}

.notification-message {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
  line-height: var(--line-height-relaxed);
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.notification-type-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: rgba(37, 99, 235, 0.1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
}

/* Notification Actions */
.notification-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-background);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.delete-btn:hover {
  background: var(--color-error);
  color: var(--color-text-inverse);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
  
  .header-actions {
    width: 100%;
  }
  
  .header-actions .btn {
    flex: 1;
  }
  
  .notification-card {
    flex-direction: column;
  }
  
  .notification-actions {
    flex-direction: row;
    align-self: flex-end;
  }
}
</style>
