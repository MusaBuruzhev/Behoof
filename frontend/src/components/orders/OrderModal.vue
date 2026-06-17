<template>
  <div
    v-if="modelValue"
    class="modal-overlay"
    @click="$emit('update:modelValue', false)"
  >
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Оформление заказа</h2>
        <button class="modal-close" @click="$emit('update:modelValue', false)">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="order-form">
        <div v-if="product" class="product-summary">
          <img :src="productImage" :alt="product.name" class="product-image" />
          <div class="product-info">
            <h4 class="product-name">{{ product.name }}</h4>
            <p class="product-price">{{ formatPrice(product.price) }}</p>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Способ получения</label>
          <div class="delivery-type-selector">
            <button
              type="button"
              :class="[
                'delivery-type-btn',
                { active: form.deliveryType === 'pickup' },
              ]"
              @click="form.deliveryType = 'pickup'"
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
              Самовывоз
            </button>
            <button
              type="button"
              :class="[
                'delivery-type-btn',
                { active: form.deliveryType === 'delivery' },
              ]"
              @click="form.deliveryType = 'delivery'"
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
              Доставка
            </button>
          </div>
        </div>

        <div v-if="form.deliveryType === 'pickup'" class="form-group">
          <label for="pickup-date" class="form-label">Дата получения *</label>
          <input
            id="pickup-date"
            v-model="form.pickupDate"
            type="datetime-local"
            class="form-input"
            required
            :min="minPickupDate"
          />
        </div>

        <div v-if="form.deliveryType === 'delivery'" class="form-group">
          <label for="delivery-address" class="form-label"
            >Адрес доставки *</label
          >
          <input
            id="delivery-address"
            v-model="form.deliveryAddress"
            type="text"
            class="form-input"
            placeholder="Город, улица, дом, квартира"
            required
          />
        </div>

        <div class="form-group">
          <label for="contact-name" class="form-label">Контактное лицо *</label>
          <input
            id="contact-name"
            v-model="form.contactName"
            type="text"
            class="form-input"
            placeholder="Иванов Иван"
            required
          />
        </div>

        <div class="form-group">
          <label for="contact-phone" class="form-label">Телефон *</label>
          <input
            id="contact-phone"
            v-model="form.contactPhone"
            type="tel"
            class="form-input"
            placeholder="+7 (777) 123-45-67"
            required
          />
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="$emit('update:modelValue', false)"
          >
            Отмена
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "Оформление..." : "Оформить заказ" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { createOrder } from "@/api";
import type { Product } from "@/types";

const props = defineProps<{
  modelValue: boolean;
  product: Product | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success"): void;
}>();

const isSubmitting = ref(false);

const form = reactive({
  deliveryType: "pickup" as "pickup" | "delivery",
  deliveryAddress: "",
  pickupDate: "",
  contactName: "",
  contactPhone: "",
});

const minPickupDate = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
});

const productImage = computed(() => {
  if (!props.product?.images?.[0]) return "";
  if (props.product.images[0].startsWith("/uploads/")) {
    return `http://localhost:5000${props.product.images[0]}`;
  }
  return props.product.images[0];
});

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(price);
};

const handleSubmit = async () => {
  if (!props.product) return;

  isSubmitting.value = true;
  try {
    await createOrder({
      items: [{ productId: props.product.id, quantity: 1 }],
      deliveryType: form.deliveryType,
      deliveryAddress:
        form.deliveryType === "delivery" ? form.deliveryAddress : undefined,
      pickupDate: form.deliveryType === "pickup" ? form.pickupDate : undefined,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
    });
    emit("update:modelValue", false);
    emit("success");
  } catch (error: any) {
    alert(
      "Ошибка: " + (error.response?.data?.error || "Не удалось оформить заказ")
    );
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-6);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.order-form {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.product-summary {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-background);
  border-radius: var(--radius-lg);
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
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
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin: 0;
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
  background: var(--color-surface);
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

.modal-footer {
  display: flex;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.modal-footer .btn {
  flex: 1;
  justify-content: center;
  padding: var(--spacing-3) var(--spacing-6);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface);
}
</style>
