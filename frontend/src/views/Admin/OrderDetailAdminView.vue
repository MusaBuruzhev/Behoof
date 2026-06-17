<template>
  <div class="order-detail-admin">
    <router-link to="/admin/orders" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Назад к заказам
    </router-link>

    <header class="page-header">
      <div>
        <h1 class="page-title">Заказ #{{ orderId }}</h1>
        <p class="page-subtitle">{{ order ? formatDate(order.createdAt) : '' }}</p>
      </div>
      <div v-if="order" :class="['status-badge-large', order.status]">
        <span class="status-dot"></span>
        {{ getStatusTitle(order.status) }}
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка...</p>
    </div>

    <div v-else-if="!order" class="not-found">
      <h2>Заказ не найден</h2>
      <router-link to="/admin/orders" class="btn btn-primary">Назад</router-link>
    </div>

    <div v-else class="order-content">
      <div class="info-grid">
        <div class="info-card">
          <h3 class="card-title">Клиент</h3>
          <div class="info-row">
            <span class="label">Имя:</span>
            <span class="value">{{ order.contactName }}</span>
          </div>
          <div class="info-row">
            <span class="label">Телефон:</span>
            <span class="value">{{ formatPhone(order.contactPhone) }}</span>
          </div>
          <div class="info-row" v-if="order.userId?.email">
            <span class="label">Email:</span>
            <span class="value">{{ order.userId.email }}</span>
          </div>
        </div>

        <div class="info-card">
          <h3 class="card-title">Способ получения</h3>
          <div class="info-row">
            <span class="label">Тип:</span>
            <span class="value">{{ order.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз' }}</span>
          </div>
          <div v-if="order.deliveryAddress" class="info-row">
            <span class="label">Адрес:</span>
            <span class="value">{{ order.deliveryAddress }}</span>
          </div>
          <div v-if="order.pickupDate" class="info-row">
            <span class="label">Дата:</span>
            <span class="value">{{ formatDateTime(order.pickupDate) }}</span>
          </div>
        </div>
      </div>

      <div class="products-section">
        <h3 class="section-title">Товары</h3>
        <div class="products-list">
          <div v-for="(item, idx) in order.items" :key="idx" class="product-card">
            <img v-if="item.image" :src="getImageUrl(item.image)" :alt="item.name" />
            <div v-else class="image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ item.name }}</h4>
              <p class="product-meta">{{ formatPrice(item.price) }} ₽ × {{ item.quantity }}</p>
            </div>
            <span class="product-total">{{ formatPrice(item.price * item.quantity) }} ₽</span>
          </div>
        </div>
      </div>

      <div class="availability-section">
        <h3 class="section-title">Наличие товара</h3>
        <div class="availability-buttons">
          <button 
            class="btn-availability in-stock"
            @click="updateStatus('confirmed', 'Ваш заказ подтверждён! Товар есть в наличии. Выберите способ получения.')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>Есть в наличии</span>
          </button>

          <button 
            class="btn-availability preorder"
            @click="showPreorderModal = true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Предзаказ</span>
          </button>

          <button 
            class="btn-availability unavailable"
            @click="showUnavailableModal = true"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>Нет в наличии</span>
          </button>
        </div>
      </div>

      <div class="status-section">
        <h3 class="section-title">Изменить статус</h3>
        <div class="status-buttons">
          <button 
            v-for="status in availableStatuses" 
            :key="status"
            :class="['btn-status', { active: order.status === status }]"
            @click="updateStatus(status)"
          >
            {{ getStatusTitle(status) }}
          </button>
        </div>
      </div>

      <div v-if="order.status === 'ready_for_pickup'" class="verify-code-section">
        <h3 class="section-title">Подтверждение выдачи заказа</h3>
        <div class="verify-code-card">
          <div class="verify-code-info">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <p>Попросите клиента назвать 5-значный код подтверждения. При верном коде заказ будет автоматически переведён в статус «Получен».</p>
          </div>
          <div class="verify-code-display" v-if="order.verificationCode">
            <span class="code-label">Код клиента:</span>
            <span class="code-value">{{ order.verificationCode }}</span>
          </div>
          <div class="verify-code-input">
            <input
              v-model="adminCodeInput"
              type="text"
              maxlength="5"
              class="code-input-field"
              placeholder="Введите код клиента"
              @keyup.enter="verifyAndComplete"
            />
            <button
              class="btn-verify-complete"
              @click="verifyAndComplete"
              :disabled="!isCodeValid || isVerifying"
            >
              {{ isVerifying ? 'Проверка...' : 'Проверить и завершить' }}
            </button>
          </div>
          <div v-if="verifyError" class="verify-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {{ verifyError }}
          </div>
          <div v-if="verifySuccess" class="verify-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            Заказ успешно получен!
          </div>
        </div>
      </div>
    </div>

    <div v-if="showPreorderModal" class="modal-overlay" @click.self="showPreorderModal = false">
      <div class="modal">
        <h3>Предзаказ</h3>
        <p>Укажите срок ожидания:</p>
        <input v-model="preorderMessage" type="text" class="form-input" placeholder="5–10 дней" />
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showPreorderModal = false">Отмена</button>
          <button class="btn btn-primary" @click="confirmPreorder">Подтвердить</button>
        </div>
      </div>
    </div>

    <div v-if="showUnavailableModal" class="modal-overlay" @click.self="showUnavailableModal = false">
      <div class="modal">
        <h3>Нет в наличии</h3>
        <p>Сообщение клиенту:</p>
        <textarea v-model="cancelMessage" class="form-textarea" rows="3" placeholder="Приносим извинения..."></textarea>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showUnavailableModal = false">Отмена</button>
          <button class="btn btn-danger" @click="confirmCancel">Отменить заказ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminStore } from '@/stores'
import { getAllOrdersAdmin, verifyOrderCodeAdmin } from '@/api'

const route = useRoute()
const adminStore = useAdminStore()

const order = ref<any>(null)
const isLoading = ref(true)
const showPreorderModal = ref(false)
const showUnavailableModal = ref(false)
const preorderMessage = ref('')
const cancelMessage = ref('')
const adminCodeInput = ref('')
const verifyError = ref('')
const verifySuccess = ref(false)
const isVerifying = ref(false)

const orderId = computed(() => route.params.id as string)

const availableStatuses = ['pending', 'processing', 'confirmed', 'preorder', 'ready_for_pickup', 'delivering', 'completed', 'cancelled']

const getStatusTitle = (status: string) => {
  const titles: Record<string, string> = {
    pending: 'В обработке',
    processing: 'Проверка продавцом',
    confirmed: 'Подтверждение',
    preorder: 'Предзаказ',
    ready_for_pickup: 'Готов к выдаче',
    delivering: 'Доставляется',
    completed: 'Получен',
    cancelled: 'Отменён',
  }
  return titles[status] || status
}

const loadOrder = async () => {
  isLoading.value = true
  try {
    const response = await getAllOrdersAdmin()
    const allOrders = response.data.orders || []
    order.value = allOrders.find((o: any) => o.id === orderId.value)
  } catch (error) {
    console.error('Failed to load order:', error)
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (status: string, message?: string) => {
  try {
    await adminStore.updateOrderStatus(orderId.value, status, message)
    await loadOrder()
    showPreorderModal.value = false
    showUnavailableModal.value = false
    preorderMessage.value = ''
    cancelMessage.value = ''
  } catch (err: any) {
    alert('Ошибка: ' + (err.response?.data?.error || 'Не удалось обновить статус'))
  }
}

const confirmPreorder = () => {
  updateStatus('preorder', `Товар отсутствует. Срок ожидания: ${preorderMessage.value || '5–10 дней'}`)
}

const confirmCancel = () => {
  updateStatus('cancelled', cancelMessage.value || 'Товар отсутствует. Приносим извинения.')
}

const formatPrice = (price: number) => price.toLocaleString('ru-RU')

const formatDate = (date: string) => new Date(date).toLocaleDateString('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric'
})

const formatDateTime = (date: string) => new Date(date).toLocaleDateString('ru-RU', {
  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
})

const formatPhone = (phone: string) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
  return phone
}

const getImageUrl = (path: string) => path?.startsWith('/uploads/') ? `http://localhost:5000${path}` : path

const isCodeValid = computed(() => {
  return /^\d{5}$/.test(adminCodeInput.value)
})

const verifyAndComplete = async () => {
  if (!isCodeValid.value) return
  if (!order.value.verificationCode) {
    verifyError.value = 'У заказа отсутствует код подтверждения'
    return
  }
  
  verifyError.value = ''
  verifySuccess.value = false
  isVerifying.value = true

  try {
    await verifyOrderCodeAdmin(orderId.value, adminCodeInput.value)
    verifySuccess.value = true
    adminCodeInput.value = ''
    await loadOrder()
    setTimeout(() => { verifySuccess.value = false }, 5000)
  } catch (err: any) {
    verifyError.value = err.response?.data?.error || 'Неверный код подтверждения'
  } finally {
    isVerifying.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail-admin {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}

.back-link:hover {
  color: var(--color-primary);
}

.back-link svg {
  width: 18px;
  height: 18px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  margin: 8px 0 0;
}

.status-badge-large {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge-large.pending,
.status-badge-large.processing {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
}

.status-badge-large.confirmed {
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-primary);
}

.status-badge-large.preorder {
  background: rgba(139, 92, 246, 0.15);
  color: #8B5CF6;
}

.status-badge-large.ready_for_pickup,
.status-badge-large.completed {
  background: rgba(5, 150, 105, 0.15);
  color: #059669;
}

.status-badge-large.cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.loading-state,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-card {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.info-row:last-child {
  border-bottom: none;
}

.label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.value {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 600;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.products-section {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--color-background);
  border-radius: 12px;
}

.product-card img,
.image-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
}

.image-placeholder {
  background: var(--color-surface-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder svg {
  width: 32px;
  height: 32px;
  color: var(--color-text-tertiary);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.product-meta {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 4px 0 0;
}

.product-total {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
}

.availability-section {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.availability-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.btn-availability {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-availability svg {
  width: 32px;
  height: 32px;
}

.btn-availability span {
  font-size: 14px;
  font-weight: 600;
}

.btn-availability.in-stock:hover {
  border-color: #10B981;
  background: rgba(16, 185, 129, 0.05);
}

.btn-availability.in-stock svg {
  color: #10B981;
}

.btn-availability.preorder:hover {
  border-color: #8B5CF6;
  background: rgba(139, 92, 246, 0.05);
}

.btn-availability.preorder svg {
  color: #8B5CF6;
}

.btn-availability.unavailable:hover {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.btn-availability.unavailable svg {
  color: var(--color-error);
}

.status-section {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.status-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.btn-status {
  padding: 10px 20px;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-status:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-status.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 450px;
}

.modal h3 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
}

.modal p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 16px 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  margin-bottom: 20px;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--color-border);
  color: var(--color-text-secondary);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-danger {
  background: var(--color-error);
  color: white;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .availability-buttons {
    flex-direction: column;
  }
}

.verify-code-section {
  background: var(--color-surface);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.verify-code-card {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.verify-code-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 12px;
}

.verify-code-info svg {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
  flex-shrink: 0;
  margin-top: 2px;
}

.verify-code-info p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

.verify-code-display {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(251, 191, 36, 0.08);
  border: 2px dashed #fbbf24;
  border-radius: 12px;
}

.code-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.code-value {
  font-size: 36px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: #fbbf24;
  letter-spacing: 8px;
}

.verify-code-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input-field {
  flex: 1;
  max-width: 200px;
  padding: 14px 20px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  font-size: 24px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
  letter-spacing: 8px;
  color: var(--color-text-primary);
  background: var(--color-background);
  transition: all 0.2s;
}

.code-input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.code-input-field::placeholder {
  font-size: 14px;
  letter-spacing: 0;
  font-family: inherit;
  color: var(--color-text-tertiary);
}

.btn-verify-complete {
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  background: var(--color-primary);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-verify-complete:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-verify-complete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.verify-error {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
  font-size: 14px;
  color: var(--color-error);
}

.verify-error svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.verify-success {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(5, 150, 105, 0.08);
  border: 1px solid rgba(5, 150, 105, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
}

.verify-success svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
