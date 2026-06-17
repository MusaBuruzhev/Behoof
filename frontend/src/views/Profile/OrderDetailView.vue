<template>
  <div class="order-detail-view">
    <router-link to="/profile/orders" class="back-link">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Назад к заказам
    </router-link>

    <header class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Заказ #{{ orderId }}</h1>
          <p class="page-subtitle">
            {{ order ? formatDate(order.createdAt) : "" }}
          </p>
        </div>
        <div v-if="order" :class="['status-badge-large', order.status]">
          <span class="status-dot"></span>
          {{ getStatusTitle(order.status) }}
        </div>
      </div>
    </header>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка деталей заказа...</p>
    </div>

    <div v-else-if="!order" class="not-found">
      <svg
        class="not-found-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
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
      <div
        v-if="order.status === 'preorder' && order.preorderMessage"
        class="preorder-banner"
      >
        <div class="banner-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div class="banner-content">
          <h3 class="banner-title">Товар доступен под заказ</h3>
          <p class="banner-message">{{ order.preorderMessage }}</p>
          <div v-if="canCancel" class="banner-actions">
            <button class="btn btn-outline btn-sm" @click="cancelOrder">
              Отменить заказ
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="order.status === 'ready_for_pickup' && order.verificationCode"
        class="code-banner"
      >
        <div class="banner-icon code">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div class="banner-content">
          <h3 class="banner-title">Заказ готов к выдаче!</h3>
          <p class="banner-message">
            Покажите этот код сотруднику при получении
          </p>
          <div class="verification-code">{{ order.verificationCode }}</div>
        </div>
      </div>

      <div class="products-section">
        <h2 class="section-title">Товары в заказе</h2>

        <div class="products-grid">
          <div
            v-for="(item, index) in order.items"
            :key="index"
            class="product-card"
            @click="goToProduct(item.productId)"
          >
            <div class="product-image">
              <img
                v-if="item.image"
                :src="getProductImage(item.image)"
                :alt="item.name"
              />
              <div v-else class="product-image-placeholder">
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
              <span class="product-qty">× {{ item.quantity }}</span>
            </div>

            <div class="product-info">
              <h3 class="product-name">{{ item.name }}</h3>
              <p class="product-price">{{ formatPrice(item.price) }} ₽</p>
              <p class="product-total">
                Итого: {{ formatPrice(item.price * item.quantity) }} ₽
              </p>
            </div>

            <div class="product-arrow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-grid">
          <div class="info-card">
            <div class="info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Контактное лицо</span>
              <span class="info-value">{{ order.contactName }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Телефон</span>
              <span class="info-value">{{
                formatPhone(order.contactPhone)
              }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Способ получения</span>
              <span class="info-value">{{
                order.deliveryType === "pickup" ? "Самовывоз" : "Доставка"
              }}</span>
            </div>
          </div>

          <div v-if="order.deliveryAddress" class="info-card">
            <div class="info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Адрес доставки</span>
              <span class="info-value">{{ order.deliveryAddress }}</span>
            </div>
          </div>

          <div v-if="order.pickupDate" class="info-card">
            <div class="info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Дата получения</span>
              <span class="info-value">{{
                formatDateTime(order.pickupDate)
              }}</span>
            </div>
          </div>

          <div class="info-card">
            <div class="info-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div class="info-content">
              <span class="info-label">Сумма заказа</span>
              <span class="info-value total"
                >{{ formatPrice(order.totalAmount) }} ₽</span
              >
            </div>
          </div>
        </div>
      </div>

      <div class="timeline-section">
        <h2 class="section-title">Статус заказа</h2>

        <div class="timeline">
          <div
            v-for="(stage, index) in timelineStages"
            :key="stage.id"
            :class="[
              'timeline-stage',
              {
                completed: isStageCompleted(order.status, index),
                current: isStageCurrent(order.status, index),
              },
            ]"
          >
            <div class="timeline-marker">
              <div class="marker-dot">
                <svg
                  v-if="isStageCompleted(order.status, index)"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div
                v-if="index < timelineStages.length - 1"
                class="marker-line"
              ></div>
            </div>
            <div class="timeline-content">
              <span class="timeline-label">{{ stage.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="canChooseDelivery" class="delivery-form-section">
        <div class="message-banner info">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>Ваш заказ подтверждён! Выберите способ получения</p>
        </div>

        <div class="delivery-type-selector">
          <button
            type="button"
            :class="[
              'delivery-type-btn',
              { active: deliveryForm.deliveryType === 'pickup' },
            ]"
            @click="deliveryForm.deliveryType = 'pickup'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Самовывоз</span>
          </button>
          <button
            type="button"
            :class="[
              'delivery-type-btn',
              { active: deliveryForm.deliveryType === 'delivery' },
            ]"
            @click="deliveryForm.deliveryType = 'delivery'"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Доставка</span>
          </button>
        </div>

        <div v-if="deliveryForm.deliveryType === 'pickup'" class="form-group">
          <label for="pickup-date" class="form-label">Дата получения *</label>
          <input
            id="pickup-date"
            v-model="deliveryForm.pickupDate"
            type="datetime-local"
            class="form-input"
            :min="minPickupDate"
          />
        </div>

        <div v-if="deliveryForm.deliveryType === 'delivery'" class="form-group">
          <label for="delivery-address" class="form-label"
            >Адрес доставки *</label
          >
          <input
            id="delivery-address"
            v-model="deliveryForm.deliveryAddress"
            type="text"
            class="form-input"
            placeholder="Город, улица, дом, квартира"
          />
        </div>

        <button
          class="btn btn-primary btn-lg"
          @click="handleDeliverySubmit"
          :disabled="isDeliverySubmitting || !isDeliveryFormValid"
        >
          {{
            isDeliverySubmitting
              ? "Сохранение..."
              : "Сохранить способ получения"
          }}
        </button>
      </div>

      <div v-if="canCancel" class="actions-section">
        <button class="btn btn-outline btn-danger" @click="cancelOrder">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Отменить заказ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getMyOrderById, cancelMyOrder, updateOrderDelivery } from "@/api";
