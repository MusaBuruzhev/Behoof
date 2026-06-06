<template>
  <div class="orders-view">
    <header class="page-header">
      <h1 class="page-title">Заказы</h1>
      <p class="page-subtitle">История ваших покупок</p>
    </header>
    
    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab.id"
        :class="['filter-tab', { active: currentFilter === tab.id }]"
        @click="currentFilter = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.count" :class="['tab-count', { 'tab-count-new': tab.id === 'active' }]">
          {{ tab.count }}
        </span>
      </button>
    </div>
    
    <!-- Orders List -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка заказов...</p>
    </div>
    
    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414" />
      </svg>
      <h3 class="empty-title">Нет заказов</h3>
      <p class="empty-text">
        {{ currentFilter === 'active' ? 'У вас пока нет активных заказов' : 'История заказов пуста' }}
      </p>
      <router-link to="/catalog" class="btn btn-primary">
        Перейти в каталог
      </router-link>
    </div>
    
    <div v-else class="orders-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
        @click="viewOrderDetails(order)"
      >
        <div class="order-header">
          <div class="order-id-block">
            <span class="order-id">#{{ order.id.slice(-6).toUpperCase() }}</span>
            <span :class="['order-status', order.status]">
              {{ getStatusLabel(order.status) }}
            </span>
          </div>
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
        </div>
        
        <div class="order-body">
          <div v-if="order.product" class="order-product">
            <div class="product-image">
              <img
                v-if="order.product.images?.[0]"
                :src="getProductImage(order.product.images[0])"
                :alt="order.product.name"
              />
              <div v-else class="product-image-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ order.product.name }}</h4>
              <p class="product-brand">{{ order.product.brand }}</p>
            </div>
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Дата получения:</span>
              <span class="detail-value">{{ formatDateTime(order.pickupAt) }}</span>
            </div>
            <div v-if="order.contactPhone" class="detail-row">
              <span class="detail-label">Телефон:</span>
              <span class="detail-value">{{ order.contactPhone }}</span>
            </div>
          </div>
          
          <div class="order-price">
            <span class="price-label">Сумма:</span>
            <span class="price-value">{{ formatPrice(order.product?.price || 0) }} ₽</span>
          </div>
        </div>
        
        <!-- Timeline -->
        <div class="order-timeline">
          <div
            v-for="(stage, index) in timelineStages"
            :key="stage.id"
            :class="['timeline-stage', { 
              completed: isStageCompleted(order.status, index),
              current: isStageCurrent(order.status, index)
            }]"
          >
            <div class="timeline-marker">
              <div class="marker-dot"></div>
              <div v-if="index < timelineStages.length - 1" class="marker-line"></div>
            </div>
            <span class="timeline-label">{{ stage.label }}</span>
          </div>
        </div>
        
        <div class="order-footer">
          <button
            v-if="order.status === 'pending'"
            class="btn btn-secondary btn-sm"
            @click.stop="cancelOrder(order.id)"
          >
            Отменить заказ
          </button>
          <router-link
            :to="`/profile/orders/${order.id}`"
            class="btn btn-primary btn-sm"
            @click.stop
          >
            Подробнее
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyOrders, cancelMyOrder } from '@/api'
import type { Order, OrderStatus, Product } from '@/types'

const router = useRouter()

interface OrderWithProduct extends Order {
  product?: Product
}

const orders = ref<OrderWithProduct[]>([])
const isLoading = ref(true)
const currentFilter = ref<'active' | 'history'>('active')

const filterTabs = computed(() => [
  { id: 'active' as const, label: 'Активные', count: activeOrdersCount.value },
  { id: 'history' as const, label: 'История', count: historyOrdersCount.value },
])

const activeOrdersCount = computed(() => {
  return orders.value.filter(o => ['pending', 'confirmed', 'ready'].includes(o.status)).length
})

const historyOrdersCount = computed(() => {
  return orders.value.filter(o => ['completed', 'cancelled'].includes(o.status)).length
})

