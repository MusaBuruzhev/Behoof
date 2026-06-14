<template>
  <div class="brands-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Бренды</h1>
        <p class="page-subtitle">Управление брендами по категориям</p>
      </div>
      <button class="btn-primary" @click="openModal(null)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить бренд
      </button>
    </div>

    <!-- Фильтр по категории -->
    <div class="filter-bar">
      <button :class="['filter-chip', { active: selectedCategory === '' }]" @click="selectedCategory = ''">Все</button>
      <button v-for="cat in categories" :key="cat.id" :class="['filter-chip', { active: selectedCategory === cat.id }]" @click="selectedCategory = cat.id">
        {{ cat.name }}
      </button>
    </div>

    <div v-if="filteredBrands.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
      </div>
      <h3>Нет брендов</h3>
      <p>{{ selectedCategory ? 'В этой категории ещё нет брендов' : 'Добавьте первый бренд' }}</p>
      <button class="btn-primary" @click="openModal(null)">Добавить бренд</button>
    </div>

    <div v-else class="brands-grid">
      <div v-for="brand in filteredBrands" :key="brand.id" class="brand-card">
        <div class="brand-avatar" :style="{ background: brandLogoBg(brand.name) }">
          {{ brand.name[0]?.toUpperCase() }}
        </div>
        <div class="brand-info">
          <h3>{{ brand.name }}</h3>
          <p v-if="brand.description" class="brand-desc">{{ brand.description }}</p>
          <div class="brand-meta">
            <span v-if="brand.categoryId" class="meta-tag">
              {{ getCategoryName(brand.categoryId) }}
            </span>
            <span v-else class="meta-tag no-cat">Без категории</span>
          </div>
        </div>
        <div class="brand-actions">
          <button class="btn-icon" title="Редактировать" @click="openModal(brand)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-icon-danger" title="Удалить" @click="deleteBrandHandler(brand.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingBrand ? 'Редактировать бренд' : 'Новый бренд' }}</h2>
          <button class="btn-close" @click="showModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveBrand" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="form.name" type="text" class="input" placeholder="Apple, Samsung..." required />
          </div>
          <div class="form-group">
            <label>Категория *</label>
            <select v-model="form.categoryId" class="input" required>
              <option value="">Выберите категорию</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" class="input" rows="2" placeholder="Краткое описание бренда..."></textarea>
          </div>
          <div class="form-group">
            <label>Веб-сайт</label>
            <input v-model="form.website" type="url" class="input" placeholder="https://example.com" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showModal = false">Отмена</button>
            <button type="submit" class="btn-primary">{{ editingBrand ? 'Сохранить' : 'Создать' }}</button>
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
const editingBrand = ref<any>(null)
const selectedCategory = ref('')
const categories = ref<any[]>([])

const form = ref({ name: '', description: '', categoryId: '', website: '' })

const brands = computed(() => adminStore.brands.items)

const filteredBrands = computed(() => {
  if (!selectedCategory.value) return brands.value
  return brands.value.filter((b: any) => b.categoryId === selectedCategory.value)
})

const getCategoryName = (catId: string) => {
  return categories.value.find((c) => c.id === catId)?.name || catId
}

const brandLogoBg = (name: string) => {
  const colors = ['#DBEAFE', '#D1FAE5', '#FEF3C7', '#FEE2E2', '#E0E7FF', '#F3E8FF', '#CCFBF1', '#FFEDD5']
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}

const openModal = (brand: any | null) => {
  editingBrand.value = brand
  if (brand) {
    form.value = { name: brand.name, description: brand.description || '', categoryId: brand.categoryId || '', website: brand.website || '' }
  } else {
    form.value = { name: '', description: '', categoryId: selectedCategory.value || '', website: '' }
  }
  showModal.value = true
}

const saveBrand = async () => {
  try {
    if (editingBrand.value) {
      await adminStore.updateBrand(editingBrand.value.id, form.value)
    } else {
      await adminStore.createBrand(form.value)
    }
    showModal.value = false
    editingBrand.value = null
    await adminStore.fetchBrands()
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Ошибка сохранения бренда')
  }
}

const deleteBrandHandler = async (id: string) => {
  if (!confirm('Удалить бренд?')) return
  try {
    await adminStore.deleteBrand(id)
    await adminStore.fetchBrands()
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Ошибка удаления бренда')
  }
}

onMounted(async () => {
  await Promise.all([adminStore.fetchBrands(), adminStore.fetchCategories()])
  categories.value = adminStore.categories.items
})
</script>

<style scoped>
.brands-admin { display: flex; flex-direction: column; gap: 24px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

/* Filter */
.filter-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-chip {
  padding: 6px 14px; border: 1px solid var(--color-border); border-radius: 8px;
  background: var(--color-surface); font-size: 13px; font-weight: 450; color: var(--color-text-secondary);
  cursor: pointer; transition: all 0.15s ease;
}
.filter-chip:hover { border-color: var(--color-primary-light); color: var(--color-primary); }
.filter-chip.active { background: var(--color-primary); color: white; border-color: var(--color-primary); }

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 6px; padding: 9px 16px;
  background: var(--color-primary); color: white; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s ease; white-space: nowrap;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary svg { width: 16px; height: 16px; }

.btn-ghost { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; color: var(--color-text-primary); }
.btn-ghost:hover { background: var(--color-surface-secondary, #F9FAFB); }

.btn-icon {
  display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  border: none; background: transparent; border-radius: 8px; cursor: pointer; color: var(--color-text-tertiary);
  transition: all 0.15s ease;
}
.btn-icon:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.btn-icon svg { width: 16px; height: 16px; }
.btn-icon-danger:hover { background: var(--color-error-light, #FEE2E2); color: var(--color-error); }

/* Brands Grid */
.brands-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 12px; }

.brand-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px;
  padding: 16px 20px; transition: all 0.15s ease;
}
.brand-card:hover { border-color: var(--color-border-dark); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }

.brand-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
  font-size: 20px; font-weight: 700; color: var(--color-text-primary);
}

.brand-info { flex: 1; min-width: 0; }
.brand-info h3 { margin: 0; font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
.brand-desc { margin: 2px 0 6px; font-size: 12px; color: var(--color-text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.brand-meta { display: flex; gap: 6px; }
.meta-tag { font-size: 11px; padding: 2px 8px; border-radius: 5px; background: var(--color-primary-light, #DBEAFE); color: var(--color-primary); font-weight: 500; }
.meta-tag.no-cat { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-tertiary); }

.brand-actions { display: flex; gap: 2px; flex-shrink: 0; }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; color: var(--color-text-secondary); }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-surface-secondary, #F9FAFB); margin-bottom: 16px; }
.empty-icon svg { width: 24px; height: 24px; color: var(--color-text-tertiary); }
.empty-state h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.empty-state p { margin: 0 0 20px; font-size: 14px; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: var(--color-surface); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); width: 90%; max-width: 480px; max-height: 85vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 600; }
.btn-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: var(--color-surface-secondary, #F9FAFB); border-radius: 8px; cursor: pointer; color: var(--color-text-secondary); }
.btn-close:hover { background: var(--color-border); color: var(--color-text-primary); }
.btn-close svg { width: 16px; height: 16px; }
.modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
.input { padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 13px; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); outline: none; transition: border-color 0.15s; }
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
textarea.input { resize: vertical; min-height: 60px; }
select.input { cursor: pointer; }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 8px; border-top: 1px solid var(--color-border-light, #F3F4F6); margin-top: 4px; }

@media (max-width: 768px) {
  .brands-grid { grid-template-columns: 1fr; }
}
</style>
