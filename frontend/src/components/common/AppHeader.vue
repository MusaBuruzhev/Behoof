<template>
  <header :class="['app-header', { 'header-scrolled': isScrolled }]">
    <div class="container header-container">
      <div class="header-left">
        <router-link to="/" class="logo">
          <svg class="logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="10" fill="#2563EB"/>
            <path d="M12 28V12h8c4.4 0 8 3.6 8 8s-3.6 8-8 8h-8zm4-4h4c2.2 0 4-1.8 4-4s-1.8-4-4-4h-4v8z" fill="white"/>
          </svg>
          <span class="logo-text">Behoof</span>
        </router-link>
        
        <button
          class="catalog-btn"
          @click="toggleMegaMenu"
          @mouseenter="showMegaMenu = true"
        >
          <svg class="catalog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          <span>Каталог</span>
          <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      
      <div class="header-center">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
          <button
            v-if="searchQuery"
            class="search-clear"
            @click="clearSearch"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="header-right">
        <router-link to="/cart" class="action-btn" title="Корзина">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span v-if="cartCount > 0" class="action-badge">{{ cartCount }}</span>
        </router-link>
        
        <router-link to="/comparison" class="action-btn" title="Сравнение">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
          </svg>
          <span v-if="compareCount > 0" class="action-badge">{{ compareCount }}</span>
        </router-link>
        
        <router-link to="/favorites" class="action-btn" title="Избранное">
          <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span v-if="favoritesCount > 0" class="action-badge">{{ favoritesCount }}</span>
        </router-link>
        
        <div class="notifications-wrapper">
          <button class="action-btn" title="Уведомления" @click="toggleNotifications">
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span v-if="unreadCount > 0" class="action-badge action-badge-unread">{{ unreadCount }}</span>
          </button>
        </div>
        
        <router-link v-if="!isAuthenticated" to="/auth/login" class="profile-btn">
          <svg class="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Войти</span>
        </router-link>
        
        <div v-else class="profile-dropdown">
          <button class="profile-btn" @click="toggleProfileMenu">
            <div class="profile-avatar">
              {{ userInitials }}
            </div>
          </button>
          
          <div v-if="showProfileMenu" class="profile-menu">
            <router-link to="/profile" class="profile-menu-item">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Профиль
            </router-link>
            <router-link to="/orders" class="profile-menu-item">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
              </svg>
              Заказы
            </router-link>
            <hr class="menu-divider" />
            <button class="profile-menu-item logout-btn" @click="handleLogout">
              <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Выйти
            </button>
          </div>
        </div>
        
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </div>
    
    <MegaMenu
      :visible="showMegaMenu"
      :categories="categories"
      :brandsByCategory="brandsByCategory"
      :productsById="productsById"
      @close="showMegaMenu = false"
    />
    
    <MobileMenu
      :visible="showMobileMenu"
      :categories="categories"
      @close="showMobileMenu = false"
    />
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCatalog } from '@/api'
import { useAuthStore, useFavoritesStore, useNotificationsStore, useComparisonStore, useCartStore } from '@/stores'
import type { Category, Product } from '@/types'

import MegaMenu from './MegaMenu.vue'
import MobileMenu from './MobileMenu.vue'

interface BrandInfo {
  id: string
  name: string
  productCount: number
  productIds: string[]
}

const router = useRouter()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const notificationsStore = useNotificationsStore()
const comparisonStore = useComparisonStore()
const cartStore = useCartStore()

const isScrolled = ref(false)
const searchQuery = ref('')
const showMegaMenu = ref(false)
const showMobileMenu = ref(false)
const showProfileMenu = ref(false)
const categories = ref<Category[]>([])
const brandsByCategory = ref<Record<string, BrandInfo[]>>({})
const productsById = ref<Record<string, Product>>({})

