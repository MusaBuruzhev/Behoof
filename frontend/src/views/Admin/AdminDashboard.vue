<template>
  <div class="dashboard">
    <!-- Stats Grid -->
    <div class="stats-grid">
      <StatsCard label="Товары" :value="stats.totalProducts" color="primary">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="Пользователи" :value="stats.totalUsers" color="success">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="Заказы" :value="stats.totalOrders" color="warning">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="Бренды" :value="stats.totalBrands" color="primary">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </template>
      </StatsCard>

      <StatsCard label="Категории" :value="stats.totalCategories" color="error">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7v10a8 8 0 0 0 8 8 8 8 0 0 0 8-8V7l-10-5z"></path>
          </svg>
        </template>
      </StatsCard>
    </div>

    <!-- Recent Data Sections -->
    <div class="recent-data">
      <!-- Recent Orders -->
      <section class="data-section">
        <div class="section-header">
          <h2 class="section-title">Последние заказы</h2>
          <router-link to="/admin/orders" class="btn-link">Все заказы →</router-link>
        </div>

        <div v-if="stats.recentOrders.length > 0" class="recent-list">
          <div v-for="order in stats.recentOrders.slice(0, 5)" :key="order.id" class="recent-item">
            <div class="item-info">
              <p class="item-id">Заказ #{{ order.id }}</p>
              <p class="item-detail">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="item-status">
              <span class="status-badge" :class="`status-${order.status}`">
                {{ formatStatus(order.status) }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">Нет заказов</div>
      </section>

      <!-- Recent Products -->
      <section class="data-section">
        <div class="section-header">
          <h2 class="section-title">Последние товары</h2>
          <router-link to="/admin/products" class="btn-link">Все товары →</router-link>
        </div>

        <div v-if="stats.recentProducts.length > 0" class="recent-list">
          <div v-for="product in stats.recentProducts.slice(0, 5)" :key="product.id" class="recent-item">
            <div class="item-info">
              <p class="item-id">{{ product.name }}</p>
              <p class="item-detail">{{ product.brand }} • {{ formatPrice(product.price) }} ₽</p>
            </div>
            <div class="item-action">
              <router-link :to="`/admin/products/${product.id}`" class="btn-small">Редактировать</router-link>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">Нет товаров</div>
      </section>

      <!-- Recent Users -->
      <section class="data-section">
        <div class="section-header">
          <h2 class="section-title">Последние пользователи</h2>
          <router-link to="/admin/users" class="btn-link">Все пользователи →</router-link>
        </div>

        <div v-if="stats.recentUsers.length > 0" class="recent-list">
          <div v-for="user in stats.recentUsers.slice(0, 5)" :key="user._id" class="recent-item">
            <div class="item-info">
              <p class="item-id">{{ user.firstName }} {{ user.lastName }}</p>
              <p class="item-detail">{{ user.email }}</p>
            </div>
            <div class="item-status">
              <span class="role-badge" :class="{ 'role-admin': user.role === 'admin' }">
                {{ user.role === 'admin' ? 'Админ' : 'Пользователь' }}
              </span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">Нет пользователей</div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAdminStore } from '@/stores'
import StatsCard from '@/components/admin/StatsCard.vue'

const adminStore = useAdminStore()

const stats = computed(() => adminStore.stats)

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price: number) => {
  return price.toLocaleString('ru-RU')
}

const formatStatus = (status: string) => {
  const statuses: Record<string, string> = {
    pending: 'В ожидании',
    confirmed: 'Подтвержден',
    ready: 'Готов',
    completed: 'Завершен',
    cancelled: 'Отменен',
  }
  return statuses[status] || status
}

onMounted(async () => {
  await adminStore.fetchStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
}

.recent-data {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-6);
}

.data-section {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  gap: var(--spacing-4);
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.btn-link {
  font-size: 13px;
  color: var(--color-primary);
  text-decoration: none;
  white-space: nowrap;
  transition: color var(--transition-normal);
}

.btn-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--color-background);
  border-radius: var(--radius-md);
  transition: background-color var(--transition-normal);
}

.recent-item:hover {
  background-color: var(--color-background);
}

.item-info {
  flex: 1;
}

.item-id {
  margin: 0 0 var(--spacing-1) 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.item-detail {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.item-status,
.item-action {
  flex-shrink: 0;
  margin-left: var(--spacing-4);
}

.status-badge {
  display: inline-flex;
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--color-background);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  color: var(--color-warning);
  background-color: rgba(245, 158, 11, 0.1);
}

.status-confirmed {
  color: var(--color-info);
  background-color: rgba(59, 130, 246, 0.1);
}

.status-ready {
  color: #8B5CF6;
  background-color: #F3E8FF;
}

.status-completed {
  color: var(--color-success);
  background-color: rgba(16, 185, 129, 0.1);
}

.status-cancelled {
  color: var(--color-error);
  background-color: rgba(239, 68, 68, 0.1);
}

.role-badge {
  display: inline-flex;
  padding: var(--spacing-1) var(--spacing-3);
  background-color: var(--color-background);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.role-badge.role-admin {
  color: var(--color-primary);
  background-color: rgba(37, 99, 235, 0.1);
}

.btn-small {
  padding: var(--spacing-2) var(--spacing-3);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: background-color var(--transition-normal);
}

.btn-small:hover {
  background-color: var(--color-primary-dark);
}

.empty-state {
  padding: var(--spacing-6);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .recent-data {
    grid-template-columns: 1fr;
  }

  .recent-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-status,
  .item-action {
    margin-left: 0;
    margin-top: var(--spacing-2);
    width: 100%;
  }

  .btn-small {
    width: 100%;
  }
}
</style>
