<template>
  <div class="catalog-pagination">
    <div class="pagination-info">
      Показано {{ startItem }}–{{ endItem }} из {{ totalProducts }} товаров
    </div>
    
    <div class="pagination-controls">
      <button
        class="pagination-btn"
        :disabled="currentPage === 1"
        @click="$emit('change-page', currentPage - 1)"
        title="Предыдущая"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      
      <div class="pagination-pages">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage }"
          @click="$emit('change-page', page)"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        class="pagination-btn"
        :disabled="currentPage === totalPages"
        @click="$emit('change-page', currentPage + 1)"
        title="Следующая"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalProducts: number
}>()

defineEmits<{
  'change-page': [page: number]
}>()

const itemsPerPage = 20
const startItem = computed(() => {
  return (props.currentPage - 1) * itemsPerPage + 1
})

const endItem = computed(() => {
  return Math.min(props.currentPage * itemsPerPage, props.totalProducts)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  
  let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(props.totalPages, start + maxVisible - 1)
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})
</script>

<style scoped>
.catalog-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6) 0;
  border-top: 1px solid var(--color-border);
}

.pagination-info {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-btn svg {
  width: 20px;
  height: 20px;
}

.pagination-pages {
  display: flex;
  gap: var(--spacing-2);
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 var(--spacing-3);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
}

.page-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

@media (max-width: 640px) {
  .catalog-pagination {
    flex-direction: column;
    gap: var(--spacing-4);
  }
  
  .pagination-info {
    text-align: center;
  }
}
</style>
