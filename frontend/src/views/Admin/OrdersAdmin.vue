<template>
  <div class="orders-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Заказы</h1>
        <p class="page-subtitle">{{ totalOrders }} заказов</p>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="filter-bar">
      <button :class="['filter-chip', { active: filterStatus === '' }]" @click="filterStatus = ''; page = 1; loadOrders()">Все</button>
      <button :class="['filter-chip', { active: filterStatus === 'pending' }]" @click="filterStatus = 'pending'; page = 1; loadOrders()">Ожидают</button>
      <button :class="['filter-chip', { active: filterStatus === 'confirmed' }]" @click="filterStatus = 'confirmed'; page = 1; loadOrders()">Подтверждены</button>
      <button :class="['filter-chip', { active: filterStatus === 'ready' }]" @click="filterStatus = 'ready'; page = 1; loadOrders()">Готовы</button>
      <button :class="['filter-chip', { active: filterStatus === 'completed' }]" @click="filterStatus = 'completed'; page = 1; loadOrders()">Завершены</button>
      <button :class="['filter-chip', { active: filterStatus === 'cancelled' }]" @click="filterStatus = 'cancelled'; page = 1; loadOrders()">Отменены</button>
    </div>

    <div v-if="loading" class="loading-state">Загрузка...</div>

    <div v-else-if="orders.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
      </div>
      <h3>Нет заказов</h3>
    </div>

    <div v-else class="table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Заказ</th>
            <th>Покупатель</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id || order._id">
            <td>
              <span class="order-id">#{{ (order.id || order._id)?.slice(-8) }}</span>
            </td>
            <td class="muted">{{ order.userName || order.userEmail || '—' }}</td>
            <td class="price-cell">{{ formatPrice(order.totalAmount) }} ₽</td>
            <td>
              <select
                :value="order.status"
                :class="['status-select', order.status]"
                @change="changeStatus(order, ($event.target as HTMLSelectElement).value)"
              >
                <option value="pending">Ожидает</option>
                <option value="confirmed">Подтверждён</option>
                <option value="ready">Готов</option>
                <option value="completed">Завершён</option>
                <option value="cancelled">Отменён</option>
              </select>
            </td>
            <td class="muted">{{ formatDate(order.createdAt) }}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon" title="Просмотр" @click="viewOrder(order)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-icon btn-icon-danger" title="Удалить" @click="deleteOrderHandler(order)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)" class="btn-page">←</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)" class="btn-page">→</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores'

const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(false)
const filterStatus = ref('')
const page = ref(1)
const orders = ref<any[]>([])
const totalOrders = ref(0)
const limit = 20

const totalPages = computed(() => Math.ceil(totalOrders.value / limit) || 1)

const formatPrice = (price: number) => {
  if (!price) return '0'
  return price.toLocaleString('ru-RU')
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const loadOrders = async () => {
  loading.value = true
  try {
    const params: any = { page: page.value, limit }
    if (filterStatus.value) params.status = filterStatus.value
    await adminStore.fetchOrders(page.value)
    orders.value = adminStore.orders.items
    totalOrders.value = adminStore.orders.total
  } catch (err) {
    console.error('Failed to load orders:', err)
  } finally {
    loading.value = false
  }
}

const changePage = (p: number) => {
  page.value = p
  loadOrders()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const changeStatus = async (order: any, status: string) => {
  try {
    await adminStore.updateOrderStatus(order.id || order._id, status)
    order.status = status
  } catch (err) {
    console.error('Error updating status:', err)
  }
}

const deleteOrderHandler = async (order: any) => {
  if (!confirm('Удалить заказ?')) return
  try {
    await adminStore.deleteOrder(order.id || order._id)
    await loadOrders()
  } catch (err) {
    console.error('Error deleting order:', err)
  }
}

const viewOrder = (order: any) => {
  router.push(`/admin/orders/${order._id || order.id}`)
}

onMounted(() => { loadOrders() })
</script>

<style scoped>
.orders-admin { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

/* Filter */
.filter-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  padding: 6px 14px; border: 1px solid var(--color-border); border-radius: 8px;
  background: var(--color-surface); font-size: 13px; color: var(--color-text-secondary);
  cursor: pointer; transition: all 0.15s;
}
.filter-chip:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.filter-chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

/* Table */
.table-wrapper { overflow-x: auto; }
.orders-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.orders-table th { text-align: left; padding: 10px 12px; color: var(--color-text-tertiary); font-weight: 500; font-size: 12px; border-bottom: 1px solid var(--color-border); }
.orders-table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border-light, #F3F4F6); }
.orders-table tr:hover { background: var(--color-surface-secondary, #F9FAFB); }
.order-id { font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 12px; }
.muted { color: var(--color-text-tertiary); }
.price-cell { font-weight: 500; white-space: nowrap; }

.status-select {
  padding: 5px 10px; border-radius: 6px; border: 1px solid var(--color-border);
  font-size: 12px; font-weight: 500; cursor: pointer; outline: none; background: var(--color-surface);
  color: var(--color-text-primary);
}
.status-select.pending { border-color: #F59E0B; background: #FFFBEB; color: #92400E; }
.status-select.confirmed { border-color: #3B82F6; background: #EFF6FF; color: #1E40AF; }
.status-select.ready { border-color: #10B981; background: #ECFDF5; color: #065F46; }
.status-select.completed { border-color: #6366F1; background: #EEF2FF; color: #3730A3; }
.status-select.cancelled { border-color: #EF4444; background: #FEF2F2; color: #991B1B; }

.row-actions { display: flex; gap: 2px; }
.btn-icon {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--color-text-tertiary);
}
.btn-icon:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon-danger:hover { background: var(--color-error-light, #FEE2E2); color: var(--color-error); }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-surface-secondary, #F9FAFB); margin-bottom: 16px; }
.empty-icon svg { width: 24px; height: 24px; color: var(--color-text-tertiary); }
.empty-state h3 { margin: 0; font-size: 16px; font-weight: 600; }
.loading-state { padding: 40px; text-align: center; color: var(--color-text-tertiary); }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-page { padding: 8px 14px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: var(--color-text-tertiary); }
</style>
