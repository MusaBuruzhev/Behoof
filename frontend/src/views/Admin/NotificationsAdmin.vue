<template>
  <div class="notifications-admin">
    <div class="header">
      <h1 class="title">Управление уведомлениями</h1>
      <button class="btn btn-primary" @click="showCreateForm = true">
        + Отправить уведомление
      </button>
    </div>

    <div class="notifications-list">
      <div v-if="notifications.length > 0" class="table">
        <div class="table-header">
          <div class="col-recipient">Получатель</div>
          <div class="col-message">Сообщение</div>
          <div class="col-status">Статус</div>
          <div class="col-date">Дата</div>
          <div class="col-actions">Действие</div>
        </div>

        <div v-for="notif in notifications" :key="notif.id" class="table-row">
          <div class="col-recipient">{{ notif.userName }}</div>
          <div class="col-message">{{ notif.message }}</div>
          <div class="col-status">
            <span class="badge" :class="{ 'badge-read': notif.isRead }">
              {{ notif.isRead ? 'Прочитано' : 'Новое' }}
            </span>
          </div>
          <div class="col-date">{{ formatDate(notif.createdAt) }}</div>
          <div class="col-actions">
            <button class="btn btn-small btn-danger" @click="deleteNotificationById(notif._id)">
              Удалить
            </button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">Нет уведомлений</div>
    </div>

    <!-- Send Notification Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Отправить уведомление</h2>
          <button class="btn-close" @click="showCreateForm = false">×</button>
        </div>

        <form @submit.prevent="sendNotification" class="form">
          <div class="form-group">
            <label>Тип уведомления *</label>
            <select v-model="form.type" required>
              <option value="promo">Акция</option>
              <option value="new_product">Новый товар</option>
              <option value="order_status">Статус заказа</option>
              <option value="new_order">Новый заказ</option>
            </select>
          </div>

          <div class="form-group">
            <label>Тип получателя *</label>
            <select v-model="form.recipientType" required>
              <option value="all">Всем пользователям</option>
              <option value="user">Конкретному пользователю</option>
            </select>
          </div>

          <div v-if="form.recipientType === 'user'" class="form-group">
            <label>Пользователь *</label>
            <select v-model="form.userId" required>
              <option value="">Выберите пользователя</option>
              <option v-for="user in users" :key="user._id" :value="user._id">
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Заголовок *</label>
            <input v-model="form.title" type="text" placeholder="Введите заголовок" required />
          </div>

          <div class="form-group">
            <label>Сообщение *</label>
            <textarea v-model="form.message" placeholder="Введите текст уведомления" required></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllNotificationsAdmin, deleteNotification, getAdminUsers } from '@/api'

const showCreateForm = ref(false)
const notifications = ref<any[]>([])
const users = ref<any[]>([])
const isLoading = ref(false)

const form = ref({
  recipientType: 'all',
  userId: '',
  type: 'promo',
  title: '',
  message: '',
})

const loadNotifications = async () => {
  try {
    const response = await getAllNotificationsAdmin()
    notifications.value = response.data.notifications || []
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
}

const loadUsers = async () => {
  try {
    const response = await getAdminUsers()
    users.value = response.data.users || []
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const formatDate = (date: string | Date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const sendNotification = async () => {
  try {
    if (form.value.recipientType === 'user' && !form.value.userId) {
      alert('Выберите пользователя')
      return
    }

    // В реальном приложении здесь был бы API вызов
    // await sendNotificationToUser({ ... })
    
    showCreateForm.value = false
    resetForm()
    await loadNotifications()
    alert('Уведомление отправлено')
  } catch (error) {
    console.error('Failed to send notification:', error)
    alert('Ошибка отправки уведомления')
  }
}

const deleteNotificationById = async (id: string) => {
  if (confirm('Вы уверены?')) {
    try {
      await deleteNotification(id)
      await loadNotifications()
    } catch (error) {
      console.error('Failed to delete notification:', error)
      alert('Ошибка удаления уведомления')
    }
  }
}

const resetForm = () => {
  form.value = {
    recipientType: 'all',
    userId: '',
    type: 'promo',
    title: '',
    message: '',
  }
}

onMounted(() => {
  loadNotifications()
  loadUsers()
})
</script>

<style scoped>
.notifications-admin {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.notifications-list {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.table {
  display: flex;
  flex-direction: column;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 1fr 1.5fr 1fr;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.table-header {
  font-weight: 600;
  background-color: var(--color-background);
  border-bottom: 2px solid var(--color-border);
}

.table-row:hover {
  background-color: var(--color-background);
}

.col-recipient,
.col-message,
.col-status,
.col-date,
.col-actions {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  display: inline-flex;
  padding: var(--spacing-1) var(--spacing-3);
  background-color: #FEE2E2;
  color: var(--color-error);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge.badge-read {
  background-color: #E0F2FE;
  color: var(--color-info);
}

.btn {
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-small {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 12px;
}

.btn-danger {
  background-color: #FEE2E2;
  color: var(--color-error);
}

.btn-danger:hover {
  background-color: #FCA5A5;
}

.empty-state {
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-text-secondary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.form {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface);
}
</style>
