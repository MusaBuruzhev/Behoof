<template>
  <div class="catalog-page">
    <div class="container">
      <h1>{{ modelName ? `${modelName} - Каталог товаров` : 'Каталог товаров' }}</h1>

      <!-- Filters Sidebar -->
      <div class="catalog-content">
        <aside class="filters-sidebar">
          <div class="filter-group">
            <h3>Цена</h3>
            <div class="price-inputs">
              <input
                v-model.number="filters.priceMin"
                type="number"
                placeholder="От"
                min="0"
                @input="applyFilters"
              >
              <input
                v-model.number="filters.priceMax"
                type="number"
                placeholder="До"
                min="0"
                @input="applyFilters"
              >
            </div>
          </div>

          <div class="filter-group">
            <h3>Бренд</h3>
            <div class="brands-filter">
              <div v-for="brand in availableBrands" :key="brand" class="brand-item">
                <input
                  :id="brand"
                  type="checkbox"
                  :value="brand"
                  v-model="filters.selectedBrands"
                  @change="applyFilters"
                >
                <label :for="brand">{{ brand }}</label>
              </div>
            </div>
          </div>

          <div class="filter-group">
            <h3>Сортировка</h3>
            <select v-model="filters.sortBy" @change="applyFilters">
              <option value="price-asc">Цена: по возрастанию</option>
              <option value="price-desc">Цена: по убыванию</option>
              <option value="name-asc">Название: А-Я</option>
              <option value="name-desc">Название: Я-А</option>
              <option value="date-desc">Сначала новые</option>
            </select>
          </div>

          <button @click="clearFilters" class="clear-filters-btn">Сбросить фильтры</button>
        </aside>

        <!-- Products Grid -->
        <main class="products-section">
          <div class="search-bar">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск товаров..."
              @input="applyFilters"
            >
            <span class="results-count">Найдено: {{ filteredProducts.length }}</span>
          </div>

          <div v-if="loading" class="loading">Загрузка товаров...</div>
          <div v-else-if="filteredProducts.length === 0" class="no-products">
            Товары не найдены
          </div>
          <div v-else class="products-grid">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product.id"
              :product="product"
              :categoryName="categoryName"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="page-btn"
            >
              ‹
            </button>
            <span>{{ currentPage }} из {{ totalPages }}</span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="page-btn"
            >
              ›
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCatalog } from '@/api/catalog.js';
import ProductCard from '@/components/ProductCard.vue';

const ITEMS_PER_PAGE = 12;

export default {
  name: 'CatalogView',
  components: {
    ProductCard
  },
  data() {
    return {
      catalogData: {
        categories: [],
        subcategories: {},
        models: {},
        products: {}
      },
      modelId: null,
      modelName: '',
      categoryName: '',
      loading: false,
      searchQuery: '',
      currentPage: 1,
      filters: {
        priceMin: null,
        priceMax: null,
        selectedBrands: [],
        sortBy: 'price-asc'
      },
      allProducts: [],
      filteredProducts: []
    };
  },
  computed: {
    availableBrands() {
      const brands = [...new Set(this.allProducts.map(p => p.brand))];
      return brands.filter(b => b);
    },
    categoryId() {
      if (!this.modelId || !this.catalogData.models[this.modelId]) return '';
      const model = this.catalogData.models[this.modelId];
      const subcategory = this.catalogData.subcategories[model.subcategoryId];
      if (!subcategory) return '';
      return subcategory.categoryId;
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      return this.filteredProducts.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / ITEMS_PER_PAGE);
    }
  },
  watch: {
    '$route.query.modelId': {
      immediate: true,
      handler(newModelId) {
        this.modelId = newModelId;
        this.loadData();
      }
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const data = await fetchCatalog();
        this.catalogData = data;

        if (this.modelId && this.catalogData.models[this.modelId]) {
          const model = this.catalogData.models[this.modelId];
          this.modelName = model.name;

          const subcategory = this.catalogData.subcategories[model.subcategoryId];
          if (subcategory) {
            const category = this.catalogData.categories.find(cat => cat.id === subcategory.categoryId);
            this.categoryName = category ? category.name : '';
          }

          // Get products for this model
          this.allProducts = model.productIds
            .map(id => this.catalogData.products[id])
            .filter(p => p);
        } else {
          // Show all products if no model selected
          this.allProducts = Object.values(this.catalogData.products);
        }

        this.applyFilters();
      } catch (error) {
        console.error('Ошибка загрузки каталога:', error);
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      let filtered = [...this.allProducts];

      // Search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }

      // Price filter
      if (this.filters.priceMin !== null && this.filters.priceMin !== '') {
        filtered = filtered.filter(product => product.price >= this.filters.priceMin);
      }
      if (this.filters.priceMax !== null && this.filters.priceMax !== '') {
        filtered = filtered.filter(product => product.price <= this.filters.priceMax);
      }

      // Brands filter
      if (this.filters.selectedBrands.length > 0) {
        filtered = filtered.filter(product =>
          this.filters.selectedBrands.includes(product.brand)
        );
      }

      // Sort
      filtered.sort((a, b) => {
        switch (this.filters.sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'name-asc':
            return a.name.localeCompare(b.name);
          case 'name-desc':
            return b.name.localeCompare(a.name);
          case 'date-desc':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default:
            return 0;
        }
      });

      this.filteredProducts = filtered;
      this.currentPage = 1; // Reset to first page
    },
    clearFilters() {
      this.filters = {
        priceMin: null,
        priceMax: null,
        selectedBrands: [],
        sortBy: 'price-asc'
      };
      this.searchQuery = '';
      this.applyFilters();
    }
  }
};
</script>

<style scoped>
.catalog-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px 0;
}

.container {
  width: 85%;
  margin: 0 auto;
  padding: 0 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #263141;
  font-size: 32px;
}

.catalog-content {
  display: flex;
  gap: 30px;
}

.filters-sidebar {
  width: 300px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.filter-group {
  margin-bottom: 25px;
}

.filter-group h3 {
  margin-bottom: 15px;
  color: #263141;
  font-size: 18px;
}

.price-inputs {
  display: flex;
  gap: 10px;
}

.price-inputs input {
  width: 50%;
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.characteristics-filter {
  max-height: 200px;
  overflow-y: auto;
}

.char-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.char-item input {
  margin-right: 8px;
}

.char-item label {
  font-size: 14px;
  cursor: pointer;
}

.filters-sidebar select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.clear-filters-btn {
  width: 100%;
  padding: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.clear-filters-btn:hover {
  background: #c82333;
}

.products-section {
  flex: 1;
}

.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.results-count {
  margin-left: 20px;
  color: #666;
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.loading, .no-products {
  text-align: center;
  padding: 50px;
  font-size: 18px;
  color: #666;
}

.no-products {
  color: #dc3545;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-btn {
  padding: 10px 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #0056b3;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .catalog-content {
    flex-direction: column;
  }

  .filters-sidebar {
    width: 100%;
    position: static;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }

  h1 {
    font-size: 24px;
  }
}
</style>
