<template>
  <div class="best-products">
    <h2>Лучший выбор</h2>

    <!-- Horizontal category navigation -->
    <div class="category-nav">
      <button
        v-for="category in categories"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="{ active: selectedCategoryId === category.id }"
        class="category-btn"
      >
        <img :src="getCategoryIcon(category.name)" :alt="category.name" class="category-icon" />
        <span class="category-text">{{ category.name }}</span>
      </button>
    </div>

    <!-- Trait tags -->
    <div v-if="selectedCategoryId" class="trait-tags">
      <button
        v-for="trait in availableTraits"
        :key="trait"
        @click="toggleTrait(trait)"
        :class="{ active: selectedTraits.includes(trait) }"
        class="trait-tag"
      >
        {{ trait }}
      </button>
    </div>

    <!-- Products grid -->
    <div v-if="selectedCategoryId && paginatedProducts.length" class="products-grid">
      <button @click="prevPage" :disabled="currentPage === 0" class="nav-arrow left-arrow">‹</button>

      <div class="products-container">
        <div
          v-for="product in paginatedProducts"
          :key="product.id"
          class="product-card"
        >
          <div class="product-header">
            <h3>{{ product.name }}</h3>
            <div class="actions">
              <button class="action-btn favorite">♥</button>
              <button class="action-btn details">⋯</button>
            </div>
          </div>

          <div class="product-content">
            <div class="product-image">
              <!-- Placeholder for image -->
              <div class="image-placeholder">📱</div>
            </div>

            <div class="product-traits">
              <div
                v-for="trait in availableTraits"
                :key="trait"
                class="trait-item"
              >
                <span class="trait-name">{{ trait }}</span>
                <div class="rating-segments">
                  <span
                    v-for="i in 5"
                    :key="i"
                    :class="{ filled: i <= (product.traitRatings[trait] || 0) }"
                    class="segment"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button @click="nextPage" :disabled="currentPage >= totalPages - 1" class="nav-arrow right-arrow">›</button>
    </div>

    <div v-else-if="selectedCategoryId" class="no-products">
      Нет товаров в выбранной категории
    </div>
  </div>
</template>

<script>
import { fetchCatalog } from '@/api/catalog.js';

const CATEGORY_TRAITS = {
  cat1: ['дизайн', 'батарея', 'дисплей', 'камера', 'отзыв', 'портативность'],
  cat2: ['производительность', 'экран', 'автономность', 'вес', 'клавиатура', 'охлаждение'],
  cat3: ['дизайн', 'дисплей', 'производительность', 'камера', 'батарея', 'портативность'],
  cat4: ['дизайн', 'звук', 'комфорт', 'батарея', 'шумоподавление', 'портативность'],
  cat5: ['дизайн', 'дисплей', 'функциональность', 'батарея', 'комфорт', 'портативность'],
  cat6: ['графика', 'производительность', 'цена', 'портативность', 'энергоэффективность'],
  cat7: ['звук', 'батарея', 'портативность', 'дизайн', 'функциональность'],
  cat8: ['дизайн', 'качество', 'функциональность', 'цена', 'совместимость'],
};

