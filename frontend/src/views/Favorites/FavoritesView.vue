<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">Загрузка коллекции...</p>
  </div>
  
  <div v-else-if="products.length === 0" class="empty-state">
    <div class="empty-illustration">
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" stroke="currentColor" stroke-width="2" stroke-dasharray="8 8" opacity="0.3"/>
        <path d="M100 60C100 60 80 80 80 100C80 120 100 140 100 140C100 140 120 120 120 100C120 80 100 60 100 60Z" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="100" cy="90" r="8" fill="currentColor" opacity="0.6"/>
        <path d="M100 110V130" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <path d="M70 100H90" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
        <path d="M130 100H110" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
        <circle cx="140" cy="70" r="6" fill="currentColor" opacity="0.4"/>
        <circle cx="60" cy="130" r="4" fill="currentColor" opacity="0.4"/>
        <circle cx="150" cy="120" r="5" fill="currentColor" opacity="0.3"/>
      </svg>
    </div>
    <h1 class="empty-title">Ваша коллекция пуста</h1>
    <p class="empty-description">
      Сохраняйте интересные товары в избранное, чтобы вернуться к ним позже.
      Здесь будет ваша персональная подборка техники.
    </p>
    <router-link to="/catalog" class="btn btn-primary btn-lg">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
      Перейти в каталог
    </router-link>
  </div>
  
  <div v-else class="favorites-view">
    <div class="container">
      <!-- Header -->
      <header class="favorites-header">
        <div class="header-content">
          <h1 class="favorites-title">
            <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            Избранное
          </h1>
          <p class="favorites-subtitle">
            {{ products.length }} {{ declension(products.length, ['товар сохранён', 'товара сохранено', 'товаров сохранено']) }} для дальнейшего сравнения и покупки
          </p>
        </div>
        <button
          v-if="products.length > 0"
          class="btn btn-outline"
          @click="clearAll"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Очистить всё
        </button>
      </header>
      
      <!-- Quick Stats -->
      <section class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon stat-icon-products">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ products.length }}</span>
            <span class="stat-label">Товаров</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon-price">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatPrice(averagePrice) }}</span>
            <span class="stat-label">Средняя цена</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon-expensive">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16 12l-4-4-4 4M12 16V8"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ formatPrice(maxPrice) }}</span>
            <span class="stat-label">Макс. цена</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon stat-icon-brands">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">{{ uniqueBrands }}</span>
            <span class="stat-label">Брендов</span>
          </div>
        </div>
      </section>
      
      <!-- Collection Insights -->
      <section v-if="insights.length > 0" class="collection-insights">
        <div class="insights-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
          </svg>
          <span class="insights-title">Аналитика коллекции</span>
        </div>
        <div class="insights-grid">
          <div
            v-for="insight in insights"
            :key="insight.id"
            class="insight-card"
          >
            <div class="insight-icon" :class="insight.iconClass">
              <component :is="insight.icon"/>
            </div>
            <div class="insight-content">
              <p class="insight-text">{{ insight.text }}</p>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Controls Panel -->
      <section class="controls-panel">
        <div class="controls-left">
          <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Поиск в коллекции..."
            />
            <button
              v-if="searchQuery"
              class="clear-search"
              @click="searchQuery = ''"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <div class="filters-wrapper">
            <select v-model="sortBy" class="filter-select">
              <option value="newest">Сначала новые</option>
              <option value="price-asc">По цене (возрастание)</option>
              <option value="price-desc">По цене (убывание)</option>
              <option value="name">По названию</option>
            </select>
            
            <select v-model="filterBrand" class="filter-select">
              <option value="">Все бренды</option>
              <option v-for="brand in sortedBrands" :key="brand" :value="brand">
                {{ brand }}
              </option>
            </select>
            
            <button
              v-if="hasActiveFilters"
              class="btn btn-reset"
              @click="resetFilters"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"/>
                <path d="M3 3v9h9"/>
              </svg>
              Сбросить
            </button>
          </div>
        </div>
        
        <div class="controls-right">
          <span class="results-count">
            {{ filteredProducts.length }} из {{ products.length }}
          </span>
        </div>
      </section>
      
      <!-- Products Grid -->
      <section class="products-section">
        <div class="products-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @remove-from-favorites="removeFromFavorites"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue'
