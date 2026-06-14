<template>
  <header class="admin-header">
    <div class="header-content">
      <div class="header-left">
        <button class="menu-toggle" @click="$emit('toggleSidebar')" v-if="isMobile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div class="breadcrumb" v-if="breadcrumbs.length">
          <template v-for="(crumb, i) in breadcrumbs" :key="i">
            <span v-if="i > 0" class="separator">/</span>
            <router-link v-if="crumb.path" :to="crumb.path" class="crumb-link">{{ crumb.label }}</router-link>
            <span v-else class="crumb-current">{{ crumb.label }}</span>
          </template>
        </div>
      </div>

      <div class="header-right">
        <button class="btn-icon" title="Уведомления" @click="$router.push('/admin/notifications')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        </button>

        <div class="user-menu">
          <div class="user-avatar">{{ userInitials }}</div>
          <span class="user-name">{{ userName }}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores'

defineEmits(['toggleSidebar'])

const route = useRoute()
const authStore = useAuthStore()

const isMobile = ref(window.innerWidth <= 768)

const userName = computed(() => authStore.userName || 'Админ')
const userInitials = computed(() => authStore.userInitials || 'A')
const unreadCount = computed(() => 0)

const breadcrumbs = computed(() => {
  const path = route.path
  const parts: { label: string; path?: string }[] = []

  if (path === '/admin') return [{ label: 'Dashboard' }]

  const map: Record<string, string> = {
    products: 'Товары',
    categories: 'Категории',
    brands: 'Бренды',
    characteristics: 'Характеристики',
    orders: 'Заказы',
    users: 'Пользователи',
    notifications: 'Уведомления',
  }

  const segments = path.split('/').filter(Boolean)
  if (segments[0] === 'admin') {
    let accumulated = '/admin'
    for (let i = 1; i < segments.length; i++) {
      const seg = segments[i]
      accumulated += '/' + seg
      const label = map[seg] || seg
      parts.push({ label, path: i < segments.length - 1 ? accumulated : undefined })
    }
  }

  return parts.length > 0 ? parts : [{ label: map[segments[segments.length - 1]] || 'Админ-панель' }]
})

if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => { isMobile.value = window.innerWidth <= 768 })
}
</script>

<style scoped>
.admin-header {
  height: 52px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 20px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.menu-toggle svg { width: 20px; height: 20px; }

.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.separator { color: var(--color-border-dark, #D1D5DB); }
.crumb-link { color: var(--color-text-tertiary); text-decoration: none; }
.crumb-link:hover { color: var(--color-primary); text-decoration: underline; }
.crumb-current { color: var(--color-text-primary); font-weight: 500; }

.header-right { display: flex; align-items: center; gap: 12px; }

.btn-icon {
  position: relative; display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border: none; background: transparent; border-radius: 8px;
  cursor: pointer; color: var(--color-text-secondary); transition: all 0.15s;
}
.btn-icon:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.btn-icon svg { width: 18px; height: 18px; }

.notification-badge {
  position: absolute; top: 2px; right: 2px;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--color-error); color: white; border-radius: 8px;
  font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center;
}

.user-menu { display: flex; align-items: center; gap: 8px; }
.user-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 8px;
  background: var(--color-primary); color: white; font-size: 12px; font-weight: 600;
}
.user-name { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }

@media (max-width: 768px) {
  .menu-toggle { display: flex; }
  .user-name { display: none; }
  .admin-header { padding: 0 12px; }
}
</style>
