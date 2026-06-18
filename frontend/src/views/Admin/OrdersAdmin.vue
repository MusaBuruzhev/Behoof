<template>
  <div class="orders-admin">
    <header class="page-header">
      <div>
        <h1 class="page-title">Заказы</h1>
        <p class="page-subtitle">{{ stats.total }} заказов</p>
      </div>
    </header>

    <div class="filter-bar">
      <button
        :class="['filter-chip', { active: filter === 'active' }]"
        @click="filter = 'active'; loadOrders()"
      >
        Активные
      </button>
      <button
        :class="['filter-chip', { active: filter === 'pending' }]"
        @click="filter = 'pending'; loadOrders()"
      >
        Новые
      </button>
      <button
        :class="['filter-chip', { active: filter === 'history' }]"
        @click="filter = 'history'; loadOrders()"
      >
        История
      </button>
    </div>

    <div v-if="loading" class="loading-state">Загрузка...</div>

    <div v-else-if="orders.length === 0" class="empty-state">
     
      <h3>Нет заказов</h3>
    </div>

    <div v-else class="orders-list">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-image">
          <img v-if="order.items?.[0]?.image" :src="getImageUrl(order.items[0].image)" :alt="order.items[0].name" />
          <div v-else class="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        </div>

        <div class="order-content">
          <div class="order-header">
            <div>
              <span class="order-id">#{{ order.id.slice(-6).toUpperCase() }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <span :class="['status-badge', order.status]">{{ getStatusTitle(order.status) }}</span>
          </div>

          <h3 class="product-name">{{ order.items[0]?.name || 'Товар' }}</h3>

          <div class="customer-info">
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{{ order.contactName || order.userId?.firstName || 'Клиент' }}</span>
            </div>
            <div class="info-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{{ formatPhone(order.contactPhone) }}</span>
            </div>
          </div>

          <div class="order-total">
            <span class="total-label">Сумма:</span>
            <span class="total-value">{{ formatPrice(order.totalAmount) }} ₽</span>
          </div>
        </div>

        <div class="order-footer">
          <router-link :to="`/admin/orders/${order.id}`" class="btn btn-primary">
            Открыть заказ
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAdminStore } from "@/stores";

const adminStore = useAdminStore();

const loading = ref(false);
const filter = ref('active');
const orders = ref<any[]>([]);
const stats = ref({ total: 0, active: 0, history: 0 });

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
  };
  return titles[status] || status;
};

const formatPrice = (price: number) => {
  if (!price) return '0';
  return price.toLocaleString('ru-RU');
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatPhone = (phone: string) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
  }
  return phone;
};

const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('/uploads/')) {
    return `http://localhost:5000${path}`;
  }
  return path;
};

const loadOrders = async () => {
  loading.value = true;
  try {
    await adminStore.fetchOrders(1, filter.value);
    orders.value = adminStore.orders.items;
    stats.value = {
      total: adminStore.orders.total,
      active: adminStore.orders.active,
      history: adminStore.orders.history,
    };
  } catch (err) {
    console.error('Failed to load orders:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.orders-admin {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.page-subtitle {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--color-text-secondary);
}

.filter-bar {
  display: flex;
  gap: 8px;
}

.filter-chip {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: var(--color-surface);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  background: var(--color-surface-secondary);
}

.filter-chip.active {
  background: var(--color-primary);
  color: white;
}

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.order-card {
  background: var(--color-surface);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.3s;
}

.order-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-4px);
}

.order-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: var(--color-background);
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.image-placeholder svg {
  width: 64px;
  height: 64px;
}

.order-content {
  padding: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-id {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.order-date {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.pending,
.status-badge.processing {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
}

.status-badge.confirmed {
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-primary);
}

.status-badge.preorder {
  background: rgba(139, 92, 246, 0.15);
  color: #8B5CF6;
}

.status-badge.ready_for_pickup,
.status-badge.completed {
  background: rgba(5, 150, 105, 0.15);
  color: #059669;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.15);
  color: var(--color-error);
}

.product-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-row svg {
  width: 16px;
  height: 16px;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.total-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.total-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-primary);
}

.order-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
  background: var(--color-background);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  width: 100%;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--color-primary-hover, #2563eb);
  transform: translateY(-1px);
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-text-tertiary);
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

@media (max-width: 768px) {
  .orders-list {
    grid-template-columns: 1fr;
  }
}
</style>
