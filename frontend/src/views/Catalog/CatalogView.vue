<template>
  <div class="catalog-view">
    <div class="container">
      <CatalogHeader
        :current-category="currentCategory"
        :current-subcategory="currentSubcategory"
        :total-products="productsResponse.total"
      />

      <CatalogControls
        v-model:search="searchQuery"
        v-model:sort="sortOption"
        v-model:view="viewMode"
        :total-products="productsResponse.total"
        @search="handleSearch"
        @sort="handleSort"
      />

      <div class="catalog-content">
        <CatalogFilters
          v-model:price-range="priceRange"
          v-model:selected-brands="selectedBrands"
          v-model:selected-category="selectedCategory"
          v-model:selected-subcategory="selectedSubcategory"
          :categories="categories"
          :brands="availableBrands"
          @apply-filters="applyFilters"
          @reset-filters="resetFilters"
        />

        <div class="catalog-products">
          <div v-if="loading" class="products-loading">
            <div class="loading-spinner"></div>
            <p>Загрузка товаров...</p>
          </div>

          <div
            v-else-if="productsResponse.products.length === 0"
            class="products-empty"
          >
            <svg
              class="empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4"
              />
            </svg>
            <h3>Товары не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтры</p>
            <button class="btn btn-secondary" @click="resetFilters">
              Сбросить фильтры
            </button>
          </div>

          <div
            v-else
            class="products-grid"
            :class="`products-grid--${viewMode}`"
          >
            <ProductCard
              v-for="product in productsResponse.products"
              :key="product.id"
              :product="product"
            />
          </div>

          <CatalogPagination
            v-if="productsResponse.total > 0"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-products="productsResponse.total"
            @change-page="changePage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { getCatalog, getProducts } from "@/api";
import { useCatalogStore } from "@/stores";
import type { Category, Subcategory, Product } from "@/types";

import CatalogHeader from "@/components/catalog/CatalogHeader.vue";
import CatalogControls from "@/components/catalog/CatalogControls.vue";
import CatalogFilters from "@/components/catalog/CatalogFilters.vue";
import CatalogPagination from "@/components/catalog/CatalogPagination.vue";
import ProductCard from "@/components/catalog/ProductCard.vue";

const route = useRoute();
const catalogStore = useCatalogStore();

const loading = ref(false);
const categories = ref<Category[]>([]);
const currentCategory = ref<Category | null>(null);
const currentSubcategory = ref<Subcategory | null>(null);
const availableBrands = ref<string[]>([]);

const searchQuery = ref("");
const sortOption = ref("date-desc");
const viewMode = ref<"grid" | "list">("grid");
const priceRange = ref<[number, number]>([0, 500000]);
const selectedBrands = ref<string[]>([]);
const selectedCategory = ref<string>("");
const selectedSubcategory = ref<string>("");

const productsResponse = reactive({
  products: [] as Product[],
  total: 0,
  page: 1,
  limit: 20,
});

const currentPage = computed(() => productsResponse.page);
const totalPages = computed(() =>
  Math.ceil(productsResponse.total / productsResponse.limit)
);

// Загрузка каталога
const loadCatalog = async () => {
  try {
    const response = await getCatalog();
    categories.value = response.data.categories || [];

    // Сохраняем в store
    catalogStore.setCatalog(response.data);

    // Получаем все бренды
    const products = Object.values(response.data.products || {}) as Product[];
    availableBrands.value = [...new Set(products.map((p) => p.brand))];

    // Определяем текущую категорию из роута
    if (route.params.categoryId) {
      currentCategory.value =
        categories.value.find((c) => c.id === route.params.categoryId) || null;
    }

    if (route.params.subcategoryId) {
      const subcategories = response.data.subcategories || {};
      currentSubcategory.value =
        subcategories[route.params.subcategoryId as string] || null;
    }
  } catch (error) {
    console.error("Failed to load catalog:", error);
  }
};

// Загрузка товаров
const loadProducts = async () => {
  loading.value = true;

  try {
    const params: Record<string, any> = {
      page: currentPage.value,
      limit: productsResponse.limit,
      sortBy: sortOption.value,
    };

    if (searchQuery.value) {
      params.q = searchQuery.value;
    }

    if (selectedCategory.value) {
      params.categoryId = selectedCategory.value;
    }

    if (selectedSubcategory.value) {
      params.subcategoryId = selectedSubcategory.value;
    }

    if (selectedBrands.value.length > 0) {
      params.brand = selectedBrands.value.join(",");
    }

    if (priceRange.value[0] > 0 || priceRange.value[1] < 500000) {
      params.priceMin = priceRange.value[0];
      params.priceMax = priceRange.value[1];
    }

    const response = await getProducts(params);

    productsResponse.products = response.data.products || [];
    productsResponse.total = response.data.total || 0;
    productsResponse.page = response.data.page || 1;
    productsResponse.limit = response.data.limit || 20;
  } catch (error) {
    console.error("Failed to load products:", error);
    productsResponse.products = [];
    productsResponse.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  productsResponse.page = 1;
  loadProducts();
};

const handleSort = () => {
  productsResponse.page = 1;
  loadProducts();
};

const applyFilters = () => {
  productsResponse.page = 1;
  loadProducts();
};

const resetFilters = () => {
  searchQuery.value = "";
  sortOption.value = "date-desc";
  priceRange.value = [0, 500000];
  selectedBrands.value = [];
  selectedCategory.value = "";
  selectedSubcategory.value = "";
  productsResponse.page = 1;
  loadProducts();
};

const changePage = (page: number) => {
  productsResponse.page = page;
  loadProducts();

  window.scrollTo({ top: 0, behavior: "smooth" });
};

watch(
  () => [
    route.params.categoryId,
    route.params.subcategoryId,
    route.query.category,
  ],
  ([_catId, _subcatId, queryCategory]) => {
    if (queryCategory && typeof queryCategory === "string") {
      selectedCategory.value = queryCategory;
    }
    loadCatalog();
    loadProducts();
  }
);

onMounted(() => {
  if (route.query.category && typeof route.query.category === "string") {
    selectedCategory.value = route.query.category;
  }
  loadCatalog();
  loadProducts();
});
</script>

<style scoped>
.catalog-view {
  min-height: 100vh;
  padding: var(--spacing-12) 0;
  background-color: var(--color-background);
}

.catalog-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--spacing-8);
  margin-top: var(--spacing-8);
}

.catalog-products {
  min-width: 0;
}

.products-loading,
.products-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-24);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
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

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}

.products-empty h3 {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.products-empty p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
}

.products-grid {
  display: grid;
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-12);
}

.products-grid--grid {
  grid-template-columns: repeat(5, 1fr);
}

.products-grid--list {
  grid-template-columns: 1fr;
}

/* Адаптивность */
@media (max-width: 1600px) {
  .products-grid--grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .catalog-content {
    grid-template-columns: 260px 1fr;
  }

  .products-grid--grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .catalog-content {
    grid-template-columns: 1fr;
  }

  .products-grid--grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .catalog-view {
    padding: var(--spacing-8) 0;
  }

  .products-grid--grid {
    grid-template-columns: 1fr;
  }
}
</style>
