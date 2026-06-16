<template>
  <transition name="mega-menu">
    <div
      v-if="visible"
      class="mega-menu-overlay"
      @mouseleave="handleOverlayLeave"
    >
      <div class="mega-menu-container">
        <div class="col-categories">
          <div class="col-header">Категории</div>
          <div class="categories-list">
            <router-link
              v-for="cat in categories"
              :key="cat.id"
              :to="{ path: '/catalog', query: { category: cat.id } }"
              :class="['category-link', { hover: hoveredCategory === cat.id }]"
              @mouseenter="onCategoryHover(cat)"
              @click="closeMenu"
            >
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ getCategoryProductCount(cat.id) }}</span>
              <svg class="cat-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </router-link>
          </div>
        </div>

        <div class="col-brands" v-if="hoveredCategory">
          <div class="col-header">
            {{ getCategoryName(hoveredCategory) }}
            <router-link
              :to="{ path: '/catalog', query: { category: hoveredCategory } }"
              class="see-all"
              @click="closeMenu"
            >Все товары →</router-link>
          </div>
          <div class="brands-list">
            <router-link
              v-for="brand in visibleBrands"
              :key="brand.id"
              :to="{ path: '/catalog', query: { category: hoveredCategory, brand: brand.name } }"
              :class="['brand-link', { hover: hoveredBrand === brand.id }]"
              @mouseenter="onBrandHover(brand)"
              @click="closeMenu"
            >
              <span class="brand-name">{{ brand.name }}</span>
              <span class="brand-count">{{ brand.productCount }}</span>
            </router-link>
          </div>
          <button
            v-if="hiddenBrandsCount > 0"
            class="show-more-btn"
            @click="showAllBrands = !showAllBrands"
          >
            {{ showAllBrands ? 'Свернуть' : `Ещё ${hiddenBrandsCount} брендов` }}
          </button>
        </div>

        <div class="col-brands col-placeholder" v-else>
          <div class="placeholder-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
            </svg>
            <span>Наведите на категорию</span>
          </div>
        </div>

        <div class="col-products" v-if="hoveredBrand && visibleProducts.length > 0">
          <div class="col-header">
            {{ getBrandName(hoveredBrand) }}
            <router-link
              :to="{ path: '/catalog', query: { category: hoveredCategory, brand: getBrandName(hoveredBrand) } }"
              class="see-all"
              @click="closeMenu"
            >Все товары →</router-link>
          </div>
          <div class="products-grid">
            <router-link
              v-for="product in visibleProducts"
              :key="product.id"
              :to="`/product/${product.id}`"
              class="product-mini"
              @click="closeMenu"
            >
              <div class="product-img">
                <img
                  v-if="product.images?.[0]"
                  :src="getImageUrl(product.images[0])"
                  :alt="product.name"
                  loading="lazy"
                />
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
              </div>
              <div class="product-info">
                <div class="product-name">{{ product.name }}</div>
                <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
              </div>
            </router-link>
          </div>
        </div>

        <div class="col-products col-placeholder" v-else-if="hoveredCategory">
          <div class="placeholder-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            </svg>
            <span>Наведите на бренд</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '@/types'

interface CatalogCategory {
  id: string
  name: string
  subcategoryIds: string[]
}

interface BrandInfo {
  id: string
  name: string
  productCount: number
  productIds: string[]
}

const props = defineProps<{
  visible: boolean
  categories: CatalogCategory[]
  brandsByCategory: Record<string, BrandInfo[]>
  productsById: Record<string, Product>
}>()

const emit = defineEmits<{
  close: []
}>()

const hoveredCategory = ref<string>('')
const hoveredBrand = ref<string>('')
const showAllBrands = ref(false)

const INITIAL_BRANDS = 8

const visibleBrands = computed(() => {
  const all = props.brandsByCategory[hoveredCategory.value] || []
  return showAllBrands.value ? all : all.slice(0, INITIAL_BRANDS)
})

const hiddenBrandsCount = computed(() => {
  const all = props.brandsByCategory[hoveredCategory.value] || []
  return Math.max(0, all.length - INITIAL_BRANDS)
})

const visibleProducts = computed(() => {
  if (!hoveredBrand.value) return []
  const brand = (props.brandsByCategory[hoveredCategory.value] || []).find(b => b.id === hoveredBrand.value)
  if (!brand) return []
  return brand.productIds
    .map(id => props.productsById[id])
    .filter(Boolean)
    .slice(0, 8)
})

const onCategoryHover = (cat: CatalogCategory) => {
  hoveredCategory.value = cat.id
  hoveredBrand.value = ''
  showAllBrands.value = false
}

const onBrandHover = (brand: BrandInfo) => {
  hoveredBrand.value = brand.id
}

const handleOverlayLeave = () => {
  emit('close')
}