import type { Order, OrderStatus } from "@/types";

const router = useRouter();
const route = useRoute();

const order = ref<Order | null>(null);
const isLoading = ref(true);
const isDeliverySubmitting = ref(false);

const orderId = computed(() => route.params.id as string);

const deliveryForm = ref({
  deliveryType: "pickup" as "pickup" | "delivery",
  deliveryAddress: "",
  pickupDate: "",
});

const timelineStages = [
  { id: "pending", label: "На рассмотрении" },
  { id: "confirmed", label: "Подтверждён" },
  { id: "ready_for_pickup", label: "Готов к выдаче" },
  { id: "delivering", label: "Доставляется" },
  { id: "completed", label: "Получен" },
];

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

const isStageCompleted = (status: OrderStatus, stageIndex: number): boolean => {
  const stageOrder = [
    "pending",
    "confirmed",
    "ready_for_pickup",
    "delivering",
    "completed",
  ];
  const statusIndex = stageOrder.indexOf(status);
  return statusIndex > stageIndex;
};

const isStageCurrent = (status: OrderStatus, stageIndex: number): boolean => {
  const stageOrder = [
    "pending",
    "confirmed",
    "ready_for_pickup",
    "delivering",
    "completed",
  ];
  const statusIndex = stageOrder.indexOf(status);
  return statusIndex === stageIndex && status !== "cancelled";
};

const canCancel = computed(() => {
  if (!order.value) return false;
  return ["pending", "confirmed", "preorder"].includes(order.value.status);
});

const canChooseDelivery = computed(() => {
  if (!order.value) return false;
  return (
    order.value.status === "confirmed" &&
    !order.value.pickupDate &&
    !order.value.deliveryAddress
  );
});

const minPickupDate = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
});

const isDeliveryFormValid = computed(() => {
  if (deliveryForm.value.deliveryType === "pickup") {
    return !!deliveryForm.value.pickupDate;
  }
  return !!deliveryForm.value.deliveryAddress;
});

const loadOrder = async () => {
  isLoading.value = true;
  try {
    const response = await getMyOrderById(orderId.value);
    order.value = response.data.order;
    if (order.value?.deliveryType) {
      deliveryForm.value.deliveryType = order.value.deliveryType;
    }
  } catch (error) {
    console.error("Failed to load order:", error);
  } finally {
    isLoading.value = false;
  }
};

const cancelOrder = async () => {
  if (!confirm("Вы уверены, что хотите отменить заказ?")) return;

  try {
    await cancelMyOrder(orderId.value);
    await loadOrder();
  } catch (error: any) {
    alert(
      "Не удалось отменить заказ: " + (error.response?.data?.error || "Ошибка")
    );
  }
};

const handleDeliverySubmit = async () => {
  if (!isDeliveryFormValid.value) return;

  isDeliverySubmitting.value = true;
  try {
    await updateOrderDelivery(orderId.value, {
      deliveryType: deliveryForm.value.deliveryType,
      deliveryAddress:
        deliveryForm.value.deliveryType === "delivery"
          ? deliveryForm.value.deliveryAddress
          : undefined,
      pickupDate:
        deliveryForm.value.deliveryType === "pickup"
          ? deliveryForm.value.pickupDate
          : undefined,
    });
    await loadOrder();
    alert("Способ получения сохранён");
  } catch (error: any) {
    alert("Не удалось сохранить: " + (error.response?.data?.error || "Ошибка"));
  } finally {
    isDeliverySubmitting.value = false;
  }
};

