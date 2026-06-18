<template>
  <aside class="catalog-filters">
    <div class="filters-header">
      <h2 class="filters-title">Фильтры</h2>
      <button class="reset-btn" @click="$emit('reset-filters')">
        Сбросить
      </button>
    </div>
    
    <div class="filters-content">
      <div class="filter-section">
        <h3 class="filter-section-title">Цена</h3>
        <div class="price-range">
          <div class="price-inputs">
            <div class="price-input-wrapper">
              <input
                type="number"
                :value="priceRange[0]"
                @input="updatePriceRange(0, Number(($event.target as HTMLInputElement).value))"
                class="price-input"
                placeholder="От"
                min="0"
              />
              <span class="price-symbol">₽</span>
            </div>
            <span class="price-separator">—</span>
            <div class="price-input-wrapper">
              <input
                type="number"
                :value="priceRange[1]"
                @input="updatePriceRange(1, Number(($event.target as HTMLInputElement).value))"
                class="price-input"
                placeholder="До"
                min="0"
              />
              <span class="price-symbol">₽</span>
            </div>
          </div>
          <input
            type="range"
            :value="priceRange[0]"
            @input="updatePriceRange(0, Number(($event.target as HTMLInputElement).value))"
            class="price-slider"
            min="0"
            max="500000"
            step="1000"
          />
          <input
            type="range"
            :value="priceRange[1]"
            @input="updatePriceRange(1, Number(($event.target as HTMLInputElement).value))"
            class="price-slider"
            min="0"
            max="500000"
            step="1000"
          />
        </div>
      </div>
      
      <!-- Категории -->
      <div v-if="categories.length > 0" class="filter-section">
        <h3 class="filter-section-title">Категории</h3>
        <div class="filter-options">
          <label
            v-for="category in categories"
            :key="category.id"
            class="filter-option"
          >
            <input
              type="radio"
              :value="category.id"
              :checked="selectedCategory === category.id"
              @change="toggleCategory(category.id)"
              class="filter-radio"
            />
            <span class="option-text">{{ category.name }}</span>
          </label>
        </div>
      </div>
      
      <!-- Подкатегории -->
      <div v-if="selectedCategory && hasSubcategories" class="filter-section">
        <h3 class="filter-section-title">Подкатегории</h3>
        <div class="filter-options">
          <label class="filter-option">
            <input
              type="radio"
              value=""
              :checked="selectedSubcategory === ''"
              @change="$emit('update:selected-subcategory', '')"
              class="filter-radio"
            />
            <span class="option-text">Все</span>
          </label>
          <label
            v-for="subcategory in currentSubcategories"
            :key="subcategory.id"
            class="filter-option"
          >
            <input
              type="radio"
              :value="subcategory.id"
              :checked="selectedSubcategory === subcategory.id"
              @change="$emit('update:selected-subcategory', subcategory.id)"
              class="filter-radio"
            />
            <span class="option-text">{{ subcategory.name }}</span>
          </label>
        </div>
      </div>
      
      <!-- Бренды -->
      <div v-if="brands.length > 0" class="filter-section">
        <h3 class="filter-section-title">Бренд</h3>
        <div class="filter-options filter-options-scrollable">
          <label
            v-for="brand in brands"
            :key="brand"
            class="filter-option"
          >
            <input
              type="checkbox"
              :value="brand"
              :checked="selectedBrands.includes(brand)"
              @change="toggleBrand(brand)"
              class="filter-checkbox"
            />
            <span class="option-text">{{ brand }}</span>
          </label>
        </div>
      </div>
      
      <!-- Кнопки -->
      <div class="filters-actions">
        <button class="reset-btn-full" @click="$emit('reset-filters')">
          Сбросить фильтры
        </button>
        <button class="apply-btn" @click="$emit('apply-filters')">
          Применить
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Category } from '@/types'

const props = defineProps<{
  priceRange: [number, number]
  selectedBrands: string[]
  selectedCategory: string
  selectedSubcategory: string
  categories: Category[]
  brands: string[]
}>()

const emit = defineEmits<{
  'update:price-range': [value: [number, number]]
  'update:selected-brands': [value: string[]]
  'update:selected-category': [value: string]
  'update:selected-subcategory': [value: string]
  'apply-filters': []
  'reset-filters': []
}>()

const updatePriceRange = (index: 0 | 1, value: number) => {
  const newRange: [number, number] = [...props.priceRange] as [number, number]
  newRange[index] = value
  emit('update:price-range', newRange)
}

const toggleBrand = (brand: string) => {
  const newBrands = props.selectedBrands.includes(brand)
    ? props.selectedBrands.filter(b => b !== brand)
    : [...props.selectedBrands, brand]
  emit('update:selected-brands', newBrands)
}

const toggleCategory = (categoryId: string) => {
  // Если нажали на ту же категорию — сбрасываем выбор
  if (selectedCategory.value === categoryId) {
    emit('update:selected-category', '')
  } else {
    emit('update:selected-category', categoryId)
  }
}

const hasSubcategories = computed(() => {
  return currentSubcategories.value.length > 0
})

const selectedCategory = computed(() => props.selectedCategory)

const currentSubcategories = computed<{ id: string; name: string }[]>(() => {
  if (!props.selectedCategory) return []
  
  const category = props.categories.find(c => c.id === props.selectedCategory)
  if (!category) return []
  
  // В реальном приложении здесь нужно получить подкатегории из store или API
  // Для сейчас возвращаем пустой массив
  return []
})
</script>

<style scoped>
.catalog-filters {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-6);
  height: fit-content;
  position: sticky;
  top: var(--spacing-6);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
}

.filters-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.reset-btn {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.reset-btn:hover {
  color: var(--color-primary);
}

.filters-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.filter-section {
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.filter-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.filter-section-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-4);
}

.price-range {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.price-input-wrapper {
  flex: 1;
  position: relative;
}

.price-input {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-8) var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-small);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  text-align: center;
}

.price-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.price-symbol {
  position: absolute;
  right: var(--spacing-2);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

.price-separator {
  color: var(--color-text-tertiary);
}

.price-slider {
  width: 100%;
  height: 4px;
  appearance: none;
  background: var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
}

.price-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.price-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-options-scrollable {
  max-height: 200px;
  overflow-y: auto;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
  padding: var(--spacing-1) 0;
}

.filter-radio,
.filter-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.option-text {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
}

.apply-btn {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-inverse);
  background: var(--color-primary);
  border: none;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.apply-btn:hover {
  background: var(--color-primary-hover);
}

.filters-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding-top: var(--spacing-4);
}

.reset-btn-full {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.reset-btn-full:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

@media (max-width: 900px) {
  .catalog-filters {
    position: static;
    top: auto;
  }
}
</style>
