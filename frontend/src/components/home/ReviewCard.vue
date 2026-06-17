<template>
  <div class="review-card">
    <div class="review-header">
      <div class="review-author">
        <div class="author-avatar">
          {{ authorInitials }}
        </div>
        <div class="author-info">
          <span class="author-name">{{ review.userName }}</span>
          <span v-if="review.productName" class="product-name">{{
            review.productName
          }}</span>
        </div>
      </div>
      <span class="review-date">{{ formatDate(review.createdAt) }}</span>
    </div>

    <p class="review-text">{{ review.text }}</p>

    <div v-if="hasRatings" class="review-ratings">
      <div
        v-for="(rating, trait) in review.traitRatings"
        :key="trait"
        class="rating-item"
      >
        <span class="rating-trait">{{ trait }}</span>
        <div class="rating-stars">
          <svg
            v-for="star in 5"
            :key="star"
            class="star-icon"
            viewBox="0 0 24 24"
            :fill="star <= rating ? 'currentColor' : 'none'"
            :stroke="star <= rating ? 'currentColor' : '#D1D5DB'"
            stroke-width="2"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Review } from "@/types";

const props = defineProps<{
  review: Review & { productName?: string };
}>();

const authorInitials = computed(() => {
  const names = props.review.userName.split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return props.review.userName.slice(0, 2).toUpperCase();
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const hasRatings = computed(() => {
  return (
    props.review.traitRatings &&
    Object.keys(props.review.traitRatings).length > 0
  );
});
</script>

<style scoped>
.review-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-light);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.review-author {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-primary-light);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.author-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.product-name {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.review-date {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

.review-text {
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-5);
}

.review-ratings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}

.rating-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.rating-trait {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  min-width: 100px;
  text-transform: capitalize;
}

.rating-stars {
  display: flex;
  gap: var(--spacing-1);
}

.star-icon {
  width: 16px;
  height: 16px;
  color: #fbbf24;
}

.star-icon[fill="none"] {
  color: transparent;
}
</style>
