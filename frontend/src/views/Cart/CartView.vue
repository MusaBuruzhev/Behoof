<template>
  <div class="cart-view">
    <div class="container">
      <!-- Header -->
      <div class="cart-header">
        <div class="header-content">
          <h1 class="cart-title">Корзина</h1>
          <p class="cart-subtitle">
            Проверьте товары перед оформлением заказа
          </p>
        </div>
        <div v-if="!cartStore.isEmpty" class="cart-summary-header">
          <span class="summary-count">{{ cartStore.itemCount }} товаров</span>
          <span class="summary-total">{{ cartStore.formattedTotal }} ₽</span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="cartStore.isEmpty && !cartStore.isLoading" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <h2 class="empty-title">Корзина пуста</h2>
        <p class="empty-description">
          Добавьте товары из каталога и они появятся здесь
        </p>
        <router-link to="/catalog" class="btn btn-primary btn-lg">
          Перейти в каталог
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>

      <div v-else class="cart-content">
        <!-- Cart Items -->
        <div class="cart-items-section">
          <div class="cart-items">
            <div
              v-for="item in cartStore.items"
              :key="item.productId"
              class="cart-item"
            >
              <div class="item-image-wrapper">
                <img
                  :src="getProductImage(item.product)"
                  :alt="item.product?.name || 'Товар'"
                  class="item-image"
                />
              </div>

              <div class="item-details">
                <div class="item-brand">{{ item.product?.brand }}</div>
                <h3 class="item-name">
                  <router-link :to="`/product/${item.productId}`">
                    {{ item.product?.name }}
                  </router-link>
                </h3>

                <div class="item-specs">
                  <div
                    v-for="spec in getShortSpecs(item.product)"
                    :key="spec.trait"
                    class="spec-item"
                  >
                    <span class="spec-trait">{{ spec.trait }}:</span>
                    <span class="spec-value">{{ spec.value }}</span>
                  </div>
                </div>
              </div>

              <div class="item-actions">
                <div class="quantity-control">
                  <button
                    type="button"
                    class="qty-btn"
                    @click="decreaseQuantity(item.productId)"
                    :disabled="item.quantity <= 1"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button
                    type="button"
                    class="qty-btn"
                    @click="increaseQuantity(item.productId)"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                </div>

                <div class="item-price-block">
                  <div class="item-price">{{ formatPrice(item.product?.price || 0) }} ₽</div>
                  <div class="item-subtotal">{{ formatPrice(item.subtotal) }} ₽</div>
                </div>

                <div class="item-buttons">
                  <button
                    type="button"
                    class="compare-btn"
                    :class="{ active: isInCompare(item.productId) }"
                    @click="toggleCompare(item.productId)"
                    title="Сравнить"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    class="remove-btn"
                    @click="removeItem(item.productId)"
                    title="Удалить товар"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Clear Cart -->
          <button
            v-if="!cartStore.isEmpty"
            type="button"
            class="clear-cart-btn"
            @click="confirmClearCart"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Очистить корзину
          </button>
        </div>

        <!-- Sticky Order Summary -->
        <div class="order-summary-sticky" ref="stickySummary">
          <div class="order-summary">
            <h3 class="summary-title">Ваш заказ</h3>

            <div class="summary-row">
              <span class="summary-label">Товары ({{ cartStore.itemCount }})</span>
              <span class="summary-value">{{ cartStore.formattedTotal }} ₽</span>
            </div>

            <div class="summary-row summary-discount">
              <span class="summary-label">Скидка</span>
              <span class="summary-value discount">0 ₽</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-row summary-total">
              <span class="summary-label">Итого</span>
              <span class="summary-value total">{{ cartStore.formattedTotal }} ₽</span>
            </div>

            <p class="summary-note">
              Доставка рассчитывается при оформлении
            </p>

            <button
              type="button"
              class="btn btn-primary btn-checkout"
              :disabled="cartStore.isEmpty || cartStore.isLoading"
              @click="proceedToCheckout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Оформить заказ
            </button>

            <button
              type="button"
              class="btn btn-secondary btn-continue"
              @click="$router.push('/catalog')"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0 && !cartStore.isEmpty" class="related-section">
        <div class="section-header">
          <h2 class="section-title">Вам может понравиться</h2>
        </div>

        <div class="related-grid">
          <ProductCard
            v-for="product in relatedProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore, useAuthStore, useComparisonStore } from '@/stores'
import { createOrder } from '@/api'
import type { Product } from '@/types'
import ProductCard from '@/components/catalog/ProductCard.vue'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()
const comparisonStore = useComparisonStore()

const relatedProducts = ref<Product[]>([])

const getProductImage = (product: Product | null): string => {
  if (product?.images && product.images.length > 0) {
    return `http://localhost:5000${product.images[0]}`
  }
  return 'https://via.placeholder.com/400x400/F5F7FA/2563EB?text=Product'
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU')
}

const getShortSpecs = (product: Product | null) => {
  if (!product?.characteristics) return []
  return product.characteristics.slice(0, 2)
}

const increaseQuantity = async (productId: string) => {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item) {
    await cartStore.updateQuantity(productId, item.quantity + 1)
  }
}

const decreaseQuantity = async (productId: string) => {
  const item = cartStore.items.find(i => i.productId === productId)
  if (item && item.quantity > 1) {
    await cartStore.updateQuantity(productId, item.quantity - 1)
  }
}

const removeItem = async (productId: string) => {
  await cartStore.removeFromCart(productId)
}

