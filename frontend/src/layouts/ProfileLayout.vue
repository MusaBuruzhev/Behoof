<template>
  <div class="profile-layout">
    <aside class="profile-sidebar">
      <div class="sidebar-header">
        <div class="user-avatar-large" v-if="user?.avatar">
          <img :src="user.avatar" :alt="userName" />
        </div>
        <div v-else class="user-avatar-placeholder-large">
          {{ userInitials }}
        </div>
        <div class="user-info-mini">
          <h3 class="user-name">{{ userName }}</h3>
          <p class="user-email">{{ user?.email || '' }}</p>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navItems"
          :key="item.id"
          :to="item.path"
          class="nav-item"
          :class="{ active: isActiveRoute(item.path) }"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" :class="['nav-badge', item.badgeType]">
            {{ item.badge }}
          </span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <button class="logout-btn" @click="handleLogout">
          <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Выйти</span>
        </button>
      </div>
    </aside>
    
    <main class="profile-content">
      <div class="content-container">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore, useNotificationsStore } from '@/stores'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const user = computed(() => authStore.user)

const userName = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName} ${user.value.lastName}`.trim() || user.value.email
})

const userInitials = computed(() => {
  if (!user.value) return ''
  const parts = userName.value.split(' ')
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const unreadCount = computed(() => notificationsStore.unreadCount)

const navItems = computed(() => [
  { id: 'profile', label: 'Профиль', path: '/profile', icon: ProfileIcon, badge: null, badgeType: null },
  { id: 'orders', label: 'Заказы', path: '/profile/orders', icon: OrdersIcon, badge: null, badgeType: null },
  { id: 'notifications', label: 'Уведомления', path: '/profile/notifications', icon: NotificationsIcon, badge: unreadCount.value || null, badgeType: 'notification' },
  { id: 'security', label: 'Безопасность', path: '/profile/security', icon: SecurityIcon, badge: null, badgeType: null },
])

const isActiveRoute = (path: string) => {
  if (path === '/profile') {
    return route.path === '/profile'
  }
  return route.path.startsWith(path)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// Icons
const ProfileIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
    h('circle', { cx: '12', cy: '7', r: '4' })
  ])
}

const OrdersIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414' })
  ])
}

const NotificationsIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' }),
    h('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
  ])
}

const SecurityIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: '12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
    h('circle', { cx: '12', cy: '12', r: '3' })
  ])
}
</script>

<style scoped>
.profile-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

/* Sidebar */
.profile-sidebar {
  width: 300px;
  min-width: 300px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: var(--spacing-8);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
}

.user-avatar-large,
.user-avatar-placeholder-large {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder-large {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
}

.user-info-mini {
  text-align: center;
}

.user-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.user-email {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-5);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  position: relative;
}

.nav-item:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.nav-item.active {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
}

.nav-badge.notification {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

/* Footer */
.sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-4);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background: var(--color-error-light);
  border-color: var(--color-error);
  color: var(--color-error);
}

.logout-icon {
  width: 18px;
  height: 18px;
}

/* Content */
.profile-content {
  flex: 1;
  overflow-y: auto;
  min-width: 0;
}

.content-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-12) var(--spacing-10);
}

/* Responsive */
@media (max-width: 1024px) {
  .profile-layout {
    flex-direction: column;
  }
  
  .profile-sidebar {
    width: 100%;
    position: static;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border-light);
  }
  
  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding: var(--spacing-4) var(--spacing-6);
  }
  
  .nav-item {
    white-space: nowrap;
  }
  
  .nav-item.active::before {
    left: 50%;
    top: auto;
    bottom: 0;
    transform: translateX(-50%);
    width: 60%;
    height: 3px;
  }
  
  .sidebar-footer {
    display: none;
  }
  
  .content-container {
    padding: var(--spacing-6) var(--spacing-4);
  }
}
</style>
