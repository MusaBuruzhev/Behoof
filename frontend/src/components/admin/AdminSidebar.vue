<template>
  <aside class="admin-sidebar">
    <div class="sidebar-header">
      <h2 class="sidebar-title">Админ-панель</h2>
    </div>

    <nav class="sidebar-nav">
      <router-link
        to="/admin/dashboard"
        class="nav-link"
        :class="{ active: isActive('/admin/dashboard') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Dashboard</span>
      </router-link>

      <router-link
        to="/admin/products"
        class="nav-link"
        :class="{ active: isActive('/admin/products') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
          <line x1="8" y1="6" x2="16" y2="6"></line>
          <line x1="8" y1="10" x2="16" y2="10"></line>
          <line x1="8" y1="14" x2="16" y2="14"></line>
          <line x1="8" y1="18" x2="16" y2="18"></line>
        </svg>
        <span>Товары</span>
      </router-link>

      <router-link
        to="/admin/categories"
        class="nav-link"
        :class="{ active: isActive('/admin/categories') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7v10a8 8 0 0 0 8 8 8 8 0 0 0 8-8V7l-10-5z"></path>
        </svg>
        <span>Категории</span>
      </router-link>

      <router-link
        to="/admin/orders"
        class="nav-link"
        :class="{ active: isActive('/admin/orders') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <span>Заказы</span>
      </router-link>

      <router-link
        to="/admin/users"
        class="nav-link"
        :class="{ active: isActive('/admin/users') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>Пользователи</span>
      </router-link>

      <router-link
        to="/admin/brands"
        class="nav-link"
        :class="{ active: isActive('/admin/brands') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Бренды</span>
      </router-link>

      <router-link
        to="/admin/notifications"
        class="nav-link"
        :class="{ active: isActive('/admin/notifications') }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span>Уведомления</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button class="btn-logout" @click="logout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Выход
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'

const router = useRouter()
const authStore = useAuthStore()

const isActive = (path: string) => {
  return router.currentRoute.value.path.startsWith(path)
}

const logout = () => {
  authStore.logout()
  router.push('/auth/login')
}
</script>

<style scoped>
.admin-sidebar {
  width: 250px;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-sm);
}

.sidebar-header {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4) 0;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-normal);
  cursor: pointer;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.nav-link.active {
  background-color: var(--color-background);
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: 500;
}

.nav-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-footer {
  padding: var(--spacing-4);
  border-top: 1px solid var(--color-border);
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-error);
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 14px;
  font-weight: 500;
}

.btn-logout:hover {
  background-color: var(--color-background);
  border-color: var(--color-error);
}

.btn-logout svg {
  width: 18px;
  height: 18px;
}

/* Адаптивность */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 60px;
  }

  .sidebar-header {
    padding: var(--spacing-3);
  }

  .sidebar-title {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding: var(--spacing-4);
  }

  .nav-link span {
    display: none;
  }

  .sidebar-footer {
    padding: var(--spacing-2);
  }

  .btn-logout {
    padding: var(--spacing-3);
    font-size: 0;
  }

  .btn-logout svg {
    margin: 0;
  }
}
</style>
