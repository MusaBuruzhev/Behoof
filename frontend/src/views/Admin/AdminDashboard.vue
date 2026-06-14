<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">Сводка</h1>
        <p class="page-subtitle">{{ today }}</p>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #DBEAFE; color: #2563EB;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalProducts }}</span>
          <span class="stat-label">Товаров</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #D1FAE5; color: #059669;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalUsers }}</span>
          <span class="stat-label">Пользователей</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7; color: #D97706;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalOrders }}</span>
          <span class="stat-label">Заказов</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #F3E8FF; color: #7C3AED;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalCategories }}</span>
          <span class="stat-label">Категорий</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: #FEE2E2; color: #DC2626;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalBrands }}</span>
          <span class="stat-label">Брендов</span>
        </div>
      </div>
    </div>

    <!-- Recent Sections -->
    <div class="recent-grid">
      <div class="recent-section">
        <div class="section-header">
          <h3>Последние заказы</h3>
          <router-link to="/admin/orders" class="link">Все заказы →</router-link>
        </div>
        <div v-if="stats.recentOrders?.length" class="recent-list">
          <div v-for="order in stats.recentOrders.slice(0, 5)" :key="order.id" class="recent-item">
            <div class="recent-item-main">
              <span class="order-id">#{{ order.id?.slice(-6) }}</span>
              <span :class="['status', order.status]">{{ orderStatusLabel(order.status) }}</span>
            </div>
            <span class="recent-meta">{{ formatDate(order.createdAt) }}</span>
          </div>
        </div>
        <div v-else class="empty-recent">Нет заказов</div>
      </div>

      <div class="recent-section">
        <div class="section-header">
          <h3>Последние товары</h3>
          <router-link to="/admin/products" class="link">Все товары →</router-link>
        </div>
        <div v-if="stats.recentProducts?.length" class="recent-list">
          <div v-for="product in stats.recentProducts.slice(0, 5)" :key="product.id" class="recent-item">
            <div class="recent-item-main">
              <span class="product-name">{{ product.name }}</span>
            </div>
            <span class="recent-meta">{{ formatPrice(product.priceHistory?.[0]?.price) }} ₽</span>
          </div>
        </div>
        <div v-else class="empty-recent">Нет товаров</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useAdminStore } from '@/stores'

const adminStore = useAdminStore()
const isLoading = ref(true)

const stats = computed(() => adminStore.stats)

const today = computed(() => {
  return new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})

const orderStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: 'Ожидает', confirmed: 'Подтверждён', ready: 'Готов', completed: 'Выполнен', cancelled: 'Отменён' }
  return map[status] || status
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (price: number) => {
  if (!price && price !== 0) return '0'
  return price.toLocaleString('ru-RU')
}

onMounted(async () => {
  try {
    await adminStore.fetchStats()
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 28px; }

.page-header { display: flex; justify-content: space-between; align-items: center; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }

.stat-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 14px; padding: 20px;
  transition: box-shadow 0.15s ease;
}
.stat-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.04); }

.stat-icon {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
}
.stat-icon svg { width: 22px; height: 22px; }

.stat-info { display: flex; flex-direction: column; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--color-text-primary); letter-spacing: -0.02em; line-height: 1; }
.stat-label { font-size: 13px; color: var(--color-text-tertiary); margin-top: 4px; }

/* Recent */
.recent-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; }

.recent-section {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 14px; padding: 20px;
}
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.link { font-size: 12px; color: var(--color-primary); text-decoration: none; font-weight: 500; }
.link:hover { text-decoration: underline; }

.recent-list { display: flex; flex-direction: column; gap: 2px; }
.recent-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; transition: background 0.1s; }
.recent-item:hover { background: var(--color-surface-secondary, #F9FAFB); }
.recent-item-main { display: flex; align-items: center; gap: 10px; }
.order-id { font-size: 13px; font-weight: 500; color: var(--color-text-primary); font-family: 'JetBrains Mono', monospace; }
.product-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.recent-meta { font-size: 12px; color: var(--color-text-tertiary); }

.status { font-size: 11px; padding: 2px 8px; border-radius: 6px; font-weight: 500; }
.status.pending { background: #FEF3C7; color: #92400E; }
.status.confirmed { background: #DBEAFE; color: #1E40AF; }
.status.ready { background: #D1FAE5; color: #065F46; }
.status.completed { background: #E0E7FF; color: #3730A3; }
.status.cancelled { background: #FEE2E2; color: #991B1B; }

.empty-recent { padding: 20px; text-align: center; color: var(--color-text-tertiary); font-size: 13px; }

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .stat-card { padding: 14px; gap: 10px; }
  .stat-icon { width: 36px; height: 36px; }
  .stat-value { font-size: 20px; }
  .recent-grid { grid-template-columns: 1fr; }
}
</style>
