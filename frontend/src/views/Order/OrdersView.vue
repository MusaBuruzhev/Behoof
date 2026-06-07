<template>
  <div class="orders-view">
    <header class="page-header">
      <h1 class="page-title">Мои заказы</h1>
      <p class="page-subtitle">История ваших покупок</p>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка заказов...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      <h3 class="empty-title">Нет заказов</h3>
      <p class="empty-text">Вы ещё не сделали ни одного заказа</p>
      <router-link to="/catalog" class="btn btn-primary">Перейти в каталог</router-link>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order._id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">Заказ #{{ order.id }}</span>
            <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          </div>
          <span class="status-badge" :class="`status-${order.status}`">
            {{ getStatusTitle(order.status) }}
          </span>
        </div>

        <div class="order-body">
          <div v-if="order.product" class="product-info">
            <img v-if="order.product.image" :src="order.product.image" :alt="order.product.name" class="product-image" />
            <div class="product-details">
              <h4 class="product-name">{{ order.product.name }}</h4>
              <p class="product-brand">{{ order.product.brand }}</p>
              <p class="product-price">{{ formatPrice(order.product.price) }} ₽</p>
            </div>
          </div>

          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Сумма:</span>
              <span class="detail-value">{{ formatPrice(order.totalAmount) }} ₽</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Дата получения:</span>
              <span class="detail-value">{{ formatDate(order.pickupAt) }}</span>
            </div>
            <div v-if="order.comment" class="detail-row">
              <span class="detail-label">Комментарий:</span>
              <span class="detail-value">{{ order.comment }}</span>
            </div>
          </div>
        </div>

        <div class="order-actions">
          <router-link :to="`/orders/${order._id}`" class="btn btn-secondary btn-sm">
            Подробнее
          </router-link>
          <button
            v-if="order.status === 'pending'"
            class="btn btn-danger btn-sm"
            @click="cancelOrder(order._id)"
          >
            Отменить
          </button>
          <button
            v-if="['completed', 'cancelled'].includes(order.status)"
            class="btn btn-danger btn-sm"
            @click="deleteOrder(order._id)"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyOrders, cancelMyOrder, deleteMyOrder } from '@/api'

const orders = ref<any[]>([])
const isLoading = ref(true)

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null || Number.isNaN(price)) return '0'
  return price.toLocaleString('ru-RU')
}

const getStatusTitle = (status: string) => {
  const titles: Record<string, string> = {
    pending: 'В ожидании',
    confirmed: 'Подтверждён',
    ready: 'Готов к выдаче',
    completed: 'Завершён',
    cancelled: 'Отменён',
  }
  return titles[status] || status
}

const loadOrders = async () => {
  isLoading.value = true
  try {
    const response = await getMyOrders()
    orders.value = response.data.orders || []
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    isLoading.value = false
  }
}

const cancelOrder = async (orderId: string) => {
  if (confirm('Вы уверены, что хотите отменить заказ?')) {
    try {
      await cancelMyOrder(orderId)
      await loadOrders()
    } catch (error) {
      console.error('Failed to cancel order:', error)
      alert('Ошибка отмены заказа')
    }
  }
}

const deleteOrder = async (orderId: string) => {
  if (confirm('Вы уверены, что хотите удалить заказ?')) {
    try {
      await deleteMyOrder(orderId)
      await loadOrders()
    } catch (error) {
      console.error('Failed to delete order:', error)
      alert('Ошибка удаления заказа')
    }
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.page-header {
  margin-bottom: var(--spacing-4);
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

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.order-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.order-card:hover {
  box-shadow: var(--shadow-lg);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.order-id {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.order-date {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-confirmed {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

.status-ready {
  background: #F3E8FF;
  color: #8B5CF6;
}

.status-completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.order-body {
  padding: var(--spacing-6);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-6);
}

.product-info {
  display: flex;
  gap: var(--spacing-4);
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.product-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.product-brand {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0;
}

.product-price {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  margin: 0;
}

.order-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.detail-value {
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.order-actions {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-4) var(--spacing-6);
  border-top: 1px solid var(--color-border);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-small);
}

.btn {
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface);
}

.btn-danger {
  background: #FEE2E2;
  color: var(--color-error);
}

.btn-danger:hover {
  background: #FCA5A5;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .order-body {
    grid-template-columns: 1fr;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .order-actions {
    flex-direction: column;
  }

  .order-actions .btn {
    width: 100%;
  }
}
</style>
