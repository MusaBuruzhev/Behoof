<template>
  <div class="order-detail-view">
    <router-link to="/profile/orders" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Назад к заказам
    </router-link>
    
    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Заказ #{{ orderId }}</h1>
          <p class="page-subtitle">Детали вашего заказа</p>
        </div>
        <div v-if="order" :class="['status-badge-large', order.status]">
          {{ getStatusLabel(order.status) }}
        </div>
      </div>
    </header>
    
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка деталей заказа...</p>
    </div>
    
    <div v-else-if="!order" class="not-found">
      <svg class="not-found-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      <h2>Заказ не найден</h2>
      <p>К сожалению, заказ не существует или был удалён</p>
      <router-link to="/profile/orders" class="btn btn-primary">
        Вернуться к заказам
      </router-link>
    </div>
    
    <div v-else class="order-detail-content">
      <!-- Order Info Cards -->
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Дата создания</span>
            <span class="info-value">{{ formatDate(order.createdAt) }}</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Дата получения</span>
            <span class="info-value">{{ formatDateTime(order.pickupAt) }}</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Телефон</span>
            <span class="info-value">{{ order.contactPhone || 'Не указан' }}</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Комментарий</span>
            <span class="info-value">{{ order.comment || 'Нет комментария' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Product Card -->
      <div class="product-section">
        <h2 class="section-title">Товар</h2>
        
        <div v-if="order.product" class="product-card">
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
            <h3 class="product-name">{{ order.product.name }}</h3>
            <p class="product-brand">{{ order.product.brand }}</p>
            <div class="product-price">{{ formatPrice(order.product.price) }} ₽</div>
          </div>
          
          <router-link
            v-if="order.product"
            :to="`/product/${order.product.id}`"
            class="btn btn-outline"
          >
            Посмотреть товар
          </router-link>
        </div>
      </div>
      
      <!-- Timeline -->
      <div class="timeline-section">
        <h2 class="section-title">Статус заказа</h2>
        
        <div class="timeline">
          <div
            v-for="(stage, index) in timelineStages"
            :key="stage.id"
            :class="['timeline-stage', {
              completed: isStageCompleted(order.status, index),
              current: isStageCurrent(order.status, index)
            }]"
          >
            <div class="timeline-marker">
              <div class="marker-dot">
                <svg v-if="isStageCompleted(order.status, index)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div v-if="index < timelineStages.length - 1" class="marker-line"></div>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">{{ stage.label }}</span>
              <span v-if="isStageCompleted(order.status, index)" class="timeline-date">
                {{ stage.date }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div v-if="order.status === 'pending'" class="actions-section">
        <button class="btn btn-secondary" @click="cancelOrder">
          Отменить заказ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getMyOrders, cancelMyOrder } from '@/api'
import type { Order, OrderStatus, Product } from '@/types'

const route = useRoute()

const order = ref<(Order & { product?: Product }) | null>(null)
const isLoading = ref(true)

const orderId = computed(() => route.params.id as string)

const timelineStages = [
  { id: 'pending', label: 'Ожидает подтверждения', date: '' },
  { id: 'confirmed', label: 'Подтверждён', date: '' },
  { id: 'ready', label: 'Готов к выдаче', date: '' },
  { id: 'completed', label: 'Получен', date: '' },
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

const loadOrder = async () => {
  isLoading.value = true
  try {
    const response = await getMyOrders()
    const foundOrder = response.data.orders?.find((o: Order) => o.id === orderId.value)
    order.value = foundOrder || null
  } catch (error) {
    console.error('Failed to load order:', error)
  } finally {
    isLoading.value = false
  }
}

const cancelOrder = async () => {
  if (!confirm('Вы уверены, что хотите отменить заказ?')) return
  
  try {
    await cancelMyOrder(orderId.value)
    await loadOrder()
  } catch (error) {
    console.error('Failed to cancel order:', error)
  }
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
  loadOrder()
})
</script>

<style scoped>
.order-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-10);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.back-link svg {
  width: 16px;
  height: 16px;
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

.status-badge-large {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-5);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-lg);
  text-transform: capitalize;
}

.status-badge-large.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
}

.status-badge-large.confirmed {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.status-badge-large.ready {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.status-badge-large.completed {
  background: rgba(6, 182, 212, 0.1);
  color: #06B6D4;
}

.status-badge-large.cancelled {
  background: rgba(220, 38, 38, 0.1);
  color: var(--color-error);
}

/* Loading & Not Found */
.loading-state,
.not-found {
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

.not-found-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}

.not-found h2 {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.not-found p {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-6) 0;
}

/* Order Detail Content */
.order-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
}

.info-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.info-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.info-icon svg {
  width: 28px;
  height: 28px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.info-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.info-value {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Product Section */
.product-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.section-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.product-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-8);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.product-image {
  width: 140px;
  height: 140px;
  border-radius: var(--radius-xl);
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
  width: 48px;
  height: 48px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.product-name {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.product-brand {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

.product-price {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

/* Timeline Section */
.timeline-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.timeline {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-10);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.timeline-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-3);
  position: relative;
  flex: 1;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.marker-dot {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  border: 3px solid var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.marker-dot svg {
  width: 18px;
  height: 18px;
  color: white;
}

.marker-line {
  width: 2px;
  height: 48px;
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
  box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.2);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.timeline-label {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  font-weight: var(--font-weight-medium);
  text-align: center;
}

.timeline-stage.completed .timeline-label,
.timeline-stage.current .timeline-label {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}

.timeline-date {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

/* Actions Section */
.actions-section {
  display: flex;
  justify-content: center;
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
}

/* Responsive */
@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .product-card {
    flex-direction: column;
    text-align: center;
  }
  
  .timeline {
    overflow-x: auto;
    padding: var(--spacing-4);
  }
  
  .timeline-stage {
    min-width: 100px;
  }
}
</style>
