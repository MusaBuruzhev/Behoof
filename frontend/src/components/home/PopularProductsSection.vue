<template>
  <section class="products-section section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title h2">Популярные товары</h2>
        <p class="section-description">
          Выберите из нашей подборки самых востребованных товаров
        </p>
      </div>
      
      <div v-if="loading" class="products-loading">
        <div class="loading-spinner"></div>
        <p>Загрузка товаров...</p>
      </div>
      
      <div v-else-if="error" class="products-error">
        <p>Не удалось загрузить товары</p>
        <button class="btn btn-secondary" @click="loadProducts">
          Попробовать снова
        </button>
      </div>
      
      <div v-else class="products-grid">
        <ProductCardSimple
          v-for="product in products"
          :key="product.id"
          :product="product"
        />
      </div>
      
      <div class="section-footer">
        <router-link to="/catalog" class="btn btn-secondary btn-lg">
          Смотреть весь каталог
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProducts } from '@/api'
import type { Product } from '@/types'
import ProductCardSimple from '@/components/home/ProductCardSimple.vue'

const products = ref<Product[]>([])
const loading = ref(false)
const error = ref(false)

const loadProducts = async () => {
  loading.value = true
  error.value = false
  
  try {
    const response = await getProducts({ limit: 8 })
    products.value = response.data.products || []
  } catch (err) {
    console.error('Failed to load popular products:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.products-section {
  background-color: var(--color-background);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-16);
}

.section-title {
  margin-bottom: var(--spacing-4);
}

.section-description {
  font-size: var(--font-size-body-large);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.products-loading,
.products-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-24);
  text-align: center;
  color: var(--color-text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-12);
}

.section-footer {
  text-align: center;
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

/* Адаптивность */
@media (max-width: 1440px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
}
</style>
