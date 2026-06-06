<template>
  <div class="stats-card">
    <div class="stats-icon" :style="{ backgroundColor: iconBgColor }">
      <slot name="icon"></slot>
    </div>
    <div class="stats-content">
      <p class="stats-label">{{ label }}</p>
      <h3 class="stats-value">{{ formatValue(value) }}</h3>
      <p v-if="change" class="stats-change" :class="{ positive: change > 0, negative: change < 0 }">
        {{ change > 0 ? '+' : '' }}{{ change }}% от вчера
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: number | string
  change?: number
  color?: 'primary' | 'success' | 'error' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
})

const iconBgColor = {
  primary: 'var(--color-primary-light)',
  success: '#D1FAE5',
  error: '#FEE2E2',
  warning: '#FEF3C7',
}[props.color]

const formatValue = (value: number | string): string => {
  if (typeof value === 'string') return value
  return value.toLocaleString('ru-RU')
}
</script>

<style scoped>
.stats-card {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-6);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
}

.stats-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary);
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stats-icon :deep(svg) {
  width: 28px;
  height: 28px;
  color: var(--color-primary);
}

.stats-content {
  flex: 1;
}

.stats-label {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-value {
  margin: var(--spacing-2) 0 0 0;
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stats-change {
  margin: var(--spacing-1) 0 0 0;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.stats-change.positive {
  color: var(--color-success);
}

.stats-change.negative {
  color: var(--color-error);
}
</style>