const confirmClearCart = () => {
  if (confirm('Вы уверены, что хотите очистить корзину?')) {
    cartStore.clearCart()
  }
}

const isInCompare = (productId: string) => comparisonStore.isInCompare(productId)

const toggleCompare = (productId: string) => {
  if (isInCompare(productId)) {
    comparisonStore.removeFromCompare(productId)
  } else {
    if (!comparisonStore.maxReached) {
      comparisonStore.addToCompare(productId)
    } else {
      alert('Максимум 4 товара для сравнения')
    }
  }
}

const proceedToCheckout = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login?redirect=/cart')
    return
  }

  if (cartStore.isEmpty) return

  try {
    // Создаём заказ для первого товара в корзине
    // В реальной реализации нужно создать модальное окно с выбором способа доставки
    const firstItem = cartStore.items[0]
    if (!firstItem) return

    await createOrder({
      productId: firstItem.productId,
      pickupAt: new Date(Date.now() + 86400000).toISOString(), // Завтра
      contactPhone: authStore.user?.phoneNumber || undefined,
      comment: `Заказ из корзины (${cartStore.items.length} товаров)`,
    })

    // Очищаем корзину после успешного заказа
    await cartStore.clearCart()

    // Перенаправляем на страницу заказов
    router.push('/orders')
  } catch (error) {
    console.error('Failed to create order:', error)
    alert('Не удалось оформить заказ. Попробуйте позже.')
  }
}

// Load related products (mock for now)
const loadRelatedProducts = async () => {
  // В реальной реализации здесь будет API запрос
  relatedProducts.value = []
}

onMounted(async () => {
  await cartStore.fetchCart()
  await loadRelatedProducts()
})
</script>

<style scoped>
.cart-view {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--spacing-10) 0;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

/* Header */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
}

.header-content {
  flex: 1;
}

.cart-title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.cart-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.cart-summary-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.summary-count {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
}

.summary-total {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.empty-icon {
  width: 96px;
  height: 96px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-6);
}

.empty-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.empty-description {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
  max-width: 400px;
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body);
}

.btn-icon {
  width: 20px;
  height: 20px;
  margin-left: var(--spacing-2);
}

/* Cart Content */
.cart-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-8);
  align-items: start;
}

/* Cart Items */
.cart-items-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: var(--spacing-5);
  padding: var(--spacing-5);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.cart-item:hover {
  box-shadow: var(--shadow-md);
}

.item-image-wrapper {
  aspect-ratio: 1;
  background: var(--color-background);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.item-brand {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.item-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-snug);
  margin: 0;
}

.item-name a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.item-name a:hover {
  color: var(--color-primary);
}

.item-specs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-top: var(--spacing-2);
}

.spec-item {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

.spec-trait {
  font-weight: var(--font-weight-medium);
}

.spec-value {
  color: var(--color-text-secondary);
}

/* Item Actions */
.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-4);
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  background: var(--color-background);
  border-radius: var(--radius-md);
  padding: var(--spacing-2);
}

.qty-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.qty-btn:hover:not(:disabled) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-btn svg {
  width: 14px;
  height: 14px;
}

.qty-value {
  min-width: 32px;
  text-align: center;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.item-price-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
}

.item-price {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.item-subtotal {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.item-buttons {
  display: flex;
  gap: var(--spacing-2);
}

.compare-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.compare-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.compare-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.compare-btn svg {
  width: 18px;
  height: 18px;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.remove-btn:hover {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-text-inverse);
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

/* Clear Cart */
.clear-cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background: transparent;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.clear-cart-btn:hover {
  border-color: var(--color-error);
  color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.clear-cart-btn svg {
  width: 18px;
  height: 18px;
}

/* Order Summary */
.order-summary-sticky {
  position: sticky;
  top: calc(80px + var(--spacing-6));
}

.order-summary {
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.summary-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-5);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-2) 0;
}

.summary-label {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.summary-value.discount {
  color: #059669;
}

.summary-value.total {
  font-size: var(--font-size-h3);
  color: var(--color-primary);
}

.summary-divider {
  height: 1px;
  background: var(--color-border);
  margin: var(--spacing-4) 0;
}

.summary-note {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-5);
}

.btn-checkout {
  width: 100%;
  padding: var(--spacing-4);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
}

.btn-checkout svg {
  width: 20px;
  height: 20px;
}

.btn-continue {
  width: 100%;
  padding: var(--spacing-3);
  font-size: var(--font-size-body);
}

/* Related Products */
.related-section {
  margin-top: var(--spacing-12);
  padding-top: var(--spacing-10);
  border-top: 1px solid var(--color-border);
}

.section-header {
  margin-bottom: var(--spacing-6);
}

.section-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-6);
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-content {
    grid-template-columns: 1fr;
  }

  .order-summary-sticky {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-view {
    padding: var(--spacing-6) 0;
  }

  .cart-header {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .cart-title {
    font-size: var(--font-size-h2);
  }

  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: var(--spacing-4);
  }

  .item-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .item-price-block {
    flex-direction: row;
    align-items: center;
    gap: var(--spacing-3);
  }

  .item-subtotal {
    font-size: var(--font-size-body);
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-4);
  }

  .empty-state {
    padding: var(--spacing-8);
  }

  .cart-item {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .item-image-wrapper {
    max-width: 200px;
    margin: 0 auto;
  }

  .item-actions {
    flex-direction: column;
  }

  .quantity-control {
    justify-content: center;
  }
}
</style>
