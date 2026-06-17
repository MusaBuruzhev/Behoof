<template>
  <section class="reviews-section section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title h2">Отзывы покупателей</h2>
        <p class="section-description">Реальные отзывы от наших клиентов</p>
      </div>

      <div v-if="loading" class="reviews-loading">
        <div class="loading-spinner"></div>
        <p>Загрузка отзывов...</p>
      </div>

      <div v-else-if="error" class="reviews-error">
        <p>Не удалось загрузить отзывы</p>
      </div>

      <div v-else-if="reviews.length === 0" class="reviews-empty">
        <p>Отзывов пока нет</p>
      </div>

      <div v-else class="reviews-grid">
        <ReviewCard
          v-for="review in reviews"
          :key="review.id"
          :review="review"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCatalog } from "@/api";
import type { Review } from "@/types";
import ReviewCard from "@/components/home/ReviewCard.vue";

const reviews = ref<(Review & { productName?: string })[]>([]);
const loading = ref(false);
const error = ref(false);

const loadReviews = async () => {
  loading.value = true;
  error.value = false;

  try {
    const response = await getCatalog();
    const products = response.data.products || {};

    const allReviews: (Review & {
      productName?: string;
      productId?: string;
    })[] = [];

    Object.values(products).forEach((product: any) => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach((review: Review) => {
          allReviews.push({
            ...review,
            productName: product.name,
            productId: product.id,
          });
        });
      }
    });

    allReviews.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    reviews.value = allReviews.slice(0, 6);
  } catch (err) {
    console.error("Failed to load reviews:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadReviews();
});
</script>

<style scoped>
.reviews-section {
  background-color: var(--color-surface);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-16);
}

.section-title {
  margin-bottom: var(--spacing-4);
}

.section-description {
  font-size: var(--font-size-body-large);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.reviews-loading,
.reviews-error,
.reviews-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-24);
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .reviews-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .reviews-grid {
    grid-template-columns: 1fr;
  }
}
</style>