import { getFavorites, getProductsByIds } from '@/api'
import { useFavoritesStore } from '@/stores'
import type { Product } from '@/types'
import ProductCard from '@/components/catalog/ProductCard.vue'

const favoritesStore = useFavoritesStore()

const products = ref<Product[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const sortBy = ref('newest')
const filterBrand = ref('')

// Загрузка избранного
const loadFavorites = async () => {
  isLoading.value = true
  try {
    const response = await getFavorites()
    const favoriteIds = response.data.favorites || []
    
    if (favoriteIds.length > 0) {
      const productsResponse = await getProductsByIds(favoriteIds)
      products.value = productsResponse.data.products || []
    } else {
      products.value = []
    }
  } catch (error) {
    console.error('Failed to load favorites:', error)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

// Склонение слов
const declension = (number: number, words: string[]): string => {
  const cases = [2, 0, 1, 1, 1, 2]
  const index = (number % 100 < 4 || number % 100 > 20) ? cases[number % 10] : 2
  return words[index]
}

// Форматирование цены
const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU')
}

// Статистика
const averagePrice = computed(() => {
  if (products.value.length === 0) return 0
  const sum = products.value.reduce((acc, p) => acc + p.price, 0)
  return Math.round(sum / products.value.length)
})

const maxPrice = computed(() => {
  if (products.value.length === 0) return 0
  return Math.max(...products.value.map(p => p.price))
})

const uniqueBrands = computed(() => {
  const brands = new Set(products.value.map(p => p.brand))
  return brands.size
})

const allBrands = computed(() => {
  return [...new Set(products.value.map(p => p.brand))].sort()
})

const sortedBrands = computed(() => {
  return allBrands.value.sort((a, b) => a.localeCompare(b))
})

// Фильтрация и сортировка
const filteredProducts = computed(() => {
  let result = [...products.value]
  
  // Поиск
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.brand.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    )
  }
  
  // Бренд
  if (filterBrand.value) {
    result = result.filter(p => p.brand === filterBrand.value)
  }
  
  // Сортировка
  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'newest':
    default:
      // По умолчанию - порядок добавления (как в API)
      break
  }
  
  return result
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || filterBrand.value || sortBy.value !== 'newest'
})

const resetFilters = () => {
  searchQuery.value = ''
  filterBrand.value = ''
  sortBy.value = 'newest'
}

// Удаление из избранного
const removeFromFavorites = async (productId: string) => {
  try {
    products.value = products.value.filter(p => p.id !== productId)
    favoritesStore.removeFavorite(productId)
  } catch (error) {
    console.error('Failed to remove from favorites:', error)
  }
}

// Очистка всего
const clearAll = async () => {
  if (!confirm('Вы уверены, что хотите очистить всё избранное?')) return
  
  try {
    products.value = []
    favoritesStore.productIds.forEach(id => {
      favoritesStore.removeFavorite(id)
    })
  } catch (error) {
    console.error('Failed to clear favorites:', error)
  }
}