export default {
  name: 'BestProducts',

  data() {
    return {
      catalogData: {
        categories: [],
        subcategories: {},
        products: {}
      },
      selectedCategoryId: null,
      selectedTraits: [],
      currentPage: 0,
      itemsPerPage: 4,
    }
  },

  async mounted() {
    try {
      const data = await fetchCatalog();
      this.catalogData = data;
      console.log('BestProducts: loaded catalog data:', data);

      // Default to first category
      if (this.categories.length > 0) {
        this.selectCategory(this.categories[0].id);
      }
    } catch (error) {
      console.error('Ошибка загрузки каталога:', error);
    }
  },

  computed: {
    categories() {
      return this.catalogData.categories || [];
    },

    availableTraits() {
      if (!this.selectedCategoryId) return [];
      return CATEGORY_TRAITS[this.selectedCategoryId] || [];
    },

    filteredProducts() {
      if (!this.selectedCategoryId) return [];

      const category = this.categories.find(cat => cat.id === this.selectedCategoryId);
      if (!category || !category.subcategoryIds) {
        console.log('BestProducts: no category or subcategoryIds', { category });
        return [];
      }

      console.log('BestProducts: category subcategories', category.subcategoryIds);

      // Соберем все товары из всех подкатегорий категории
      let allProducts = [];

      category.subcategoryIds.forEach(subId => {
        const sub = this.catalogData.subcategories[subId];
        if (sub && sub.productIds) {
          console.log('BestProducts: subcategory', subId, 'has products:', sub.productIds);
          sub.productIds.forEach(prodId => {
            const product = this.catalogData.products[prodId];
            if (product) {
              allProducts.push(product);
            }
          });
        }
      });

      console.log('BestProducts: all products found', allProducts.length, allProducts);

      // Убираем дубликаты товаров (если товар есть в нескольких подкатегориях)
      const uniqueProducts = allProducts.filter((product, index, self) =>
        index === self.findIndex(p => p.id === product.id)
      );

      console.log('BestProducts: unique products', uniqueProducts.length);

      let products = uniqueProducts;

      // Filter by selected traits (if any selected, only products with those traits rated)
      if (this.selectedTraits.length > 0) {
        products = products.filter(product => {
          return this.selectedTraits.every(trait => product.traitRatings && product.traitRatings[trait] !== undefined);
        });
        console.log('BestProducts: after trait filter', products.length);
      }

      // Sort by average rating of selected traits (or all if none selected)
      const traitsToSort = this.selectedTraits.length > 0 ? this.selectedTraits : this.availableTraits;
      products.sort((a, b) => {
        const avgA = this.getAverageRating(a, traitsToSort);
        const avgB = this.getAverageRating(b, traitsToSort);
        return avgB - avgA; // descending
      });

      console.log('BestProducts: final products', products.length);

      return products;
    },

    paginatedProducts() {
      const start = this.currentPage * this.itemsPerPage;
      return this.filteredProducts.slice(start, start + this.itemsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    },
  },

  methods: {
    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId;
      this.selectedTraits = [];
      this.currentPage = 0;
    },

    toggleTrait(trait) {
      const index = this.selectedTraits.indexOf(trait);
      if (index > -1) {
        this.selectedTraits.splice(index, 1);
      } else {
        this.selectedTraits.push(trait);
      }
      this.currentPage = 0; // reset page
    },

    getAverageRating(product, traits) {
      if (!product.traitRatings || traits.length === 0) return 0;
      const ratings = traits.map(trait => product.traitRatings[trait] || 0).filter(r => r > 0);
      if (ratings.length === 0) return 0;
      return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    },

    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
      }
    },

    getCategoryIcon(name) {
      const icons = {
        'Смартфоны': '/categoryIcons/smartphones.svg',
        'Ноутбуки': '/categoryIcons/laptops.svg',
        'Планшеты': '/categoryIcons/tablets.svg',
        'Наушники': '/categoryIcons/headphones.svg',
        'Умные часы': '/categoryIcons/smartwatches.svg',
        'Игровые приставки': '/categoryIcons/gaming.svg',
        'Портативные колонки': '/categoryIcons/speakers.svg',
        'Аксессуары': '/categoryIcons/accessories.svg',
      };
      return icons[name] || '/categoryIcons/default.svg';
    },
  },
}
</script>

