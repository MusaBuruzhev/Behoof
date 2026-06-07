<template>
  <transition name="mega-menu">
    <div
      v-if="visible"
      class="mega-menu-overlay"
      @mouseenter="keepOpen"
      @mouseleave="closeMenu"
    >
        <div class="mega-menu">
          <div class="mega-menu-container">
            <!-- Левая колонка: Категории -->
            <div class="mega-menu-categories">
              <h3 class="mega-menu-title">Категории</h3>
              <nav class="categories-nav">
                <button
                  v-for="category in categories"
                  :key="category.id"
                  :class="['category-item', { active: activeCategory === category.id }]"
                  @click="selectCategory(category)"
                >
                  <span class="category-name">{{ category.name }}</span>
                  <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </nav>
            </div>
            
            <!-- Разделитель -->
            <div class="mega-menu-divider"></div>
            
            <!-- Правая колонка: Подкатегории -->
            <div class="mega-menu-subcategories">
              <h3 v-if="selectedCategory" class="subcategories-title">
                {{ selectedCategory.name }}
              </h3>
              <h3 v-else class="subcategories-title">
                Выберите категорию
              </h3>
              
              <div v-if="selectedCategory" class="subcategories-grid">
                <div
                  v-for="subcategory in getSubcategoriesForCategory(selectedCategory.id)"
                  :key="subcategory.id"
                  class="subcategory-card"
                >
                  <router-link
                    :to="`/catalog/${selectedCategory.id}/${subcategory.id}`"
                    class="subcategory-link"
                    @click="closeMenu"
                  >
                    <div class="subcategory-image">
                      <img
                        :src="getSubcategoryImage(subcategory.id)"
                        :alt="subcategory.name"
                        loading="lazy"
                      />
                    </div>
                    <span class="subcategory-name">{{ subcategory.name }}</span>
                  </router-link>
                </div>
              </div>
              
              <div v-if="selectedCategory" class="view-all-wrapper">
                <router-link
                  :to="`/catalog/${selectedCategory.id}`"
                  class="view-all-link"
                  @click="closeMenu"
                >
                  Смотреть все товары
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category, Subcategory } from '@/types'

const props = defineProps<{
  visible: boolean
  categories: Category[]
}>()

const emit = defineEmits<{
  close: []
}>()

const activeCategory = ref<string>('')
const selectedCategory = ref<Category | null>(null)

// Изображения для подкатегорий (плейсхолдеры)
const subcategoryImages: Record<string, string> = {
  sub1: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
  sub2: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
  sub3: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop',
}

const defaultSubcategoryImage = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=200&fit=crop'

const getSubcategoryImage = (id: string): string => {
  return subcategoryImages[id] || defaultSubcategoryImage
}

// Получение подкатегорий для категории
// В реальном приложении нужно брать из store или API
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getSubcategoriesForCategory = (_categoryId: string): Subcategory[] => {
  // Временная реализация - возвращаем пустой массив
  // В реальности данные будут из catalogStore
  return []
}

const selectCategory = (category: Category) => {
  selectedCategory.value = category
  activeCategory.value = category.id
}

const keepOpen = () => {
  // Меню остаётся открытым при наведении
}

const closeMenu = () => {
  emit('close')
}

// Сброс при закрытии
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      setTimeout(() => {
        selectedCategory.value = null
        activeCategory.value = ''
      }, 300)
    }
  }
)
</script>

<style scoped>
.mega-menu-overlay {
  position: fixed;
  top: var(--header-height, 72px);
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-dropdown);
  z-index: var(--z-dropdown, 100);
}

.mega-menu {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--spacing-6) var(--spacing-8);
}

.mega-menu-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 0;
}

/* Категории */
.mega-menu-categories {
  padding-right: var(--spacing-8);
}

.mega-menu-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.categories-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
  width: 100%;
}

.category-item:hover {
  background: var(--color-background);
  color: var(--color-primary);
}

.category-item.active {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.category-name {
  flex: 1;
}

.chevron-icon {
  width: 16px;
  height: 16px;
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-fast);
}

.category-item:hover .chevron-icon,
.category-item.active .chevron-icon {
  opacity: 1;
  transform: translateX(0);
}

.category-item.active .chevron-icon {
  stroke: var(--color-text-inverse);
}

/* Разделитель */
.mega-menu-divider {
  width: 1px;
  background: var(--color-border-light);
  margin: 0 var(--spacing-6);
}

/* Подкатегории */
.mega-menu-subcategories {
  padding-left: var(--spacing-6);
}

.subcategories-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-6);
}

.subcategories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.subcategory-card {
  background: var(--color-background);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.subcategory-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.subcategory-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.subcategory-image {
  aspect-ratio: 3/2;
  overflow: hidden;
  background: var(--color-surface);
}

.subcategory-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.subcategory-card:hover .subcategory-image img {
  transform: scale(1.08);
}

.subcategory-name {
  display: block;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.view-all-wrapper {
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}

.view-all-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.view-all-link:hover {
  color: var(--color-primary-hover);
}

.view-all-link svg {
  width: 18px;
  height: 18px;
}

/* Анимации */
.mega-menu-enter-active,
.mega-menu-leave-active {
  transition: all var(--transition-slow);
}

.mega-menu-enter-from,
.mega-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .mega-menu-container {
    grid-template-columns: 1fr;
  }
  
  .mega-menu-categories {
    padding-right: 0;
    margin-bottom: var(--spacing-6);
  }
  
  .mega-menu-divider {
    display: none;
  }
  
  .mega-menu-subcategories {
    padding-left: 0;
  }
  
  .subcategories-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .mega-menu {
    padding: var(--spacing-4);
  }
  
  .subcategories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
