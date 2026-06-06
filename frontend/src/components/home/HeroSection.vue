<template>
  <section class="hero-section">
    <div class="container hero-container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            Электроника<br />
            <span class="text-primary">будущего</span>
          </h1>
          <p class="hero-description">
            Современный магазин премиальной электроники.
            Только оригинальные товары с гарантией качества.
          </p>
          
          <div class="hero-search">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Найти товар..."
                @keyup.enter="handleSearch"
              />
            </div>
            <button class="btn btn-primary btn-lg" @click="handleSearch">
              Найти
            </button>
          </div>
          
          <router-link to="/catalog" class="btn btn-primary btn-lg">
            Перейти в каталог
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
        
        <div class="hero-visual">
          <div class="hero-products-grid">
            <div
              v-for="product in heroProducts"
              :key="product.id"
              class="hero-product-card"
              :style="{ animationDelay: product.animationDelay }"
            >
              <img
                :src="getProductImage(product)"
                :alt="product.name"
                class="hero-product-image"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCatalog } from '@/api'
import type { Product } from '@/types'

const router = useRouter()
const searchQuery = ref('')
const heroProducts = ref<(Product & { animationDelay: string })[]>([])

const getCatalogData = async () => {
  try {
    const response = await getCatalog()
    const products = Object.values(response.data.products || {}) as Product[]
    
    // Берём первые 6 товаров для hero секции
    heroProducts.value = products
      .slice(0, 6)
      .map((product, index) => ({
        ...product,
        animationDelay: `${index * 0.1}s`,
      }))
  } catch (error) {
    console.error('Failed to load catalog for hero:', error)
  }
}

const getProductImage = (product: Product): string => {
  if (product.images && product.images.length > 0) {
    // Backend возвращает пути вида "/uploads/...", добавляем базовый URL
    return `http://localhost:5000${product.images[0]}`
  }
  // Placeholder если нет изображений
  return 'https://via.placeholder.com/400x400/F5F7FA/2563EB?text=Product'
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/catalog?q=${encodeURIComponent(searchQuery.value.trim())}`)
  }
}

onMounted(() => {
  getCatalogData()
})
</script>

<style scoped>
.hero-section {
  min-height: 85vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  padding: var(--spacing-16) 0;
}

.hero-container {
  max-width: var(--container-max);
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-16);
  align-items: center;
}

.hero-text {
  max-width: 640px;
}

.hero-title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tighter);
  margin-bottom: var(--spacing-6);
  color: var(--color-text-primary);
}

.hero-description {
  font-size: var(--font-size-body-large);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-8);
  max-width: 480px;
}

.hero-search {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.search-input-wrapper {
  flex: 1;
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
  padding: var(--spacing-4) var(--spacing-4) var(--spacing-4) calc(var(--spacing-4) + 20px + var(--spacing-4));
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  background-color: var(--color-surface);
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

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body-large);
}

.btn-icon {
  width: 20px;
  height: 20px;
  margin-left: var(--spacing-2);
}

.hero-visual {
  position: relative;
  height: 600px;
}

.hero-products-grid {
  position: relative;
  width: 100%;
  height: 100%;
}

.hero-product-card {
  position: absolute;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: all var(--transition-slow);
  animation: floatIn 0.8s ease-out backwards;
}

.hero-product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
}

.hero-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.hero-product-card:hover .hero-product-image {
  transform: scale(1.05);
}

/* Позиционирование карточек товаров в сетке */
.hero-product-card:nth-child(1) {
  width: 280px;
  height: 320px;
  top: 0;
  left: 0;
}

.hero-product-card:nth-child(2) {
  width: 240px;
  height: 280px;
  top: 0;
  right: 0;
}

.hero-product-card:nth-child(3) {
  width: 260px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.hero-product-card:nth-child(4) {
  width: 220px;
  height: 260px;
  bottom: 0;
  left: 0;
}

.hero-product-card:nth-child(5) {
  width: 240px;
  height: 280px;
  bottom: 0;
  right: 0;
}

.hero-product-card:nth-child(6) {
  width: 180px;
  height: 220px;
  top: 20%;
  right: 20%;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Адаптивность */
@media (max-width: 1200px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-12);
  }
  
  .hero-text {
    text-align: center;
    max-width: 100%;
  }
  
  .hero-description {
    margin-left: auto;
    margin-right: auto;
  }
  
  .hero-search {
    justify-content: center;
  }
  
  .hero-visual {
    height: 400px;
  }
  
  .hero-product-card:nth-child(1) {
    width: 240px;
    height: 280px;
  }
  
  .hero-product-card:nth-child(3) {
    width: 220px;
    height: 260px;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 70vh;
    padding: var(--spacing-12) 0;
  }
  
  .hero-title {
    font-size: var(--font-size-h2);
  }
  
  .hero-search {
    flex-direction: column;
  }
  
  .search-input-wrapper {
    width: 100%;
  }
  
  .btn-lg {
    width: 100%;
  }
  
  .hero-visual {
    display: none;
  }
}
</style>
