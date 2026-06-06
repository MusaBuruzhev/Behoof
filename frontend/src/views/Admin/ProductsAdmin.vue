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

    <DataTable
      :columns="columns"
      :items="filteredProducts"
      :is-loading="adminStore.products.isLoading"
      :current-page="adminStore.products.page"
      :total-pages="Math.ceil(adminStore.products.total / 20)"
      @page-change="handlePageChange"
    >
      <template #cell-image="{ item }">
        <img v-if="item.images && item.images.length > 0" :src="item.images[0]" :alt="item.name" class="product-image" />
        <div v-else class="product-image placeholder">No image</div>
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
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description"></textarea>
          </div>

          <div class="form-group">
            <label>Цена *</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" required />
          </div>

          <div class="form-group">
            <label>Бренд</label>
            <input v-model="form.brand" type="text" />
          </div>

          <div class="form-group">
            <label>Количество в наличии</label>
            <input v-model.number="form.stock" type="number" min="0" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">
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
import DataTable from '@/components/admin/DataTable.vue'

const adminStore = useAdminStore()
const searchQuery = ref('')
const showCreateForm = ref(false)
const editingProduct = ref<any>(null)

const form = ref({
  name: '',
  description: '',
  price: 0,
  brand: '',
  stock: 0,
})

const columns = [
  { key: 'image', label: 'Изображение', width: '80px' },
  { key: 'name', label: 'Название' },
  { key: 'brand', label: 'Бренд' },
  { key: 'price', label: 'Цена' },
  { key: 'stock', label: 'В наличии' },
]

const filteredProducts = computed(() => {
  if (!searchQuery.value) return adminStore.products.items
  return adminStore.products.items.filter(
    p =>
      p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const formatPrice = (price: number) => price.toLocaleString('ru-RU')

const handlePageChange = (page: number) => {
  adminStore.fetchProducts(page)
}

const editProduct = (product: any) => {
  editingProduct.value = product
  form.value = { ...product }
  showCreateForm.value = true
}

const saveProduct = async () => {
  try {
    if (editingProduct.value) {
      await adminStore.updateProduct(editingProduct.value.id, form.value)
    } else {
      await adminStore.addProduct(form.value)
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
    stock: 0,
  }
}

onMounted(() => {
  adminStore.fetchProducts()
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
  font-size: 12px;
  color: var(--color-text-secondary);
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
  max-width: 500px;
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
.form-group textarea {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}
</style>
