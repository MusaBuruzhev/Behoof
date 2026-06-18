<template>
  <div class="orders-view">
    <header class="page-header">
      <h1 class="page-title">Заказы</h1>
      <p class="page-subtitle">История ваших покупок</p>
    </header>

    <div class="filter-tabs">
      <button
        :class="['filter-tab', { active: currentFilter === 'active' }]"
        @click="currentFilter = 'active'"
      >
        Активные
      </button>
      <button
        :class="['filter-tab', { active: currentFilter === 'history' }]"
        @click="currentFilter = 'history'"
      >
        История
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка заказов...</p>
    </div>

    <div v-else-if="filteredOrders.length === 0" class="empty-state">
      <svg
        class="empty-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414"
        />
      </svg>
      <h3 class="empty-title">Нет заказов</h3>
      <p class="empty-text">
        {{
          currentFilter === "active"
            ? "У вас пока нет активных заказов"
            : "История заказов пуста"
        }}
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
        <div class="order-image">
          <img
            v-if="order.items?.[0]?.image"
            :src="getProductImage(order.items[0].image)"
            :alt="order.items[0].name"
          />
          <div v-else class="image-placeholder">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        </div>

        <div class="order-content">
          <div class="order-header">
            <span class="order-id"
              >#{{ order.id.slice(-6).toUpperCase() }}</span
            >
            <span :class="['status-badge', order.status]">{{
              getStatusTitle(order.status)
            }}</span>
          </div>

          <h3 class="product-name">{{ order.items[0]?.name || "Товар" }}</h3>
          <p class="product-brand">{{ "Бренд не указан" }}</p>

          <div class="order-price">
            {{ formatPrice(order.items[0]?.price || 0) }} ₽
          </div>

          <div class="order-meta">
            <div class="meta-row">
              <span class="meta-label">Дата заказа:</span>
              <span class="meta-value">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Статус:</span>
              <span class="meta-value">{{ getStatusTitle(order.status) }}</span>
            </div>
          </div>
        </div>

        <router-link :to="`/profile/orders/${order.id}`" class="order-footer">
          Подробнее о заказе
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getMyOrders } from "@/api";
import type { Order, OrderStatus } from "@/types";

const router = useRouter();

const orders = ref<Order[]>([]);
const isLoading = ref(true);
const currentFilter = ref<"active" | "history">("active");

const getStatusTitle = (status: OrderStatus): string => {
  const titles: Record<OrderStatus, string> = {
    pending: "В обработке",
    processing: "Проверка продавцом",
    confirmed: "Подтверждение",
    preorder: "Предзаказ",
    ready_for_pickup: "Готов к выдаче",
    delivering: "Доставляется",
    completed: "Получен",
    cancelled: "Отменён",
  };
  return titles[status] || status;
};

const filteredOrders = computed(() => {
  if (currentFilter.value === "active") {
    return orders.value.filter(
      (o) => !o.isDeleted && !["completed", "cancelled"].includes(o.status)
    );
  }
  return orders.value.filter(
    (o) => o.isDeleted || ["completed", "cancelled"].includes(o.status)
  );
});

const loadOrders = async () => {
  isLoading.value = true;
  try {
    const response = await getMyOrders();
    orders.value = response.data.orders || [];
  } catch (error) {
    console.error("Failed to load orders:", error);
  } finally {
    isLoading.value = false;
  }
};

const viewOrderDetails = (order: Order) => {
  router.push(`/profile/orders/${order.id}`);
};

const formatPrice = (price: number): string => {
  return price.toLocaleString("ru-RU");
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getProductImage = (imagePath: string): string => {
  if (imagePath.startsWith("/uploads/")) {
    return `http://localhost:5000${imagePath}`;
  }
  return imagePath;
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.orders-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding: var(--spacing-8) var(--spacing-6);
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

.filter-tabs {
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  background: var(--color-background);
  border-radius: var(--radius-xl);
  width: fit-content;
}

.filter-tab {
  padding: var(--spacing-3) var(--spacing-6);
  background: transparent;
  border: none;
  border-radius: var(--radius-lg);
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
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-semibold);
  box-shadow: var(--shadow-sm);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
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
  to {
    transform: rotate(360deg);
  }
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

.orders-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: var(--spacing-6);
}

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

.order-image {
  width: 100%;
  height: 240px;
  overflow: hidden;
  background: var(--color-background);
}

.order-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--spacing-4);
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
  padding: var(--spacing-6);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
}

.order-id {
  font-family: "JetBrains Mono", monospace;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: capitalize;
}

.status-badge.pending,
.status-badge.processing {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.status-badge.confirmed {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.status-badge.preorder {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-badge.ready_for_pickup {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.status-badge.delivering {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.completed {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.product-name {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-brand {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3) 0;
}

.order-price {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-4);
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.meta-value {
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.order-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.order-footer:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.order-footer svg {
  width: 18px;
  height: 18px;
  transition: transform var(--transition-fast);
}

.order-footer:hover svg {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .order-image {
    height: 160px;
  }

  .orders-list {
    grid-template-columns: 1fr;
  }
}
</style>
