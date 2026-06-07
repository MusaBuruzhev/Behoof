<template>
  <div class="products-admin">
    <div class="header">
      <h1 class="title">Управление товарами</h1>
      <button class="btn btn-primary" @click="showCreateForm = true">
        + Добавить товар
      </button>
    </div>

    <div class="controls">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск товаров..."
        class="search-input"
      />
    </div>

    <!-- Loading State -->
    <div v-if="adminStore.products.isLoading && adminStore.products.items.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Загрузка товаров...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredProducts.length === 0" class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414" />
      </svg>
      <h3 class="empty-title">Нет товаров</h3>
      <p class="empty-text">Товары ещё не добавлены или не найдены по запросу</p>
    </div>

    <DataTable
      v-else
      :columns="columns"
      :items="filteredProducts"
      :is-loading="adminStore.products.isLoading"
      :current-page="adminStore.products.page"
      :total-pages="Math.ceil(adminStore.products.total / 20)"
      @page-change="handlePageChange"
    >
      <template #cell-image="{ item }">
        <img v-if="item.images && item.images.length > 0" :src="item.images[0]" :alt="item.name" class="product-image" />
        <div v-else class="product-image placeholder">Нет фото</div>
      </template>

      <template #cell-price="{ item }">
        {{ formatPrice(item.price) }} ₽
      </template>

      <template #actions="{ item }">
        <button class="btn btn-small btn-secondary" @click="editProduct(item)">
          Редактировать
        </button>
        <button class="btn btn-small btn-danger" @click="deleteProduct(item.id)">
          Удалить
        </button>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingProduct ? 'Редактировать товар' : 'Новый товар' }}</h2>
          <button class="btn-close" @click="showCreateForm = false">×</button>
        </div>

        <form @submit.prevent="saveProduct" class="form">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="form.name" type="text" required placeholder="Например: iPhone 15 Pro" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Цена (₽) *</label>
              <input v-model.number="form.price" type="number" min="0" step="0.01" required placeholder="99990" />
            </div>

            <div class="form-group">
              <label>Бренд *</label>
              <input v-model="form.brand" type="text" required placeholder="Например: Apple" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Модель *</label>
              <input v-model="form.model" type="text" required placeholder="Например: iPhone 15 Pro 256GB" />
            </div>

            <div class="form-group">
              <label>Категория *</label>
              <select v-model="form.categoryId" required>
                <option value="">Выберите категорию</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" rows="3" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group">
            <label>Характеристики (JSON)</label>
            <textarea v-model="form.characteristicsText" rows="3" placeholder='[{"name": "Экран", "value": "6.1\""}]'></textarea>
          </div>

          <div v-if="!editingProduct" class="form-group">
            <label>Изображения (3-10 шт) *</label>
            <input
              ref="imageInput"
              type="file"
              multiple
              accept="image/*"
              @change="handleImageUpload"
              class="file-input"
            />
            <p class="form-hint">Можно выбрать несколько файлов</p>
            <div v-if="images.length > 0" class="image-preview">
              <div v-for="(img, idx) in images" :key="idx" class="image-item">
                <img :src="getImageUrl(img)" :alt="`Фото ${idx + 1}`" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="!editingProduct && images.length < 3">
              {{ editingProduct ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores'
import { getCategories } from '@/api'
import DataTable from '@/components/admin/DataTable.vue'

const adminStore = useAdminStore()
const searchQuery = ref('')
const showCreateForm = ref(false)
const editingProduct = ref<any>(null)
const categories = ref<any[]>([])
const images = ref<File[]>([])
const imageInput = ref<HTMLInputElement | null>(null)

const form = ref({
  name: '',
  description: '',
  price: 0,
  brand: '',
  model: '',
  categoryId: '',
  characteristicsText: '[]',
})

const columns = [
  { key: 'image', label: 'Изображение', width: '80px' },
  { key: 'name', label: 'Название' },
  { key: 'brand', label: 'Бренд' },
  { key: 'price', label: 'Цена' },
  { key: 'model', label: 'Модель' },
]

const filteredProducts = computed(() => {
  const items = adminStore.products.items || []
  if (!searchQuery.value) return items
  return items.filter(
    p =>
      p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatPrice = (price: number) => price.toLocaleString('ru-RU')

const handlePageChange = (page: number) => {
  adminStore.fetchProducts(page)
}

const handleImageUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    images.value = Array.from(target.files)
  }
}

const getImageUrl = (file: File) => {
  return URL.createObjectURL(file)
}

const editProduct = (product: any) => {
  editingProduct.value = product
  form.value = {
    name: product.name || '',
    description: product.description || '',
    price: product.price || 0,
    brand: product.brand || '',
    model: product.model || '',
    categoryId: product.categoryId || '',
    characteristicsText: JSON.stringify(product.characteristics || [], null, 2),
  }
  images.value = []
  showCreateForm.value = true
}

const saveProduct = async () => {
  try {
    let characteristics = []
    try {
      characteristics = JSON.parse(form.value.characteristicsText)
    } catch {
      alert('Неверный формат характеристик (должен быть JSON массив)')
      return
    }

    if (editingProduct.value) {
      await adminStore.updateProduct(editingProduct.value.id, {
        name: form.value.name,
        description: form.value.description,
        price: form.value.price,
        brand: form.value.brand,
        model: form.value.model,
        categoryId: form.value.categoryId,
        characteristics,
      })
    } else {
      if (images.value.length < 3 || images.value.length > 10) {
        alert('Необходимо загрузить от 3 до 10 изображений')
        return
      }

      const formData = new FormData()
      formData.append('name', form.value.name)
      formData.append('price', String(form.value.price))
      formData.append('brand', form.value.brand)
      formData.append('model', form.value.model)
      formData.append('categoryId', form.value.categoryId)
      formData.append('description', form.value.description)
      formData.append('characteristics', JSON.stringify(characteristics))

      images.value.forEach(img => {
        formData.append('images', img)
      })

      await adminStore.addProduct(formData)
    }

    showCreateForm.value = false
    editingProduct.value = null
    resetForm()
  } catch (error) {
    console.error('Error saving product:', error)
    alert('Ошибка сохранения товара: ' + (error as Error).message)
  }
}

const deleteProduct = async (id: string) => {
  if (confirm('Вы уверены?')) {
    try {
      await adminStore.deleteProduct(id)
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ошибка удаления товара: ' + (error as Error).message)
    }
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
    price: 0,
    brand: '',
    model: '',
    categoryId: '',
    characteristicsText: '[]',
  }
  images.value = []
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

const loadCategories = async () => {
  try {
    const response = await getCategories()
    categories.value = response.data.categories || []
  } catch (error) {
    console.error('Failed to load categories:', error)
    categories.value = []
  }
}

onMounted(() => {
  adminStore.fetchProducts()
  loadCategories()
})
</script>

<style scoped>
.products-admin {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: var(--spacing-4);
}

.search-input {
  flex: 1;
  max-width: 300px;
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: var(--spacing-4);
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}

.empty-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.empty-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-6) 0;
}

.product-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.product-image.placeholder {
  background-color: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: var(--color-text-secondary);
  text-align: center;
}

/* Form Styles */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-4);
}

.form-hint {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: var(--spacing-2) 0 0 0;
}

.file-input {
  width: 100%;
  padding: var(--spacing-3);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--color-background);
}

.file-input:hover {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.05);
}

.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--spacing-2);
  margin-top: var(--spacing-3);
}

.image-item {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Button styles */
.btn {
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface);
}

.btn-danger {
  background-color: #FEE2E2;
  color: var(--color-error);
}

.btn-danger:hover {
  background-color: #FCA5A5;
}

.btn-small {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 12px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.form {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}
</style>