// Collection Insights
const insights = computed(() => {
  const result: Array<{
    id: string
    text: string
    icon: any
    iconClass: string
  }> = []
  
  if (products.value.length === 0) return result
  
  // Бренд
  const brandCounts = products.value.reduce((acc, p) => {
    acc[p.brand] = (acc[p.brand] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]
  if (topBrand && topBrand[1] > 1) {
    result.push({
      id: 'brand',
      text: `Большинство сохранённых товаров — ${topBrand[0]} (${topBrand[1]} шт.)`,
      icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('path', { d: 'M12 2L2 7l10 5 10-5-10-5z' }),
        h('path', { d: 'M2 17l10 5 10-5' }),
        h('path', { d: 'M2 12l10 5 10-5' }),
      ]),
      iconClass: 'insight-icon-brand',
    })
  }
  
  // Средняя цена
  const avg = averagePrice.value
  if (avg > 0) {
    result.push({
      id: 'price',
      text: `Средняя стоимость товаров — ${formatPrice(avg)} ₽`,
      icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('line', { x1: '12', y1: '1', x2: '12', y2: '23' }),
        h('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }),
      ]),
      iconClass: 'insight-icon-price',
    })
  }
  
  // Категории
  const categoryCounts = products.value.reduce((acc, p) => {
    const cat = p.categoryId
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const categoryNames: Record<string, string> = {}
  products.value.forEach(p => {
    if (!categoryNames[p.categoryId]) {
      categoryNames[p.categoryId] = p.categoryId
    }
  })
  
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  if (topCategory && topCategory[1] > 1) {
    result.push({
      id: 'category',
      text: `Основная категория — ${topCategory[1]} товаров`,
      icon: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
        h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
        h('polyline', { points: '9 22 9 12 15 12 15 22' }),
      ]),
      iconClass: 'insight-icon-category',
    })
  }
  
  return result
})

onMounted(() => {
  loadFavorites()
})
</script>

<style scoped>
/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--spacing-4);
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

.loading-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: var(--spacing-8);
  text-align: center;
}

.empty-illustration {
  width: 200px;
  height: 200px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-8);
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
}

.empty-description {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 480px;
  margin-bottom: var(--spacing-8);
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3);
}

.btn-lg svg {
  width: 20px;
  height: 20px;
}

/* Favorites View */
.favorites-view {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--spacing-8) 0;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

/* Header */
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-8);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.favorites-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.title-icon {
  width: 36px;
  height: 36px;
  color: var(--color-primary);
}

.favorites-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

/* Quick Stats */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.stat-icon svg {
  width: 28px;
  height: 28px;
}

.stat-icon-products {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.stat-icon-price {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.stat-icon-expensive {
  background: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

.stat-icon-brands {
  background: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

/* Collection Insights */
.collection-insights {
  margin-bottom: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-6);
}

.insights-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-5);
}

.insights-header svg {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.insights-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.insight-card {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.insight-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.insight-icon svg {
  width: 20px;
  height: 20px;
}

.insight-icon-brand {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.insight-icon-price {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.insight-icon-category {
  background: rgba(168, 85, 247, 0.1);
  color: #A855F7;
}

.insight-content {
  flex: 1;
}

.insight-text {
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
  line-height: var(--line-height-snug);
}

/* Controls Panel */
.controls-panel {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-5);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.controls-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex: 1;
}

.search-wrapper {
  position: relative;
  flex: 1;
  max-width: 320px;
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
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-3) calc(var(--spacing-3) + 18px + var(--spacing-2));
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
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

.clear-search {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
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

.clear-search:hover {
  background: var(--color-surface-secondary);
  color: var(--color-text-primary);
}

.clear-search svg {
  width: 16px;
  height: 16px;
}

.filters-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.filter-select {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-reset:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-reset svg {
  width: 16px;
  height: 16px;
}

.controls-right {
  flex-shrink: 0;
}

.results-count {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Products Grid */
.products-section {
  margin-top: var(--spacing-8);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-6);
}

/* Responsive */
@media (max-width: 1600px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
  }
  
  .controls-panel {
    flex-direction: column;
    align-items: stretch;
  }
  
  .controls-left {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-wrapper {
    max-width: none;
  }
  
  .filters-wrapper {
    flex-wrap: wrap;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-4);
  }
}

@media (max-width: 768px) {
  .favorites-view {
    padding: var(--spacing-6) 0;
  }
  
  .container {
    padding: 0 var(--spacing-4);
  }
  
  .favorites-title {
    font-size: var(--font-size-h2);
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: var(--spacing-4);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-icon svg {
    width: 24px;
    height: 24px;
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3);
  }
}

@media (max-width: 480px) {
  .empty-illustration {
    width: 160px;
    height: 160px;
  }
  
  .btn-lg {
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--font-size-small);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .controls-right {
    text-align: center;
  }
}
</style>
