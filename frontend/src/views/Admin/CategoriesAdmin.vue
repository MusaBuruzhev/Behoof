<template>
  <div class="categories-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Категории</h1>
        <p class="page-subtitle">Управление категориями товаров</p>
      </div>
      <button class="btn-primary" @click="openModal(null)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить категорию
      </button>
    </div>

    <div v-if="adminStore.categories.isLoading" class="loading-state">Загрузка...</div>

    <div v-else-if="categories.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
      </div>
      <h3>Нет категорий</h3>
      <p>Создайте первую категорию для товаров</p>
      <button class="btn-primary" @click="openModal(null)">Создать категорию</button>
    </div>

    <div v-else class="categories-grid">
      <div v-for="cat in categories" :key="cat.id" class="category-card">
        <div class="cat-icon">{{ cat.name[0]?.toUpperCase() }}</div>
        <div class="cat-info">
          <h3>{{ cat.name }}</h3>
          <p v-if="cat.description" class="cat-desc">{{ cat.description }}</p>
          <span class="cat-count">ID: {{ cat.id }}</span>
        </div>
        <div class="cat-actions">
          <button class="btn-icon" title="Редактировать" @click="openModal(cat)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-icon-danger" title="Удалить" @click="deleteCategoryHandler(cat.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingCategory ? 'Редактировать категорию' : 'Новая категория' }}</h2>
          <button class="btn-close" @click="showModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveCategory" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="form.name" type="text" class="input" placeholder="Смартфоны, Ноутбуки..." required />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" class="input" rows="2" placeholder="Краткое описание категории..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showModal = false">Отмена</button>
            <button type="submit" class="btn-primary">{{ editingCategory ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores'

const adminStore = useAdminStore()
const showModal = ref(false)
const editingCategory = ref<any>(null)
const form = ref({ name: '', description: '' })

const categories = computed(() => adminStore.categories.items)

const openModal = (cat: any | null) => {
  editingCategory.value = cat
  form.value = cat ? { name: cat.name, description: cat.description || '' } : { name: '', description: '' }
  showModal.value = true
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await adminStore.updateCategory(editingCategory.value.id, form.value)
    } else {
      await adminStore.createCategory(form.value)
    }
    showModal.value = false
    editingCategory.value = null
    await adminStore.fetchCategories()
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Ошибка сохранения')
  }
}

const deleteCategoryHandler = async (id: string) => {
  if (!confirm('Удалить категорию?')) return
  try {
    await adminStore.deleteCategory(id)
    await adminStore.fetchCategories()
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Ошибка удаления')
  }
}

onMounted(() => { adminStore.fetchCategories() })
</script>

<style scoped>
.categories-admin { display: flex; flex-direction: column; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

.btn-primary {
  display: flex; align-items: center; gap: 6px; padding: 9px 16px;
  background: var(--color-primary); color: white; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; white-space: nowrap;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary svg { width: 16px; height: 16px; }
.btn-ghost { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; color: var(--color-text-primary); }
.btn-ghost:hover { background: var(--color-surface-secondary, #F9FAFB); }

.categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.category-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px;
  padding: 16px 20px; transition: all 0.15s;
}
.category-card:hover { border-color: var(--color-border-dark); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
.cat-icon {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: var(--color-primary-light, #DBEAFE); color: var(--color-primary);
  font-size: 18px; font-weight: 700;
}
.cat-info { flex: 1; min-width: 0; }
.cat-info h3 { margin: 0; font-size: 14px; font-weight: 600; }
.cat-desc { margin: 2px 0 4px; font-size: 12px; color: var(--color-text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cat-count { font-size: 11px; color: var(--color-text-tertiary); font-family: monospace; }
.cat-actions { display: flex; gap: 2px; flex-shrink: 0; }

.btn-icon {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--color-text-tertiary);
}
.btn-icon:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon-danger:hover { background: var(--color-error-light, #FEE2E2); color: var(--color-error); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-surface-secondary, #F9FAFB); margin-bottom: 16px; }
.empty-icon svg { width: 24px; height: 24px; color: var(--color-text-tertiary); }
.empty-state h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; }
.empty-state p { margin: 0 0 20px; font-size: 14px; color: var(--color-text-secondary); }
.loading-state { padding: 40px; text-align: center; color: var(--color-text-tertiary); }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: var(--color-surface); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); width: 90%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 600; }
.btn-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: var(--color-surface-secondary, #F9FAFB); border-radius: 8px; cursor: pointer; color: var(--color-text-secondary); }
.btn-close:hover { background: var(--color-border); }
.btn-close svg { width: 16px; height: 16px; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; }
.input { padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 13px; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); outline: none; }
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
textarea.input { resize: vertical; min-height: 60px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; border-top: 1px solid var(--color-border-light, #F3F4F6); margin-top: 4px; }

@media (max-width: 768px) { .categories-grid { grid-template-columns: 1fr; } }
</style>
