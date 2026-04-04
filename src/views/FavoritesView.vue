<template>
  <div class="favorites-container">
    <div class="favorites-header">
      <h1><img src="/iconHed/heart.svg" alt="Избранное" class="header-icon" /> Избранные товары</h1>
      <p class="favorites-count">{{ favorites.length }} товаров в избранном</p>
      <div class="header-actions">
        <router-link v-if="favorites.length > 1" to="/comparison" class="compare-link">
          <img src="/iconHed/comparison.svg" alt="Сравнить" class="action-icon" />
          Сравнить товары
        </router-link>
        <button v-if="favorites.length > 0" @click="clearAll" class="clear-btn">
          <img src="/profIcon/l6.png" alt="Очистить" class="action-icon" />
          Очистить избранное
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Загрузка избранных товаров...</p>
    </div>

    <div v-else-if="favorites.length === 0" class="empty-state">
      <img src="/iconHed/heart.svg" alt="Избранное" class="empty-icon-img" />
      <h2>Избранное пусто</h2>
      <p>Добавьте товары в избранное, чтобы они появились здесь</p>
      <router-link to="/catalog" class="go-catalog-btn"> Перейти в каталог </router-link>
    </div>

    <div v-else class="favorites-grid">
      <ProductCard
        v-for="product in favorites"
        :key="product.id"
        :product="product"
        :categoryName="getCategoryName(product.categoryId)"
        @removed="removeProduct"
        @open-compare-modal="openCompareModal"
      />
    </div>

    <CompareSelectModal
      :show="compareModalOpen"
      :currentProduct="compareProduct"
      @close="closeCompareModal"
    />
  </div>
</template>

<script>
import ProductCard from '@/components/ProductCard.vue'
import CompareSelectModal from '@/components/CompareSelectModal.vue'
import favoritesAPI from '@/api/favorites.js'
import catalogAPI from '@/api/catalog.js'

export default {
  name: 'FavoritesView',
  components: {
    ProductCard,
    CompareSelectModal,
  },
  data() {
    return {
      favorites: [],
      products: [],
      loading: true,
      categories: [],
      compareModalOpen: false,
      compareProduct: null,
    }
  },
  methods: {
    async loadFavorites() {
      try {
        this.loading = true
        const token = localStorage.getItem('token')
        if (!token) {
          this.$router.push('/login')
          return
        }

        // Получить список избранных товаров
        const favoriteIds = await favoritesAPI.getFavorites()

        // Получить все товары
        const allProducts = await catalogAPI.fetchProducts({ limit: 1000 })

        // Фильтровать только избранные товары
        this.favorites = allProducts.products.filter((p) => favoriteIds.favorites.includes(p.id))

        // Загрузить категории для отображения имён
        const catalog = await catalogAPI.fetchCatalog()
        this.categories = catalog.categories
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error)
      } finally {
        this.loading = false
      }
    },
    getCategoryName(categoryId) {
      const category = this.categories.find((c) => c.id === categoryId)
      return category?.name || 'Категория не найдена'
    },
    removeProduct(productId) {
      this.favorites = this.favorites.filter((p) => p.id !== productId)
    },
    async clearAll() {
      if (!confirm('Вы уверены? Это удалит все товары из избранного')) {
        return
      }

      try {
        const promises = this.favorites.map((product) =>
          favoritesAPI.removeFromFavorites(product.id),
        )
        await Promise.all(promises)
        this.favorites = []
      } catch (error) {
        console.error('Ошибка очистки избранного:', error)
      }
    },
    openCompareModal(product) {
      this.compareProduct = product
      this.compareModalOpen = true
    },
    closeCompareModal() {
      this.compareModalOpen = false
      this.compareProduct = null
    },
  },
  mounted() {
    this.loadFavorites()
  },
}
</script>

<style scoped>
.favorites-container {
  width: 85%;
  margin: 0 auto;
  padding: 40px 20px;
}

.favorites-header {
  text-align: center;
  margin-bottom: 50px;
  animation: fadeIn 0.5s ease-out;
}

.favorites-header h1 {
  font-size: 48px;
  margin: 0 0 15px 0;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.header-icon {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.action-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin-right: 8px;
}

.favorites-count {
  font-size: 18px;
  color: #666;
  margin: 0 0 20px 0;
}

.header-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 10px;
}

.compare-link {
  padding: 12px 24px;
  background-color: #ff4d4d;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.compare-link:hover {
  background-color: #e63939;
  transform: translateY(-2px);
}

.clear-btn {
  padding: 12px 30px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(244, 67, 54, 0.3);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f0f0f0;
  border-top: 4px solid #e91e63;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 20px;
}

.empty-icon {
  font-size: 80px;
  animation: float 3s ease-in-out infinite;
}

.empty-icon-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.empty-state h2 {
  font-size: 32px;
  color: #1a1a1a;
  margin: 0;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.go-catalog-btn {
  padding: 15px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 20px;
  display: inline-block;
}

.go-catalog-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .favorites-header h1 {
    font-size: 32px;
  }

  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
}
</style>
