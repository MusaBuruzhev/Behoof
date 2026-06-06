<template>
  <div class="product-edit-admin">
    <div class="header">
      <h1 class="title">Редактировать товар</h1>
      <router-link to="/admin/products" class="btn btn-secondary">
        ← Назад
      </router-link>
    </div>

    <div v-if="loading" class="loading">Загрузка...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="product-form">
      <form @submit.prevent="saveProduct">
        <div class="form-group">
          <label>Название *</label>
          <input v-model="form.name" type="text" required />
        </div>

        <div class="form-group">
          <label>Описание</label>
          <textarea v-model="form.description" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>Цена *</label>
          <input v-model.number="form.price" type="number" min="0" step="0.01" required />
        </div>

        <div class="form-group">
          <label>Бренд *</label>
          <input v-model="form.brand" type="text" required />
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

        <div class="form-group">
          <label>Модель *</label>
          <input v-model="form.model" type="text" required />
        </div>

        <div class="form-group">
          <label>Характеристики (JSON)</label>
          <textarea v-model="characteristicsText" rows="6" placeholder='[{"trait": "Оперативная память", "value": "8GB"}]'></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="cancel">
            Отмена
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Сохранение...' : 'Сохранить' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const productId = computed(() => route.params.id)

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const categories = ref<any[]>([])

const form = ref({
  name: '',
  description: '',
  price: 0,
  brand: '',
  categoryId: '',
  model: '',
  subcategoryId: '',
  characteristics: [],
})

const characteristicsText = computed({
  get: () => JSON.stringify(form.value.characteristics, null, 2),
  set: (value: string) => {
    try {
      form.value.characteristics = JSON.parse(value)
    } catch {
      // Ignore JSON errors
    }
  },
})

const loadProduct = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get(`/api/products/${productId.value}`)
    const product = response.data
    form.value = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      brand: product.brand || '',
      categoryId: product.categoryId || '',
      model: product.model || '',
      subcategoryId: product.subcategoryId || '',
      characteristics: product.characteristics || [],
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Ошибка загрузки товара'
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await axios.get('/api/admin/categories')
    categories.value = response.data.categories || []
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

const saveProduct = async () => {
  saving.value = true
  error.value = ''
  try {
    await axios.put(`/api/products/${productId.value}`, form.value)
    router.push('/admin/products')
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Ошибка сохранения товара'
  } finally {
    saving.value = false
  }
}

const cancel = () => {
  router.back()
}

onMounted(() => {
  loadProduct()
  loadCategories()
})
</script>

<style scoped>
.product-edit-admin {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.loading,
.error {
  padding: var(--spacing-8);
  text-align: center;
  font-size: 16px;
}

.error {
  color: var(--color-error);
}

.product-form {
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: var(--spacing-3) var(--spacing-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
}

.form-actions {
  display: flex;
  gap: var(--spacing-4);
  justify-content: flex-end;
  margin-top: var(--spacing-6);
}

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

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: var(--color-background);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  text-decoration: none;
}

.btn-secondary:hover {
  background-color: var(--color-surface);
}
</style>