const goToProduct = (productId: string) => {
  router.push(`/product/${productId}`);
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

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPhone = (phone: string): string => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      9
    )}-${cleaned.slice(9)}`;
  }
  return phone;
};

const getProductImage = (imagePath: string): string => {
  if (imagePath.startsWith("/uploads/")) {
    return `http://localhost:5000${imagePath}`;
  }
  return imagePath;
};

onMounted(() => {
  loadOrder();
});
</script>

<style scoped>
.order-detail-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-8) var(--spacing-6);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
  margin-bottom: var(--spacing-4);
}

.back-link:hover {
  color: var(--color-primary);
}

.back-link svg {
  width: 16px;
  height: 16px;
}

.page-header {
  margin-bottom: var(--spacing-6);
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
  margin: 0 0 var(--spacing-1) 0;
}

.page-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

.status-badge-large {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: capitalize;
}

.status-badge-large.pending {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
}

.status-badge-large.confirmed {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.status-badge-large.preorder {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.status-badge-large.ready_for_pickup {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.status-badge-large.delivering {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge-large.completed {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.status-badge-large.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: currentColor;
}

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
  to {
    transform: rotate(360deg);
  }
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

.order-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.products-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.preorder-banner {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-lg);
}

.delivery-banner {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: rgba(5, 150, 105, 0.1);
  border: 1px solid rgba(5, 150, 105, 0.3);
  border-radius: var(--radius-lg);
}

.banner-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 92, 246, 0.2);
  border-radius: var(--radius-md);
}

.banner-icon.success {
  background: rgba(5, 150, 105, 0.2);
}

.banner-icon.code {
  background: rgba(251, 191, 36, 0.2);
}

.banner-icon svg {
  width: 24px;
  height: 24px;
  color: #8b5cf6;
}

.banner-icon.success svg {
  color: #059669;
}

.banner-icon.code svg {
  color: #fbbf24;
}

.verification-code {
  display: inline-block;
  padding: var(--spacing-3) var(--spacing-6);
  background: rgba(251, 191, 36, 0.2);
  border: 2px dashed #fbbf24;
  border-radius: var(--radius-lg);
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: #fbbf24;
  letter-spacing: 8px;
  margin-top: var(--spacing-3);
}

.banner-content {
  flex: 1;
}

.banner-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.banner-message {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3) 0;
  line-height: var(--line-height-relaxed);
}

.banner-actions {
  display: flex;
  gap: var(--spacing-2);
}

.btn-sm {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-small);
}

.section-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.products-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.product-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.product-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateX(4px);
  background: var(--color-surface-secondary);
}

.product-image {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  flex-shrink: 0;
  background: var(--color-background);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
}

.product-image-placeholder svg {
  width: 32px;
  height: 32px;
}

.product-qty {
  position: absolute;
  top: 4px;
  right: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-1) 0;
}

.product-total {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
}

.product-arrow {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.product-card:hover .product-arrow {
  color: var(--color-primary);
  transform: translateX(4px);
}

.product-arrow svg {
  width: 20px;
  height: 20px;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.info-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.info-icon svg {
  width: 24px;
  height: 24px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

.info-value.total {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.timeline-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.timeline {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
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
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-border);
  border: 3px solid var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.marker-dot svg {
  width: 16px;
  height: 16px;
  color: white;
}

.marker-line {
  width: 2px;
  height: 40px;
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

.delivery-form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.message-banner {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
}

.message-banner.info {
  background: rgba(37, 99, 235, 0.05);
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.message-banner.info svg {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.message-banner p {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  margin: 0;
}

.delivery-type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-3);
}

.delivery-type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-background);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.delivery-type-btn svg {
  width: 32px;
  height: 32px;
  color: var(--color-text-secondary);
}

.delivery-type-btn span {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.delivery-type-btn.active {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.05);
}

.delivery-type-btn.active svg {
  color: var(--color-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-6);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions-section {
  display: flex;
  justify-content: center;
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
}

.btn-danger {
  color: var(--color-error);
  border-color: var(--color-error);
}

.btn-danger:hover {
  background: var(--color-error);
  color: white;
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

  .timeline {
    overflow-x: auto;
    padding: var(--spacing-4);
  }

  .timeline-stage {
    min-width: 100px;
  }

  .delivery-type-selector {
    grid-template-columns: 1fr;
  }
}
</style>
