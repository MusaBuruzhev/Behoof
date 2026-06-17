<template>
  <Teleport to="body">
    <transition name="mobile-menu">
      <div v-if="visible" class="mobile-menu-overlay" @click="closeMenu">
        <div class="mobile-menu" @click.stop>
         
          <div class="mobile-menu-header">
            <router-link to="/" class="mobile-logo" @click="closeMenu">
              <svg
                class="logo-icon"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="10" fill="#2563EB" />
                <path
                  d="M12 28V12h8c4.4 0 8 3.6 8 8s-3.6 8-8 8h-8zm4-4h4c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4v8z"
                  fill="white"
                />
              </svg>
              <span class="logo-text">Behoof</span>
            </router-link>
            <button class="close-btn" @click="closeMenu">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mobile-search">
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
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Поиск товаров..."
                @keyup.enter="handleSearch"
              />
            </div>
          </div>

          <nav class="mobile-nav">
            <router-link to="/catalog" class="nav-item" @click="closeMenu">
              <svg
                class="nav-icon"
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
              <span>Каталог</span>
            </router-link>

            <router-link to="/favorites" class="nav-item" @click="closeMenu">
              <svg
                class="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
              <span>Избранное</span>
              <span v-if="favoritesCount > 0" class="nav-badge">{{
                favoritesCount
              }}</span>
            </router-link>

            <router-link to="/comparison" class="nav-item" @click="closeMenu">
              <svg
                class="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
              </svg>
              <span>Сравнение</span>
              <span v-if="compareCount > 0" class="nav-badge">{{
                compareCount
              }}</span>
            </router-link>

            <router-link to="/orders" class="nav-item" @click="closeMenu">
              <svg
                class="nav-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"
                />
              </svg>
              <span>Заказы</span>
            </router-link>
          </nav>

          <div class="mobile-categories">
            <h3 class="categories-title">Категории</h3>
            <div class="categories-list">
              <router-link
                v-for="category in categories"
                :key="category.id"
                :to="`/catalog/${category.id}`"
                class="category-link"
                @click="closeMenu"
              >
                <span class="category-name">{{ category.name }}</span>
                <svg
                  class="chevron-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </router-link>
            </div>
          </div>

          <div class="mobile-profile">
            <template v-if="isAuthenticated">
              <div class="profile-info">
                <div class="profile-avatar">{{ userInitials }}</div>
                <div class="profile-details">
                  <div class="profile-name">{{ userName }}</div>
                  <div class="profile-email">{{ userEmail }}</div>
                </div>
              </div>
              <router-link to="/profile" class="profile-btn" @click="closeMenu">
                Профиль
              </router-link>
              <button class="logout-btn" @click="handleLogout">Выйти</button>
            </template>
            <template v-else>
              <router-link to="/auth/login" class="auth-btn" @click="closeMenu">
                Войти
              </router-link>
              <router-link
                to="/auth/register"
                class="auth-btn auth-btn-secondary"
                @click="closeMenu"
              >
                Регистрация
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore, useFavoritesStore, useComparisonStore } from "@/stores";
import type { Category } from "@/types";

const router = useRouter();
const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();
const comparisonStore = useComparisonStore();

const props = defineProps<{
  visible: boolean;
  categories: Category[];
}>();

const emit = defineEmits<{
  close: [];
}>();

const searchQuery = ref("");

const isAuthenticated = computed(() => authStore.isAuthenticated);
const favoritesCount = computed(() => favoritesStore.favoritesCount);
const compareCount = computed(() => comparisonStore.compareCount);
const userInitials = computed(() => {
  if (!authStore.user) return "";
  return `${authStore.user.firstName[0]}${authStore.user.lastName[0]}`.toUpperCase();
});
const userName = computed(() => authStore.userName);
const userEmail = computed(() => authStore.user?.email || "");

const closeMenu = () => {
  emit("close");
  searchQuery.value = "";
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/catalog?q=${encodeURIComponent(searchQuery.value.trim())}`);
    closeMenu();
  }
};

const handleLogout = () => {
  authStore.logout();
  closeMenu();
  router.push("/");
};
</script>

<style scoped>
.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  padding-top: 0;
}

.mobile-menu {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 360px;
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Header */
.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.mobile-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  text-decoration: none;
  color: inherit;
}

.logo-icon {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-primary);
  transition: background var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-background);
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

/* Поиск */
.mobile-search {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--color-text-tertiary);
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3)
    calc(var(--spacing-3) + 18px + var(--spacing-2));
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Навигация */
.mobile-nav {
  padding: var(--spacing-4) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.nav-item:hover {
  background: var(--color-background);
}

.nav-icon {
  width: 22px;
  height: 22px;
  color: var(--color-text-secondary);
}

.nav-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-inverse);
  background: var(--color-error);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Категории */
.mobile-categories {
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.categories-title {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.category-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.category-link:hover {
  background: var(--color-background);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
}

/* Профиль */
.mobile-profile {
  padding: var(--spacing-6);
  margin-top: auto;
  border-top: 1px solid var(--color-border-light);
}

.profile-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
}

.profile-avatar {
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.profile-details {
  flex: 1;
  overflow: hidden;
}

.profile-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-email {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-btn,
.logout-btn,
.auth-btn {
  display: block;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-decoration: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.profile-btn {
  background: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  margin-bottom: var(--spacing-2);
}

.profile-btn:hover {
  background: var(--color-surface-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.logout-btn {
  background: none;
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.logout-btn:hover {
  background: var(--color-error-light);
}

.auth-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  margin-bottom: var(--spacing-2);
}

.auth-btn:hover {
  background: var(--color-primary-hover);
}

.auth-btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.auth-btn-secondary:hover {
  background: var(--color-surface-secondary);
}

/* Анимации */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all var(--transition-slow);
}

.mobile-menu-enter-from {
  transform: translateX(100%);
}

.mobile-menu-leave-to {
  transform: translateX(100%);
}

.mobile-menu-overlay-enter-active,
.mobile-menu-overlay-leave-active {
  transition: opacity var(--transition-normal);
}

.mobile-menu-overlay-enter-from,
.mobile-menu-overlay-leave-to {
  opacity: 0;
}
</style>
