<template>
  <div class="brands-admin">
    <div class="header">
      <h1 class="title">Управление брендами</h1>
      <button class="btn btn-primary" @click="showCreateForm = true">
        + Добавить бренд
      </button>
    </div>

    <div class="brands-grid" v-if="brands.length > 0">
      <div v-for="brand in brands" :key="brand.id" class="brand-card">
        <h3>{{ brand.name }}</h3>
        <p v-if="brand.description" class="description">{{ brand.description }}</p>
        <div class="actions">
          <button class="btn btn-small btn-secondary" @click="editBrand(brand)">
            Редактировать
          </button>
          <button class="btn btn-small btn-danger" @click="deleteBrand(brand.id)">
            Удалить
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">Нет брендов</div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="showCreateForm = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingBrand ? 'Редактировать бренд' : 'Новый бренд' }}</h2>
          <button class="btn-close" @click="showCreateForm = false">×</button>
        </div>

        <form @submit.prevent="saveBrand" class="form">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="form.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" @click="showCreateForm = false">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingBrand ? 'Сохранить' : 'Создать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores'

const adminStore = useAdminStore()
const showCreateForm = ref(false)
const editingBrand = ref<any>(null)

const form = ref({
  name: '',
  description: '',
})

const brands = ref<any[]>([])

const fetchBrands = async () => {
  try {
    await adminStore.fetchBrands()
    brands.value = adminStore.brands.items
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    brands.value = []
  }
}

const editBrand = (brand: any) => {
  editingBrand.value = brand
  form.value = { ...brand }
  showCreateForm.value = true
}

const saveBrand = async () => {
  try {
    if (editingBrand.value) {
      await adminStore.updateBrand(editingBrand.value.id, form.value)
    } else {
      await adminStore.createBrand(form.value)
    }
    showCreateForm.value = false
    editingBrand.value = null
    resetForm()
    fetchBrands()
  } catch (error) {
    console.error('Error saving brand:', error)
    alert('Ошибка сохранения бренда: ' + (error as Error).message)
  }
}

const deleteBrand = async (id: string) => {
  if (confirm('Вы уверены?')) {
    try {
      await adminStore.deleteBrand(id)
      fetchBrands()
    } catch (error) {
      console.error('Error deleting brand:', error)
      alert('Ошибка удаления бренда: ' + (error as Error).message)
    }
  }
}

const resetForm = () => {
  form.value = {
    name: '',
    description: '',
  }
}

onMounted(() => {
  fetchBrands()
})
</script>

<style scoped>
.brands-admin {
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

.brands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.brand-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
}

.brand-card h3 {
  margin: 0 0 var(--spacing-2) 0;
  font-size: 16px;
  font-weight: 600;
}

.description {
  margin: 0 0 var(--spacing-4) 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.actions {
  display: flex;
  gap: var(--spacing-3);
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

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-small {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 12px;
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

.empty-state {
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-text-secondary);
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
