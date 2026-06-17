<template>
  <router-link :to="`/product/${product.id}`" class="product-card-simple">
    <div class="product-image-wrapper">
      <img
        :src="productImage"
        :alt="product.name"
        class="product-image"
        loading="lazy"
      />
      <div
        v-if="product.priceHistory && product.priceHistory.length > 1"
        class="price-badge"
      >
        {{ priceChange }}%
      </div>
    </div>

    <div class="product-info">
      <div class="product-brand">{{ product.brand }}</div>
      <h3 class="product-name">{{ product.name }}</h3>

      <div class="product-price">
        <span class="price-current">{{ formatPrice(product.price) }} ₽</span>
      </div>

      <div class="product-rating" v-if="hasRatings">
        <svg class="star-icon" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
        <span class="rating-value">{{ averageRating }}</span>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Product } from "@/types";

const props = defineProps<{
  product: Product;
}>();

const productImage = computed(() => {
  if (props.product.images && props.product.images.length > 0) {
    return `http://localhost:5000${props.product.images[0]}`;
  }
  return "https://via.placeholder.com/400x400/F5F7FA/2563EB?text=Product";
});

const formatPrice = (price: number): string => {
  return price.toLocaleString("ru-RU");
};

const priceChange = computed(() => {
  const history = props.product.priceHistory;
  if (!history || history.length < 2) return 0;

  const current = history[history.length - 1].price;
  const previous = history[history.length - 2].price;

  const change = ((current - previous) / previous) * 100;
  return Math.round(Math.abs(change));
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
  return (sum / ratings.length).toFixed(1);
});
</script>

<style scoped>
.product-card-simple {
  display: block;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
  text-decoration: none;
  color: inherit;
}

.product-card-simple:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform var(--transition-slow);
  padding: var(--spacing-4);
}

.product-card-simple:hover .product-image {
  transform: scale(1.15);
}

.price-badge {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  padding: var(--spacing-1) var(--spacing-3);
  background: var(--color-error);
  color: var(--color-text-inverse);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-md);
}

.product-info {
  padding: var(--spacing-5);
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
}

.star-icon {
  width: 16px;
  height: 16px;
  color: #fbbf24;
}

.rating-value {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}
</style>
