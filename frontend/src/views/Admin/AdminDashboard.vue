<template>
  <div class="dashboard">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка статистики...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3 class="error-title">{{ error }}</h3>
      <button class="btn btn-primary" @click="loadStats">Попробовать снова</button>
    </div>

     <!-- Debug & Stats -->
    <div v-else>
      <!-- Debug -->
      <div class="debug" v-if="false"> <!-- Убрать v-if="false" для отладки -->
        <pre>{{ stats }}</pre>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <StatsCard label="Товары" :value="stats.totalProducts" color="primary">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Пользователи" :value="stats.totalUsers" color="success">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Заказы" :value="stats.totalOrders" color="warning">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Бренды" :value="stats.totalBrands" color="primary">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </template>
        </StatsCard>

        <StatsCard label="Категории" :value="stats.totalCategories" color="error">
          <template #icon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7v10a8 8 0 0 0 8 8 8 8 0 0 0 8-8V7l-10-5z"></path>
            </svg>
          </template>
        </StatsCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useAdminStore } from '@/stores'
import StatsCard from '@/components/admin/StatsCard.vue'

const adminStore = useAdminStore()
const isLoading = ref(true)
const error = ref<string | null>(null)

const stats = computed(() => adminStore.stats)

const loadStats = async () => {
  isLoading.value = true
  error.value = null
  console.log('Loading stats...')
  try {
    await adminStore.fetchStats()
    console.log('Stats loaded:', stats.value)
  } catch (err) {
    error.value = 'Не удалось загрузить статистику'
    console.error('Failed to fetch stats:', err)
  } finally {
    isLoading.value = false
    console.log('Loading finished, isLoading:', isLoading.value)
  }
}

onMounted(() => {
  console.log('AdminDashboard mounted')
  loadStats()
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  min-height: 400px;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: var(--spacing-4);
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.error-icon {
  width: 64px;
  height: 64px;
  color: var(--color-error);
  margin-bottom: var(--spacing-4);
}

.error-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-4) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-6);
}

.debug {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  font-size: 12px;
  overflow: auto;
  max-height: 200px;
}

.debug pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