const closeMenu = () => {
  emit('close')
}

const getCategoryProductCount = (catId: string): number => {
  const brands = props.brandsByCategory[catId] || []
  return brands.reduce((sum, b) => sum + b.productCount, 0)
}

const getCategoryName = (id: string) => {
  return props.categories.find(c => c.id === id)?.name || ''
}

const getBrandName = (id: string) => {
  for (const brands of Object.values(props.brandsByCategory)) {
    const found = brands.find(b => b.id === id)
    if (found) return found.name
  }
  return ''
}

const getImageUrl = (path: string): string => {
  if (!path) return ''
  return path.startsWith('http') ? path : `http://localhost:5000${path}`
}

const formatPrice = (price: number): string => {
  if (!price && price !== 0) return '0'
  return price.toLocaleString('ru-RU')
}

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        hoveredCategory.value = ''
        hoveredBrand.value = ''
        showAllBrands.value = false
      }, 300)
    }
  }
)
</script>

<style scoped>
.mega-menu-overlay {
  position: fixed;
  top: var(--header-height, 80px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light, #EBEBEB);
  box-shadow: 0 16px 32px -12px rgba(0,0,0,0.12), 0 1px 0 0 rgba(0,0,0,0.04);
  z-index: var(--z-dropdown, 100);
}

.mega-menu-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 280px 240px 1fr;
  height: 520px;
  font-family: var(--font-family-base);
}

.col-categories,
.col-brands,
.col-products {
  padding: 20px 16px;
  overflow-y: auto;
  scrollbar-width: thin;
  font-size: 16px;
  line-height: var(--line-height-normal);
  letter-spacing: var(--letter-spacing-normal);
}

.col-categories {
  background: var(--color-background, #F9FAFB);
  padding-right: 8px;
}

.col-brands {
  border-left: 1px solid var(--color-border-light, #EBEBEB);
}

.col-products {
  border-left: 1px solid var(--color-border-light, #EBEBEB);
}

.col-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-tertiary);
  font-size: 15px;
}

.placeholder-content svg {
  width: 48px;
  height: 48px;
}

.col-header {
  font-size: 13px;
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-text-tertiary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.see-all {
  font-size: 13px;
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  text-decoration: none;
  text-transform: none;
  letter-spacing: var(--letter-spacing-normal);
}
.see-all:hover { opacity: 0.8; }

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.category-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background var(--transition-fast);
  cursor: pointer;
}

.category-link:hover,
.category-link.hover {
  background: var(--color-surface);
}

.cat-name {
  flex: 1;
  font-size: 17px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-normal);
}
.cat-count {
  font-size: 15px;
  color: var(--color-text-tertiary);
  min-width: 28px;
  text-align: right;
  background: var(--color-surface-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}
.cat-chevron {
  width: 14px;
  height: 14px;
  color: var(--color-text-tertiary);
  opacity: 0;
  transition: opacity var(--transition-fast);
  flex-shrink: 0;
}
.category-link:hover .cat-chevron,
.category-link.hover .cat-chevron {
  opacity: 1;
}

.brands-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background var(--transition-fast);
}

.brand-link:hover,
.brand-link.hover {
  background: var(--color-background);
}

.brand-name {
  font-size: 16px;
  font-weight: var(--font-weight-normal);
  color: var(--color-text-primary);
  letter-spacing: var(--letter-spacing-normal);
}

.brand-count {
  font-size: 14px;
  color: var(--color-text-tertiary);
}

.show-more-btn {
  width: 100%;
  padding: 8px 10px;
  margin-top: 4px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  color: var(--color-primary);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast);
}
.show-more-btn:hover {
  background: var(--color-background);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.product-mini {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-background);
  transition: all var(--transition-normal);
}

.product-mini:hover {
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.product-img {
  aspect-ratio: 1;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
}

.product-img svg {
  width: 40px;
  height: 40px;
}

.product-info {
  padding: 10px 12px 12px;
}

.product-name {
  font-size: 15px;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  line-height: var(--line-height-normal);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 6px;
}

.product-price {
  font-size: 17px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.mega-menu-enter-active,
.mega-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mega-menu-enter-from,
.mega-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.col-categories::-webkit-scrollbar,
.col-brands::-webkit-scrollbar,
.col-products::-webkit-scrollbar {
  width: 4px;
}

.col-categories::-webkit-scrollbar-thumb,
.col-brands::-webkit-scrollbar-thumb,
.col-products::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

@media (max-width: 1200px) {
  .mega-menu-container {
    grid-template-columns: 240px 200px 1fr;
    height: 440px;
  }
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
  
@media (max-width: 1024px) {
  .mega-menu-container {
    grid-template-columns: 220px 180px 1fr;
    height: 400px;
  }
}

@media (max-width: 768px) {
  .mega-menu-overlay { display: none; }
}
</style>

