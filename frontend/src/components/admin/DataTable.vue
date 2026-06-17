<template>
  <div class="data-table-wrapper">
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка...</p>
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
          >
            {{ column.label }}
          </th>
          <th v-if="hasActions" style="width: 120px">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!items || items.length === 0">
          <td
            :colspan="columns.length + (hasActions ? 1 : 0)"
            class="empty-state"
          >
            Нет данных
          </td>
        </tr>
        <tr v-for="(item, index) in items || []" :key="getRowKey(item, index)">
          <td
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
          >
            <slot
              :name="`cell-${column.key}`"
              :item="item"
              :value="getNestedValue(item, column.key)"
            >
              {{ formatCell(getNestedValue(item, column.key), column) }}
            </slot>
          </td>
          <td v-if="hasActions" class="actions-cell">
            <slot name="actions" :item="item"></slot>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showPagination" class="pagination">
      <button
        class="btn-pagination"
        @click="prevPage"
        :disabled="currentPage === 1"
      >
        ← Назад
      </button>

      <div class="pagination-info">
        Страница {{ currentPage }} из {{ totalPages }}
      </div>

      <button
        class="btn-pagination"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >
        Вперед →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

export interface Column {
  key: string;
  label: string;
  width?: string;
  type?: "text" | "number" | "date" | "boolean";
}

interface Props {
  columns: Column[];
  items: any[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  rowKey?: string | ((item: any, index: number) => string | number);
  hasActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  rowKey: "id",
  hasActions: false,
});

const emit = defineEmits<{
  pageChange: [page: number];
}>();

const showPagination = computed(() => props.totalPages > 1);

const getRowKey = (item: any, index: number): string | number => {
  if (typeof props.rowKey === "function") {
    return props.rowKey(item, index);
  }
  return item[props.rowKey] || index;
};

const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
};

const formatCell = (value: any, column: Column): string => {
  if (value === null || value === undefined) return "—";

  switch (column.type) {
    case "date":
      return new Date(value).toLocaleDateString("ru-RU");
    case "boolean":
      return value ? "Да" : "Нет";
    case "number":
      return Number(value).toLocaleString("ru-RU");
    default:
      return String(value);
  }
};

const prevPage = () => {
  if (props.currentPage > 1) {
    emit("pageChange", props.currentPage - 1);
  }
};

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit("pageChange", props.currentPage + 1);
  }
};
</script>

<style scoped>
.data-table-wrapper {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  gap: var(--spacing-4);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background-color: var(--color-background);
  border-bottom: 2px solid var(--color-border);
}

.data-table th {
  padding: var(--spacing-4);
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition-fast);
}

.data-table tbody tr:hover {
  background-color: var(--color-background);
}

.data-table td {
  padding: var(--spacing-4);
  color: var(--color-text-primary);
  font-size: 14px;
}

.empty-state {
  text-align: center;
  color: var(--color-text-secondary);
  padding: var(--spacing-12) !important;
}

.actions-cell {
  display: flex;
  gap: var(--spacing-2);
  justify-content: flex-end;
  padding: var(--spacing-3);
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-background);
}

.pagination-info {
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 150px;
  text-align: center;
}

.btn-pagination {
  padding: var(--spacing-2) var(--spacing-4);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.btn-pagination:hover:not(:disabled) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .data-table th,
  .data-table td {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 13px;
  }

  .pagination {
    flex-wrap: wrap;
    gap: var(--spacing-2);
    padding: var(--spacing-4);
  }

  .btn-pagination {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 12px;
  }
}
</style>
