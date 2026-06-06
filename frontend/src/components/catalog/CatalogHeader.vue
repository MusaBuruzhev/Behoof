<template>
  <div class="catalog-header">
    <nav class="breadcrumbs">
      <router-link to="/catalog" class="breadcrumb-item">
        Каталог
      </router-link>
      <template v-if="currentCategory">
        <svg class="breadcrumb-separator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <router-link :to="`/catalog/${currentCategory.id}`" class="breadcrumb-item">
          {{ currentCategory.name }}
        </router-link>
      </template>
      <template v-if="currentSubcategory">
        <svg class="breadcrumb-separator" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
        <span class="breadcrumb-item breadcrumb-current">
          {{ currentSubcategory.name }}
        </span>
      </template>
    </nav>
    
    <div class="catalog-title-section">
      <h1 class="catalog-title">
        {{ pageTitle }}
      </h1>
      <p class="catalog-count">
        Найдено товаров: <span class="count-value">{{ totalProducts }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category, Subcategory } from '@/types'

const props = defineProps<{
  currentCategory: Category | null
  currentSubcategory: Subcategory | null
  totalProducts: number
}>()

const pageTitle = computed(() => {
  if (props.currentSubcategory) {
    return props.currentSubcategory.name
  }
  if (props.currentCategory) {
    return props.currentCategory.name
  }
  return 'Все товары'
})
</script>

<style scoped>
.catalog-header {
  margin-bottom: var(--spacing-8);
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-small);
}

.breadcrumb-item {
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.breadcrumb-item:hover {
  color: var(--color-primary);
}

.breadcrumb-current {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.breadcrumb-separator {
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
}

.catalog-title-section {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.catalog-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.catalog-count {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.count-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

@media (max-width: 640px) {
  .catalog-title {
    font-size: var(--font-size-h3);
  }
  
  .catalog-title-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
