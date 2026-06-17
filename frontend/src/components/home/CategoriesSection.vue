<template>
  <section class="categories-section section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title h2">Популярные категории</h2>
        <p class="section-description">
          Выберите категорию для просмотра всего ассортимента
        </p>
      </div>

      <div class="categories-grid">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="{ path: '/catalog', query: { category: category.id } }"
          class="category-card"
        >
          <div class="category-image-wrapper">
            <img
              :src="getCategoryImage(category)"
              :alt="category.name"
              class="category-image"
              loading="lazy"
            />
            <div class="category-overlay"></div>
          </div>
          <div class="category-content">
            <h3 class="category-name">{{ category.name }}</h3>
            <span class="category-link">
              Смотреть товары
              <svg
                class="arrow-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCatalog } from "@/api";
import type { Category } from "@/types";

const categories = ref<Category[]>([]);

const categoryImages: Record<string, string> = {
  cat1: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop", // Смартфоны
  cat2: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop", // Ноутбуки
  cat3: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop", // Планшеты
  cat4: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop", // Наушники
  cat5: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&h=400&fit=crop", // Умные часы
  cat6: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&h=400&fit=crop", // Игровые приставки
  cat7: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=400&fit=crop", // Портативные колонки
  cat8: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop", // Аксессуары
};

const defaultCategoryImage =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop";

const getCategoryImage = (category: Category): string => {
  return categoryImages[category.id] || defaultCategoryImage;
};

const loadCategories = async () => {
  try {
    const response = await getCatalog();
    categories.value = response.data.categories || [];
  } catch (error) {
    console.error("Failed to load categories:", error);
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.categories-section {
  background-color: var(--color-surface);
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
}

.category-card {
  display: block;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
  text-decoration: none;
  color: inherit;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.category-image-wrapper {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.category-card:hover .category-image {
  transform: scale(1.08);
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
}

.category-content {
  padding: var(--spacing-6);
}

.category-name {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.category-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  transition: color var(--transition-fast);
}

.category-link:hover {
  color: var(--color-primary-hover);
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-fast);
}

.category-link:hover .arrow-icon {
  transform: translateX(4px);
}

/* Адаптивность */
@media (max-width: 1440px) {
  .categories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-image-wrapper {
    height: 200px;
  }
}
</style>
