<template>
  <div class="admin-page">
    <div class="container">
      <h1>Панель администратора</h1>

      <section class="stats" v-if="stats">
        <div class="stat-card">
          <div class="stat-icon blue">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="stat-content">
            <strong>{{ stats.usersCount }}</strong>
            <span>Пользователей</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div class="stat-content">
            <strong>{{ stats.adminsCount }}</strong>
            <span>Админов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              />
            </svg>
          </div>
          <div class="stat-content">
            <strong>{{ stats.productsCount }}</strong>
            <span>Товаров</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div class="stat-content">
            <strong>{{ stats.ordersCount }}</strong>
            <span>Заказов</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="stat-content">
            <strong>{{ stats.pendingOrdersCount }}</strong>
            <span>Ожидают</span>
          </div>
        </div>
      </section>

      <div class="admin-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['tab-btn', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <section v-if="activeTab === 'users'" class="admin-block">
        <div class="users-list">
          <article v-for="user in users" :key="user._id" class="user-card">
            <div class="user-avatar">
              {{ (user.firstName?.[0] || '') + (user.lastName?.[0] || '') }}
            </div>
            <div class="user-info">
              <p class="user-name">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="user-email">{{ user.email }}</p>
            </div>
            <span :class="['user-role', user.role]">{{
              user.role === 'admin' ? 'Админ' : 'Пользователь'
            }}</span>
            <div class="user-actions">
              <button
                class="action-btn"
                @click="toggleRole(user)"
                :disabled="currentUserId === user._id"
              >
                {{ user.role === 'admin' ? 'Понизить' : 'Сделать админом' }}
              </button>
              <button
                class="action-btn danger"
                @click="removeUser(user)"
                :disabled="currentUserId === user._id"
              >
                Удалить
              </button>
            </div>
          </article>
        </div>
      </section>

      <section v-if="activeTab === 'settings'" class="admin-block">
        <h2>Настройки системы</h2>
        <div class="settings-section">
          <div class="setting-item">
            <div class="setting-info">
              <h3>Инициализация данных</h3>
              <p>Создать начальные категории, бренды и модели товаров</p>
            </div>
            <button class="init-btn" @click="initializeData" :disabled="isInitializing">
              {{ isInitializing ? 'Инициализация...' : 'Инициализировать' }}
            </button>
          </div>
          <p v-if="initMessage" :class="['init-message', initError ? 'error' : 'success']">
            {{ initMessage }}
          </p>
        </div>
      </section>

      <section v-if="activeTab === 'orders'" class="admin-block">
        <div v-if="orders.length === 0" class="empty-state">
          <p>Заказов пока нет</p>
        </div>
        <div v-else class="orders-list">
          <article v-for="order in orders" :key="order.id" class="order-card">
            <div class="order-image">
              <img
                v-if="order.product?.images?.length"
                :src="order.product.images[0]"
                :alt="order.product?.name"
              />
              <div v-else class="no-image">Нет фото</div>
            </div>

            <div class="order-content">
              <div class="order-header">
                <span class="order-id">Заказ №{{ order.id }}</span>
                <span :class="['status-badge', `status-${order.status}`]">
                  {{ statusLabel(order.status) }}
                </span>
              </div>

              <div class="product-info">
                <h3>{{ order.product?.name || 'Товар удалён' }}</h3>
                <p class="product-brand">{{ order.product?.brand || '—' }}</p>
              </div>

              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">Покупатель:</span>
                  <span class="detail-value"
                    >{{ order.userId?.firstName }} {{ order.userId?.lastName }}</span
                  >
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ order.userId?.email || '—' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Дата получения:</span>
                  <span class="detail-value">{{ formatDate(order.pickupAt) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Телефон:</span>
                  <span class="detail-value">{{ order.contactPhone || 'Не указан' }}</span>
                </div>
              </div>

              <div class="order-footer">
                <span class="order-price">{{ order.product?.price ?? '—' }} ₽</span>
                <div class="status-select-wrapper">
                  <select
                    :value="order.status"
                    @change="changeOrderStatus(order, $event.target.value)"
                    class="status-select"
                  >
                    <option value="pending">Ожидает</option>
                    <option value="confirmed">Подтверждён</option>
                    <option value="ready">Готов к выдаче</option>
                    <option value="completed">Завершён</option>
                    <option value="cancelled">Отменён</option>
                  </select>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import authAPI from '@/api/auth.js'
import ordersAPI from '@/api/orders.js'

export default {
  name: 'AdminPanelView',
  data() {
    return {
      stats: null,
      users: [],
      orders: [],
      currentUserId: authAPI.getCurrentUser()?._id,
      activeTab: 'orders',
      tabs: [
        { value: 'orders', label: 'Заказы' },
        { value: 'users', label: 'Пользователи' },
        { value: 'settings', label: 'Настройки' },
      ],
      isInitializing: false,
      initMessage: '',
      initError: false,
    }
  },
  async mounted() {
    await this.loadAll()
  },
  methods: {
    async loadAll() {
      await Promise.all([this.loadStats(), this.loadUsers(), this.loadOrders()])
    },
    async loadStats() {
      const data = await authAPI.getAdminStats()
      this.stats = data
    },
    async loadUsers() {
      const data = await authAPI.getAdminUsers()
      this.users = data.users || []
    },
    async loadOrders() {
      const data = await ordersAPI.getAllOrdersAdmin()
      this.orders = data.orders || []
    },
    async toggleRole(user) {
      const targetRole = user.role === 'admin' ? 'user' : 'admin'
      await authAPI.updateUserRole(user._id, targetRole)
      await this.loadUsers()
      await this.loadStats()
    },
    async removeUser(user) {
      if (!confirm(`Удалить пользователя ${user.email}?`)) return
      await authAPI.deleteUserByAdmin(user._id)
      await this.loadUsers()
      await this.loadStats()
    },
    async changeOrderStatus(order, status) {
      await ordersAPI.updateOrderStatusAdmin(order.id, status)
      await this.loadOrders()
      await this.loadStats()
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ru-RU', {
        weekday: 'short',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    statusLabel(status) {
      const map = {
        pending: 'Ожидает',
        confirmed: 'Подтверждён',
        ready: 'Готов',
        completed: 'Получен',
        cancelled: 'Отменён',
      }
      return map[status] || status
    },
    async initializeData() {
      this.isInitializing = true
      this.initMessage = ''
      this.initError = false
      try {
        const response = await fetch('http://localhost:5000/api/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        const data = await response.json()
        if (response.ok) {
          this.initMessage = 'Данные успешно инициализированы!'
          this.initError = false
          await this.loadAll()
        } else {
          this.initMessage = data.error || 'Ошибка инициализации'
          this.initError = true
        }
      } catch (error) {
        this.initMessage = 'Ошибка соединения с сервером'
        this.initError = true
      } finally {
        this.isInitializing = false
      }
    },
  },
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 30px 0;
}

.container {
  width: 85%;
  margin: 0 auto;
}

h1 {
  font-size: 32px;
  color: #263141;
  margin-bottom: 30px;
  font-weight: 700;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.blue {
  background: #e3f2fd;
  color: #1976d2;
}
.stat-icon.purple {
  background: #f3e5f5;
  color: #7b1fa2;
}
.stat-icon.green {
  background: #e8f5e9;
  color: #388e3c;
}
.stat-icon.orange {
  background: #fff3e0;
  color: #f57c00;
}
.stat-icon.red {
  background: #ffebee;
  color: #d32f2f;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-content strong {
  font-size: 28px;
  font-weight: 700;
  color: #263141;
}

.stat-content span {
  font-size: 14px;
  color: #666;
}

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #fff;
  padding: 8px;
  border-radius: 12px;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  background: #f5f7fa;
}

.tab-btn.active {
  background: #ff4d4d;
  color: white;
}

.admin-block {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* Users */
.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 12px;
  transition: all 0.3s;
}

.user-card:hover {
  border-color: #ff4d4d;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: #263141;
  margin: 0 0 4px 0;
}

.user-email {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.user-role {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.user-role.admin {
  background: #f3e5f5;
  color: #7b1fa2;
}

.user-role.user {
  background: #e3f2fd;
  color: #1976d2;
}

.user-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f5f7fa;
  color: #263141;
}

.action-btn:hover:not(:disabled) {
  background: #ff4d4d;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.danger {
  background: #ffebee;
  color: #d32f2f;
}

.action-btn.danger:hover:not(:disabled) {
  background: #d32f2f;
  color: white;
}

/* Orders */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  transition: all 0.3s;
}

.order-card:hover {
  border-color: #ff4d4d;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.order-image {
  width: 180px;
  min-height: 180px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  color: #999;
  font-size: 14px;
}

.order-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-id {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

.status-pending {
  background: #fff8e1;
  color: #f57c00;
}
.status-confirmed {
  background: #e3f2fd;
  color: #1976d2;
}
.status-ready {
  background: #e8f5e9;
  color: #388e3c;
}
.status-completed {
  background: #f5f5f5;
  color: #616161;
}
.status-cancelled {
  background: #ffebee;
  color: #d32f2f;
}

.product-info {
  margin-bottom: 16px;
}

.product-info h3 {
  font-size: 20px;
  color: #263141;
  margin: 0 0 4px 0;
  font-weight: 600;
}

.product-brand {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.order-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.detail-label {
  color: #888;
  min-width: 100px;
}

.detail-value {
  color: #263141;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.order-price {
  font-size: 24px;
  font-weight: 700;
  color: #ff4d4d;
}

.status-select-wrapper {
  position: relative;
}

.status-select {
  padding: 10px 16px;
  border: 2px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: white;
  color: #263141;
  transition: all 0.3s;
}

.status-select:hover {
  border-color: #ff4d4d;
}

.status-select:focus {
  outline: none;
  border-color: #ff4d4d;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 18px;
}

/* Settings */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #eee;
}

.setting-info h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #263141;
}

.setting-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.init-btn {
  padding: 12px 24px;
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.init-btn:hover:not(:disabled) {
  background: #e63939;
  transform: translateY(-2px);
}

.init-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.init-message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 12px;
}

.init-message.success {
  background: #e8f5e9;
  color: #388e3c;
}

.init-message.error {
  background: #ffebee;
  color: #d32f2f;
}

@media (max-width: 768px) {
  .order-card {
    flex-direction: column;
  }

  .order-image {
    width: 100%;
    height: 160px;
  }

  .user-card {
    flex-wrap: wrap;
  }

  .user-actions {
    width: 100%;
    margin-top: 12px;
  }

  .action-btn {
    flex: 1;
    text-align: center;
  }
}
</style>
