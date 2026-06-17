<template>
  <div class="catalog-controls">
    <div class="search-wrapper">
      <svg
        class="search-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        :value="search"
        @input="
          $emit('update:search', ($event.target as HTMLInputElement).value)
        "
        @keyup.enter="$emit('search')"
        type="text"
        class="search-input"
        placeholder="Поиск товаров..."
      />
    </div>

    <div class="sort-wrapper">
      <label class="sort-label">Сортировать:</label>
      <select
        :value="sort"
        @change="
          $emit('update:sort', ($event.target as HTMLSelectElement).value)
        "
        class="sort-select"
      >
        <option value="date-desc">Сначала новые</option>
        <option value="price-asc">Сначала дешёвые</option>
        <option value="price-desc">Сначала дорогие</option>
        <option value="name-asc">По названию (А-Я)</option>
        <option value="name-desc">По названию (Я-А)</option>
      </select>
    </div>

    <div class="view-toggle">
      <button
        :class="['view-btn', { active: view === 'grid' }]"
        @click="$emit('update:view', 'grid')"
        title="Сетка"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
      <button
        :class="['view-btn', { active: view === 'list' }]"
        @click="$emit('update:view', 'list')"
        title="Список"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    </div>

    <span class="products-count-mobile">
      {{ totalProducts }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  search: string;
  sort: string;
  view: "grid" | "list";
  totalProducts: number;
}>();

defineEmits<{
  "update:search": [value: string];
  "update:sort": [value: string];
  "update:view": [value: "grid" | "list"];
  search: [];
  sort: [];
}>();
</script>

<style scoped>
.catalog-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-6);
}

.search-wrapper {
  flex: 1;
  position: relative;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3)
    calc(var(--spacing-4) + 18px + var(--spacing-2));
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.sort-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.sort-select {
  padding: var(--spacing-2) var(--spacing-8) var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.view-toggle {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-btn:hover {
  background: var(--color-surface-secondary);
}

.view-btn.active {
  background: var(--color-primary);
}

.view-btn.active svg {
  stroke: var(--color-text-inverse);
}

.view-btn svg {
  width: 20px;
  height: 20px;
  stroke: var(--color-text-secondary);
}

.products-count-mobile {
  display: none;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .catalog-controls {
    flex-wrap: wrap;
    gap: var(--spacing-3);
  }

  .search-wrapper {
    order: 1;
    flex-basis: 100%;
    max-width: none;
  }

  .sort-wrapper {
    order: 2;
    flex: 1;
  }

  .view-toggle {
    order: 3;
  }

  .products-count-mobile {
    display: block;
    order: 4;
  }
}

@media (max-width: 640px) {
  .sort-wrapper {
    flex-basis: 100%;
  }

  .sort-label {
    display: none;
  }

  .sort-select {
    flex: 1;
  }
}
</style>