<style scoped>
@font-face {
  font-family: 'Inter';
  font-weight: 400;
  src: url('../../fonts/Inter_24pt-Regular.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 500;
  src: url('../../fonts/Inter_24pt-Medium.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 600;
  src: url('../../fonts/Inter_24pt-SemiBold.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 700;
  src: url('../../fonts/Inter_24pt-Bold.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 800;
  src: url('../../fonts/Inter_24pt-ExtraBold.ttf');
}

/* Контейнер всего компонента */
.best-products {
    width: 85%;
    /* max-width: 1200px; */
    margin: 0 auto;
    /* padding: 0 2%; */
    box-sizing: border-box;
}


/* Заголовок */
.best-products h2 {
  font-size: clamp(24px, 3vw, 36px);
  font-weight: 700;
  margin-bottom: 3%;
  width: 100%;
}

/* Навигация по категориям */
.category-nav {
display: flex
;
    justify-content: space-around;
    gap: 2%;
    margin-bottom: 3%;
    flex-wrap: wrap;
    width: 100%;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 10%;
  aspect-ratio: 1;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
  padding: 2%;
}

.category-btn:hover,
.category-btn.active {
  border-color: #ff4d4d;
  background: #fff5f5;
}

.category-icon {
  width: 90%;
  margin-bottom: 8%;
  object-fit: contain;
}

.category-text {
  font-size: clamp(10px, 1.2vw, 14px);
  font-weight: 500;
  text-align: center;
  width: 100%;
}

/* Теги характеристик */
.trait-tags {
  display: flex;
    justify-content: flex-start;
    gap: 1%;
    margin-bottom: 5%;
    flex-wrap: wrap;
    width: 100%;
}

.trait-tag {
  padding: 0.8% 2%;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  font-size: clamp(12px, 1.1vw, 17px);
  transition: all 0.3s;
  white-space: nowrap;
}

.trait-tag:hover{
    background: #ff4d4d4f;
  color: white;
  border-color: #ff4d4d;
}

.trait-tag.active {
  background: #ff4d4d;
  color: white;
  border-color: #ff4d4d;
}

/* Сетка товаров */
.products-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3%;
  width: 100%;
}

.nav-arrow {
  width: 5%;
  min-width: 40px;
  max-width: 50px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f2f5f9;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.nav-arrow:hover:not(:disabled) {
  background: #ff4d4d;
  color: white;
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 3%;
  width: 90%;
}

/* Карточка товара */
.product-card {
  width: 100%;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 4%;
  box-sizing: border-box;

}



.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4%;
  width: 100%;
}

.product-header h3 {
  font-size: clamp(14px, 2vw, 30px);
  font-weight: 600;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.actions {
  display: flex;
  gap: 2%;
  flex-shrink: 0;
}

.action-btn {
  width: 15%;
  min-width: 25px;
  max-width: 30px;
  aspect-ratio: 1;
  border: none;
  border-radius: 50%;
  background: #f2f5f9;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #ff4d4d;
  color: white;
}

.product-content {
  display: flex;
  gap: 4%;
  width: 100%;
  align-items: flex-start;
}

.product-image {
  flex-shrink: 0;
  width: 25%;
}

.image-placeholder,
.product-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  object-fit: cover;
}

.image-placeholder {
  background: #f2f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(16px, 4vw, 24px);
}

.product-traits {
  flex: 1;
  width: 70%;
}

.trait-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3%;
  width: 100%;
}

.trait-name {
  font-size: clamp(10px, 1.5vw, 15px);
  color: #666;
  flex: 1;
}

.rating-segments {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  width: 40%;
  max-width: 60px;
}

.segment {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
}

.segment.filled {
  background: #ff4d4d;
}

.no-products {
  text-align: center;
  padding: 5%;
  color: #666;
  width: 100%;
  font-size: clamp(14px, 2vw, 16px);
}

/* Адаптивность для мобильных */
@media (max-width: 768px) {
  .best-products {
    width: 95%;
    padding: 0 2.5%;
  }

  .category-nav {
    gap: 3%;
    margin-bottom: 5%;
  }

  .category-btn {
    width: 18%;
    min-width: 70px;
    padding: 4%;
  }

  .products-grid {
    flex-direction: column;
    gap: 4%;
  }

  .nav-arrow {
    width: 10%;
    order: -1;
  }

  .nav-arrow.left-arrow {
    order: -1;
  }

  .nav-arrow.right-arrow {
    order: 1;
  }

  .products-container {
    width: 100%;
    grid-template-columns: 1fr;
    gap: 4%;
  }

  .product-content {
    flex-direction: column;
    gap: 3%;
  }

  .product-image {
    width: 100%;
    max-width: none;
  }

  .product-traits {
    width: 100%;
  }

  .trait-item {
    margin-bottom: 4%;
  }

  .rating-segments {
    width: 50%;
  }
}

@media (max-width: 480px) {
  .best-products h2 {
    font-size: 24px;
    margin-bottom: 5%;
  }

  .category-btn {
    width: 22%;
    min-width: 60px;
  }

  .trait-tags {
    gap: 2%;
    margin-bottom: 6%;
  }

  .product-card {
    padding: 5%;
  }
}
</style>
