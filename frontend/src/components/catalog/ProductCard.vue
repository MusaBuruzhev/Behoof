<template>
  <div class="product-card">
    <router-link :to="`/product/${product.id}`" class="product-card-link">
      <div class="product-image-wrapper">
        <img
          :src="productImage"
          :alt="product.name"
          class="product-image"
          loading="lazy"
        />

        <div class="product-actions">
          <button
            type="button"
            class="action-btn cart-btn"
            :class="{ active: isInCart }"
            @click.stop.prevent="handleAddToCart"
            title="В корзину"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </button>
          <button
            type="button"
            class="action-btn"
            :class="{ active: isFavorite }"
            @click.stop.prevent="toggleFavorite"
            title="В избранное"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              />
            </svg>
          </button>
          <button
            type="button"
            class="action-btn"
            :class="{ active: isInCompare }"
            @click.stop.prevent="toggleCompare"
            title="Сравнить"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
            </svg>
          </button>
        </div>

        <div v-if="hasPriceHistory" class="price-badge">
          {{ priceChangeLabel }}
        </div>
      </div>

      <div class="product-info">
        <div class="product-brand">{{ product.brand }}</div>
        <h3 class="product-name">{{ product.name }}</h3>

        <div class="product-price">
          <span class="price-current">{{ formatPrice(product.price) }} ₽</span>
        </div>

        <div v-if="hasRatings" class="product-rating">
          <div class="rating-stars">
            <svg
              v-for="star in 5"
              :key="star"
              class="star-icon"
              viewBox="0 0 24 24"
              :fill="star <= averageRating ? 'currentColor' : 'none'"
              :stroke="star <= averageRating ? 'currentColor' : '#D1D5DB'"
              stroke-width="2"
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </div>
          <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
        </div>

        <div v-if="product.reviews.length > 0" class="product-reviews">
          <svg
            class="review-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
          <span class="reviews-count">{{ product.reviews.length }}</span>
        </div>
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useComparisonStore, useCartStore, useFavoritesStore } from "@/stores";
import { addToFavorites, removeFromFavorites } from "@/api";
import type { Product } from "@/types";

const props = defineProps<{
  product: Product;
}>();

const emit = defineEmits<{
  removeFromFavorites: [productId: string];
}>();

const comparisonStore = useComparisonStore();
const cartStore = useCartStore();
const favoritesStore = useFavoritesStore();
const isAddingToCart = ref(false);

const isFavorite = computed(() => favoritesStore.isFavorite(props.product.id));
const isInCompare = computed(() =>
  comparisonStore.isInCompare(props.product.id)
);
const isInCart = computed(() => cartStore.isInCart(props.product.id));

const productImage = computed(() => {
  if (props.product.images && props.product.images.length > 0) {
    return `http://localhost:5000${props.product.images[0]}`;
  }
  return "https://via.placeholder.com/400x400/F5F7FA/2563EB?text=Product";
});

const formatPrice = (price: number): string => {
  return price.toLocaleString("ru-RU");
};

const hasPriceHistory = computed(() => {
  return props.product.priceHistory && props.product.priceHistory.length > 1;
});

const priceChangeLabel = computed(() => {
  if (!hasPriceHistory.value) return "";

  const history = props.product.priceHistory;
  const current = history[history.length - 1].price;
  const previous = history[history.length - 2].price;

  const change = ((current - previous) / previous) * 100;

  if (change > 0) {
    return `+${Math.round(change)}%`;
  } else if (change < 0) {
    return `${Math.round(change)}%`;
  }
  return "";
});

const hasRatings = computed(() => {
  return (
    props.product.traitRatings &&
    Object.keys(props.product.traitRatings).length > 0
  );
});

const averageRating = computed(() => {
  if (!hasRatings.value) return 0;

  const ratings = Object.values(props.product.traitRatings);
  const sum = ratings.reduce((acc, val) => acc + val, 0);
  return sum / ratings.length;
});

const toggleFavorite = async () => {
  try {
    if (isFavorite.value) {
      await removeFromFavorites(props.product.id);
      favoritesStore.removeFavorite(props.product.id);
      emit("removeFromFavorites", props.product.id);
    } else {
      await addToFavorites(props.product.id);
      favoritesStore.addFavorite(props.product.id);
    }
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
  }
};

const toggleCompare = () => {
  if (isInCompare.value) {
    comparisonStore.removeFromCompare(props.product.id);
  } else {
    if (!comparisonStore.maxReached) {
      comparisonStore.addToCompare(props.product.id);
    } else {
      alert("Максимум 4 товара для сравнения");
    }
  }
};

const handleAddToCart = async () => {
  if (isInCart.value) return;

  isAddingToCart.value = true;
  try {
    await cartStore.addToCart(props.product.id, 1);
  } catch (error) {
    console.error("Failed to add to cart:", error);
  } finally {
    isAddingToCart.value = false;
  }
};
</script>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.product-card-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-background);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.product-actions {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  opacity: 0;
  transform: translateX(8px);
  transition: all var(--transition-fast);
}

.product-card:hover .product-actions {
  opacity: 1;
  transform: translateX(0);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.action-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.action-btn:hover svg {
  stroke: var(--color-text-inverse);
}

.action-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.action-btn.active svg {
  stroke: var(--color-text-inverse);
  fill: var(--color-text-inverse);
}

.action-btn svg {
  width: 18px;
  height: 18px;
  stroke: var(--color-text-secondary);
  transition: stroke var(--transition-fast);
}

.cart-btn.active {
  background: #059669;
  border-color: #059669;
}

.cart-btn.active svg {
  stroke: var(--color-text-inverse);
  fill: none;
}

.price-badge {
  position: absolute;
  top: var(--spacing-3);
  left: var(--spacing-3);
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-error);
  color: var(--color-text-inverse);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
}

.product-info {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-5);
  flex: 1;
}

.product-brand {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.product-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
  line-height: var(--line-height-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.product-price {
  margin-bottom: var(--spacing-3);
}

.price-current {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.product-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.rating-stars {
  display: flex;
  gap: var(--spacing-1);
}

.star-icon {
  width: 14px;
  height: 14px;
  color: #fbbf24;
}

.star-icon[fill="none"] {
  color: transparent;
}

.rating-value {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.product-reviews {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.review-icon {
  width: 14px;
  height: 14px;
  color: var(--color-text-tertiary);
}

.reviews-count {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}
</style>
