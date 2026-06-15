<template>
  <div class="notifications-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Уведомления</h1>
        <p class="page-subtitle">Рассылки и уведомления пользователям</p>
      </div>
      <button class="btn-primary" @click="showModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Отправить уведомление
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">Загрузка...</div>

    <div v-else-if="notifications.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
      </div>
      <h3>Нет уведомлений</h3>
      <p>Отправьте первое уведомление пользователям</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="notifications-table">
        <thead>
          <tr>
            <th>Получатель</th>
            <th>Тип</th>
            <th>Заголовок</th>
            <th>Сообщение</th>
            <th>Статус</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in notifications" :key="n._id || n.id">
            <td class="user-cell">{{ n.userName || 'Все' }}</td>
            <td>
              <span :class="['type-badge', n.type]">{{ typeLabel(n.type) }}</span>
            </td>
            <td class="title-cell">{{ n.title }}</td>
            <td class="msg-cell">{{ n.message }}</td>
            <td>
              <span :class="['status-badge', n.isRead ? 'read' : 'unread']">
                {{ n.isRead ? 'Прочитано' : 'Новое' }}
              </span>
            </td>
            <td class="muted">{{ formatDate(n.createdAt) }}</td>
            <td>
              <button class="btn-icon btn-icon-danger" title="Удалить" @click="deleteHandler(n)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Send Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Отправить уведомление</h2>
          <button class="btn-close" @click="showModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="sendNotification" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Тип уведомления</label>
              <select v-model="form.type" class="input" required>
                <option value="promo">Акция</option>
                <option value="new_product">Новый товар</option>
                <option value="order_status">Статус заказа</option>
                <option value="new_order">Новый заказ</option>
              </select>
            </div>
            <div class="form-group">
              <label>Кому</label>
              <select v-model="form.recipientType" class="input">
                <option value="all">Всем пользователям</option>
                <option value="user">Конкретному пользователю</option>
              </select>
            </div>
          </div>

          <div v-if="form.recipientType === 'user'" class="form-group">
            <label>Пользователь</label>
            <select v-model="form.userId" class="input" required>
              <option value="">Выберите...</option>
              <option v-for="user in users" :key="user._id" :value="user._id">
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Заголовок</label>
            <input v-model="form.title" class="input" placeholder="Заголовок уведомления" required />
          </div>

          <div class="form-group">
            <label>Сообщение</label>
            <textarea v-model="form.message" class="input" rows="3" placeholder="Текст уведомления..." required></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showModal = false">Отмена</button>
            <button type="submit" class="btn-primary">Отправить</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllNotificationsAdmin, deleteNotification, getAdminUsers } from '@/api'

const showModal = ref(false)
const isLoading = ref(false)
const notifications = ref<any[]>([])
const users = ref<any[]>([])

const form = ref({
  recipientType: 'all',
  userId: '',
  type: 'promo',
  title: '',
  message: '',
})

const typeLabel = (type: string) => {
  const map: Record<string, string> = { promo: 'Акция', new_product: 'Товар', order_status: 'Статус', new_order: 'Заказ' }
  return map[type] || type
}

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const loadNotifications = async () => {
  isLoading.value = true
  try {
    const res = await getAllNotificationsAdmin()
    notifications.value = res.data.notifications || []
  } catch (err) {
    console.error('Failed to load notifications:', err)
  } finally {
    isLoading.value = false
  }
}

const loadUsers = async () => {
  try {
    const res = await getAdminUsers()
    users.value = res.data.users || []
  } catch (err) {
    console.error('Failed to load users:', err)
  }
}

const deleteHandler = async (notif: any) => {
  try {
    await deleteNotification(notif._id || notif.id)
    await loadNotifications()
  } catch (err) {
    // error handled silently
  }
}

const sendNotification = async () => {
  if (form.value.recipientType === 'user' && !form.value.userId) {
    return
  }
  try {
    // API call would go here
    showModal.value = false
    resetForm()
    await loadNotifications()
  } catch (err) {
    // error handled silently
  }
}

const resetForm = () => {
  form.value = { recipientType: 'all', userId: '', type: 'promo', title: '', message: '' }
}

onMounted(() => {
  loadNotifications()
  loadUsers()
})
</script>

<style scoped>
.notifications-admin { display: flex; flex-direction: column; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

.btn-primary {
  display: flex; align-items: center; gap: 6px; padding: 9px 16px;
  background: var(--color-primary); color: white; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary svg { width: 16px; height: 16px; }
.btn-ghost { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; }

/* Table */
.table-wrapper { overflow-x: auto; }
.notifications-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.notifications-table th { text-align: left; padding: 10px 12px; color: var(--color-text-tertiary); font-weight: 500; font-size: 12px; border-bottom: 1px solid var(--color-border); white-space: nowrap; }
.notifications-table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border-light, #F3F4F6); }
.notifications-table tr:hover { background: var(--color-surface-secondary, #F9FAFB); }
.user-cell { font-weight: 500; }
.title-cell { font-weight: 500; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.msg-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-text-secondary); }
.muted { color: var(--color-text-tertiary); white-space: nowrap; }

.type-badge { font-size: 11px; padding: 2px 8px; border-radius: 5px; font-weight: 500; white-space: nowrap; }
.type-badge.promo { background: #F3E8FF; color: #7C3AED; }
.type-badge.new_product { background: #DBEAFE; color: #2563EB; }
.type-badge.order_status { background: #FEF3C7; color: #92400E; }
.type-badge.new_order { background: #D1FAE5; color: #065F46; }

.status-badge { font-size: 11px; padding: 2px 8px; border-radius: 5px; font-weight: 500; white-space: nowrap; }
.status-badge.unread { background: #FEE2E2; color: #DC2626; }
.status-badge.read { background: #E0F2FE; color: #0369A1; }

.btn-icon {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--color-text-tertiary);
}
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon-danger:hover { background: var(--color-error-light, #FEE2E2); color: var(--color-error); }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-surface-secondary, #F9FAFB); margin-bottom: 16px; }
.empty-icon svg { width: 24px; height: 24px; color: var(--color-text-tertiary); }
.empty-state h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; }
.empty-state p { margin: 0; font-size: 14px; color: var(--color-text-secondary); }
.loading-state { padding: 40px; text-align: center; color: var(--color-text-tertiary); }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: var(--color-surface); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); width: 90%; max-width: 520px; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 600; }
.btn-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: var(--color-surface-secondary, #F9FAFB); border-radius: 8px; cursor: pointer; }
.btn-close:hover { background: var(--color-border); }
.btn-close svg { width: 16px; height: 16px; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; }
.input { padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 13px; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); outline: none; }
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
textarea.input { resize: vertical; min-height: 70px; }
select.input { cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; border-top: 1px solid var(--color-border-light, #F3F4F6); margin-top: 4px; }

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>
