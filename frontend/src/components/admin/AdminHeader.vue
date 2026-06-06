<template>
  <header class="admin-header">
    <div class="header-content">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <div class="header-actions">
        <button class="btn-icon" @click="toggleNotifications" title="Уведомления">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </button>

        <div class="user-profile">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">{{ userInitials }}</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'

const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'products': 'Управление товарами',
    'categories': 'Управление категориями',
    'orders': 'Управление заказами',
    'users': 'Управление пользователями',
    'notifications': 'Уведомления',
  }

  const path = route.path.split('/').pop() || 'dashboard'
  return titles[path] || 'Админ-панель'
})

const userName = computed(() => authStore.userName)
const userInitials = computed(() => authStore.userInitials)
const unreadCount = computed(() => 0) // TODO: получить из store

const toggleNotifications = () => {
  // TODO: открыть панель уведомлений
}
</script>

<style scoped>
.admin-header {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: var(--spacing-4) var(--spacing-6);
  box-shadow: var(--shadow-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.btn-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-icon:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: var(--color-error);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 768px) {
  .admin-header {
    padding: var(--spacing-3) var(--spacing-4);
  }

  .header-content {
    gap: var(--spacing-4);
  }

  .page-title {
    font-size: 18px;
  }

  .header-actions {
    gap: var(--spacing-3);
  }

  .user-name {
    display: none;
  }
}
</style>