const filteredOrders = computed(() => {
  if (currentFilter.value === 'active') {
    return orders.value.filter(o => ['pending', 'confirmed', 'ready'].includes(o.status))
  }
  return orders.value.filter(o => ['completed', 'cancelled'].includes(o.status))
})

const timelineStages = [
  { id: 'pending', label: 'Ожидает' },
  { id: 'confirmed', label: 'Подтверждён' },
  { id: 'ready', label: 'Готов' },
  { id: 'completed', label: 'Получен' },
]

const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждён',
    ready: 'Готов к выдаче',
    completed: 'Получен',
    cancelled: 'Отменён',
  }
  return labels[status]
}

const isStageCompleted = (status: OrderStatus, stageIndex: number): boolean => {
  const stageOrder = ['pending', 'confirmed', 'ready', 'completed']
  const statusIndex = stageOrder.indexOf(status)
  return statusIndex > stageIndex
}

const isStageCurrent = (status: OrderStatus, stageIndex: number): boolean => {
  const stageOrder = ['pending', 'confirmed', 'ready', 'completed']
  const statusIndex = stageOrder.indexOf(status)
  return statusIndex === stageIndex && status !== 'cancelled'
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
  if (!confirm('Вы уверены, что хотите отменить заказ?')) return
  
  try {
    await cancelMyOrder(orderId)
    await loadOrders()
  } catch (error) {
    console.error('Failed to cancel order:', error)
  }
}

const viewOrderDetails = (order: OrderWithProduct) => {
  router.push(`/profile/orders/${order.id}`)
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getProductImage = (imagePath: string): string => {
  return `http://localhost:5000${imagePath}`
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
  margin-bottom: var(--spacing-2);
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

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-tab:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.filter-tab.active {
  background: var(--color-surface);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  background: var(--color-border);
  color: var(--color-text-secondary);
  border-radius: var(--radius-full);
}

.tab-count-new {
  background: var(--color-primary);
  color: var(--color-text-inverse);
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

/* Order Card */
.order-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.order-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6) var(--spacing-8);
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-background);
}

.order-id-block {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.order-id {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.order-status {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
  text-transform: capitalize;
}

.order-status.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
}

.order-status.confirmed {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.order-status.ready {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.order-status.completed {
  background: rgba(6, 182, 212, 0.1);
  color: #06B6D4;
}

.order-status.cancelled {
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-error);
}

.order-date {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

/* Order Body */
.order-body {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-8);
  padding: var(--spacing-8);
}

.order-product {
  display: flex;
  gap: var(--spacing-4);
}

.product-image {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.product-image-placeholder svg {
  width: 32px;
  height: 32px;
}

.product-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
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

.order-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-2);
}

.detail-row {
  display: flex;
  gap: var(--spacing-2);
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

.order-price {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: var(--spacing-1);
}

.price-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.price-value {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* Timeline */
.order-timeline {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-8) var(--spacing-10);
  background: var(--color-background);
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
}

.timeline-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  position: relative;
  flex: 1;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  border: 2px solid var(--color-surface);
  transition: all var(--transition-fast);
}

.marker-line {
  width: 2px;
  height: 32px;
  background: var(--color-border);
  margin-top: var(--spacing-1);
  transition: all var(--transition-fast);
}

.timeline-stage:last-child .marker-line {
  display: none;
}

.timeline-stage.completed .marker-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.timeline-stage.completed .marker-line {
  background: var(--color-primary);
}

.timeline-stage.current .marker-dot {
  background: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}

.timeline-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.timeline-stage.completed .timeline-label,
.timeline-stage.current .timeline-label {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

/* Order Footer */
.order-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  padding: var(--spacing-6) var(--spacing-8);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-small);
}

/* Responsive */
@media (max-width: 768px) {
  .order-body {
    grid-template-columns: 1fr;
  }
  
  .order-price {
    align-items: flex-start;
  }
  
  .order-timeline {
    overflow-x: auto;
    padding: var(--spacing-4);
  }
  
  .timeline-stage {
    min-width: 80px;
  }
}
</style>