const isAuthenticated = computed(() => authStore.isAuthenticated)
const favoritesCount = computed(() => favoritesStore.favoritesCount)
const cartCount = computed(() => cartStore.cartItemsCount)
const unreadCount = computed(() => notificationsStore.unreadCount)
const compareCount = computed(() => comparisonStore.compareCount)
const userInitials = computed(() => {
  if (!authStore.user) return ''
  const name = `${authStore.user.firstName} ${authStore.user.lastName}`.trim() || authStore.user.email
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const loadCatalogData = async () => {
  try {
    const response = await getCatalog()
    const data = response.data

    categories.value = data.categories || []

    // Строим brandsByCategory: categoryId → список брендов (уникальные по имени)
    const brandsMap: Record<string, BrandInfo[]> = {}
    const products = data.products || {}

    productsById.value = products

    // Собираем товары по категориям и брендам
    for (const product of Object.values(products) as Product[]) {
      const catId = product.categoryId
      if (!catId) continue

      if (!brandsMap[catId]) brandsMap[catId] = []

      const brandName = product.brand || 'Другие'
      let brand = brandsMap[catId].find(b => b.name === brandName)

      if (!brand) {
        brand = {
          id: `${catId}_${brandName}`,
          name: brandName,
          productCount: 0,
          productIds: [],
        }
        brandsMap[catId].push(brand)
      }

      brand.productCount++
      brand.productIds.push(product.id)
    }

    // Сортируем бренды по количеству товаров
    for (const catId of Object.keys(brandsMap)) {
      brandsMap[catId].sort((a, b) => b.productCount - a.productCount)
    }

    brandsByCategory.value = brandsMap
  } catch (error) {
    console.error('Failed to load catalog:', error)
  }
}

const toggleMegaMenu = () => {
  showMegaMenu.value = !showMegaMenu.value
}

const toggleNotifications = () => {
  // TODO: Open notifications dropdown
  router.push('/notifications')
}

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/catalog?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
  showProfileMenu.value = false
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.profile-dropdown')) {
    showProfileMenu.value = false
  }
  if (!target.closest('.app-header')) {
    showMegaMenu.value = false
  }
}

onMounted(() => {
  loadCatalogData()
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--color-surface);
  transition: all var(--transition-fast);
}

.header-scrolled {
  box-shadow: var(--shadow-md);
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.9);
}

.header-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-6);
    height: 80px;
    max-width: var(--container-max);
    justify-content: space-between;
}

/* Левая часть */
.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  text-decoration: none;
  color: inherit;
}

.logo-icon {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-tight);
}

.catalog-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-5);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.catalog-btn:hover {
  background: var(--color-surface-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.catalog-icon {
  width: 20px;
  height: 20px;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-fast);
}

.catalog-btn:hover .chevron-icon {
  transform: rotate(180deg);
}

/* Центр: Поиск */
.header-center {
  flex: 1;
  max-width: 600px;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) calc(var(--spacing-4) + 20px + var(--spacing-2));
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-background);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--color-surface);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-input::placeholder {
  color: var(--color-text-tertiary);
}

.search-clear {
  position: absolute;
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.search-clear:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

.search-clear svg {
  width: 16px;
  height: 16px;
}

/* Правая часть */
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-primary);
  text-decoration: none;
}

.action-btn:hover {
  background: var(--color-background);
  color: var(--color-primary);
}

.action-icon {
  width: 22px;
  height: 22px;
}

.action-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-inverse);
  background: var(--color-error);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-badge-unread {
  background: var(--color-primary);
}

.profile-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.profile-btn:hover {
  background: var(--color-surface-secondary);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.profile-icon {
  width: 20px;
  height: 20px;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.profile-dropdown {
  position: relative;
}

.profile-menu {
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  width: 220px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dropdown);
  padding: var(--spacing-2);
  z-index: var(--z-dropdown);
}

.profile-menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.profile-menu-item:hover {
  background: var(--color-background);
}

.logout-btn {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-divider {
  margin: var(--spacing-2) 0;
  border: none;
  border-top: 1px solid var(--color-border-light);
}

.menu-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
}

.mobile-menu-btn {
  display: none;
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
}

.mobile-menu-btn svg {
  width: 24px;
  height: 24px;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .header-container {
    gap: var(--spacing-4);
  }
  
  .header-center {
    max-width: 400px;
  }
}

@media (max-width: 768px) {
  .header-container {
    height: 70px;
  }
  
  .header-center {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .logo-text {
    display: none;
  }
  
  .catalog-btn {
    display: none;
  }
  
  .profile-btn span {
    display: none;
  }
}

@media (max-width: 480px) {
  .header-left {
    gap: var(--spacing-3);
  }
  
  .catalog-btn {
    padding: var(--spacing-2) var(--spacing-3);
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
