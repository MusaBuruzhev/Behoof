<template>
  <div class="catalog-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Каталог</h1>
        <p class="page-subtitle">Управление категориями, брендами и моделями</p>
      </div>
      <div class="header-actions">
        <button class="btn-ghost" @click="expandAll">Развернуть всё</button>
        <button class="btn-ghost" @click="collapseAll">Свернуть всё</button>
      </div>
    </div>

    <div class="catalog-layout">
      <!-- Дерево каталога -->
      <div class="tree-panel">
        <div class="tree-toolbar">
          <div class="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="treeSearch" type="text" placeholder="Поиск..." />
          </div>
        </div>

        <div class="tree-container">
          <div v-for="category in filteredCategories" :key="category.id" class="tree-node">
            <div class="tree-item category" :class="{ selected: selected?.type === 'category' && selected?.id === category.id }" @click="selectNode('category', category)">
              <button class="tree-toggle" @click.stop="toggleCategory(category.id)">
                <svg v-if="expandedCategories.includes(category.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <span class="tree-label">{{ category.name }}</span>
              <button class="tree-action" @click.stop="editCategory(category)">✏️</button>
            </div>

            <div v-if="expandedCategories.includes(category.id)" class="tree-children">
              <div v-for="brand in getBrandsForCategory(category.id)" :key="brand.id" class="tree-node">
                <div class="tree-item brand" :class="{ selected: selected?.type === 'brand' && selected?.id === brand.id }" @click="selectNode('brand', brand)">
                  <button class="tree-toggle" @click.stop="toggleBrand(brand.id)">
                    <svg v-if="expandedBrands.includes(brand.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                  <span class="tree-label">{{ brand.name }}</span>
                  <button class="tree-action" @click.stop="editBrand(brand)">✏️</button>
                </div>

                  <div v-if="expandedBrands.includes(brand.id)" class="tree-children">
                    <div v-for="model in getModelsForBrand(brand.id)" :key="model.id" class="tree-node">
                      <div class="tree-item model" :class="{ selected: selected?.type === 'model' && selected?.id === model.id }" @click="selectNode('model', model)">
                        <span class="tree-toggle-placeholder"></span>
                        <span class="tree-label">{{ model.name }}</span>
                        <button class="tree-action" @click.stop="editModel(model)">✏️</button>
                      </div>
                    </div>

                    <div class="tree-item add-item" @click="openModelModal(category.id, brand.id)">
                      <span class="tree-toggle-placeholder"></span>
                      <span class="tree-label">Добавить модель</span>
                    </div>
                  </div>
              </div>

              <div class="tree-item add-item" @click="openBrandModal(category.id)">
                <span class="tree-toggle-placeholder"></span>
                <span class="tree-label">Добавить бренд</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Панель информации -->
      <div class="info-panel">
        <div v-if="!selected" class="empty-state">
          <div class="empty-icon">📂</div>
          <h3>Выберите элемент</h3>
          <p>Выберите категорию, бренд или модель в дереве слева</p>
        </div>

        <!-- Категория -->
        <div v-if="selected?.type === 'category'" class="info-content">
          <div class="info-header">
            <span class="info-icon">📁</span>
            <div>
              <h2>{{ selected.item.name }}</h2>
              <span class="info-type">Категория</span>
            </div>
          </div>

          <div class="info-stats">
            <div class="stat-card">
              <span class="stat-value">{{ getBrandCount(selected.item.id) }}</span>
              <span class="stat-label">Брендов</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ getModelCount(selected.item.id) }}</span>
              <span class="stat-label">Моделей</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ getProductCount(selected.item.id) }}</span>
              <span class="stat-label">Товаров</span>
            </div>
          </div>

          <div class="info-actions">
            <button class="btn-primary" @click="editCategory(selected.item)">Редактировать</button>
            <button class="btn-ghost" @click="openBrandModal(selected.item.id)">Добавить бренд</button>
          </div>
        </div>

        <!-- Бренд -->
        <div v-if="selected?.type === 'brand'" class="info-content">
          <div class="info-header">
            <span class="info-icon">🏷️</span>
            <div>
              <h2>{{ selected.item.name }}</h2>
              <span class="info-type">Бренд</span>
            </div>
          </div>

          <div class="info-meta">
            <div class="meta-row">
              <span class="meta-label">Категория:</span>
              <span class="meta-value">{{ getCategoryName(selected.item.categoryId) }}</span>
            </div>
            <div v-if="selected.item.description" class="meta-row">
              <span class="meta-label">Описание:</span>
              <span class="meta-value">{{ selected.item.description }}</span>
            </div>
            <div v-if="selected.item.website" class="meta-row">
              <span class="meta-label">Сайт:</span>
              <a :href="selected.item.website" target="_blank" class="meta-link">{{ selected.item.website }}</a>
            </div>
          </div>

          <div class="info-stats">
            <div class="stat-card">
              <span class="stat-value">{{ getModelCountForBrand(selected.item.id) }}</span>
              <span class="stat-label">Моделей</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ getProductCountForBrand(selected.item.name) }}</span>
              <span class="stat-label">Товаров</span>
            </div>
          </div>

          <div class="info-actions">
            <button class="btn-primary" @click="editBrand(selected.item)">Редактировать</button>
            <button class="btn-ghost" @click="openModelModal(selected.item.categoryId, selected.item.id)">Добавить модель</button>
          </div>
        </div>

        <!-- Модель -->
        <div v-if="selected?.type === 'model'" class="info-content">
          <div class="info-header">
            <span class="info-icon">📦</span>
            <div>
              <h2>{{ selected.item.name }}</h2>
              <span class="info-type">Модель</span>
            </div>
          </div>

          <div class="info-meta">
            <div class="meta-row">
              <span class="meta-label">Бренд:</span>
              <span class="meta-value">{{ getBrandName(selected.item.id) }}</span>
            </div>
            <div class="meta-row">
              <span class="meta-label">Категория:</span>
              <span class="meta-value">{{ getCategoryNameByModel(selected.item.id) }}</span>
            </div>
          </div>

          <div class="info-stats">
            <div class="stat-card">
              <span class="stat-value">{{ getProductCountForModel(selected.item.id) }}</span>
              <span class="stat-label">Товаров</span>
            </div>
          </div>

          <div class="info-actions">
            <button class="btn-primary" @click="editModel(selected.item)">Редактировать</button>
            <button class="btn-primary" @click="openProductModal(selected.item)">Добавить товар</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальные окна (категория, бренд, модель) -->
    <div v-if="showCategoryModal" class="modal-overlay" @click.self="showCategoryModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingCategory ? 'Редактировать категорию' : 'Новая категория' }}</h2>
          <button class="btn-close" @click="showCategoryModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveCategory" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="categoryForm.name" type="text" class="input" required />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showCategoryModal = false">Отмена</button>
            <button type="submit" class="btn-primary">{{ editingCategory ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showBrandModal" class="modal-overlay" @click.self="showBrandModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingBrand ? 'Редактировать бренд' : 'Новый бренд' }}</h2>
          <button class="btn-close" @click="showBrandModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveBrand" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="brandForm.name" type="text" class="input" required />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="brandForm.description" class="input" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Веб-сайт</label>
            <input v-model="brandForm.website" type="url" class="input" placeholder="https://example.com" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showBrandModal = false">Отмена</button>
            <button type="submit" class="btn-primary">{{ editingBrand ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showModelModal" class="modal-overlay" @click.self="showModelModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingModel ? 'Редактировать модель' : 'Новая модель' }}</h2>
          <button class="btn-close" @click="showModelModal = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form @submit.prevent="saveModel" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input v-model="modelForm.name" type="text" class="input" placeholder="Galaxy S25 Ultra" required />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-ghost" @click="showModelModal = false">Отмена</button>
            <button type="submit" class="btn-primary">{{ editingModel ? 'Сохранить' : 'Создать' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores'
import api from '@/api/axios'

const router = useRouter()
const adminStore = useAdminStore()

const categories = ref<any[]>([])
const brands = ref<any[]>([])
const models = ref<any[]>([])
const products = ref<any[]>([])

const expandedCategories = ref<string[]>([])
const expandedBrands = ref<string[]>([])
const treeSearch = ref('')

const selected = ref<{ type: string; item: any; id: string } | null>(null)

const showCategoryModal = ref(false)
const showBrandModal = ref(false)
const showModelModal = ref(false)
const editingCategory = ref<any>(null)
const editingBrand = ref<any>(null)
const editingModel = ref<any>(null)

const categoryForm = ref({ name: '' })
const brandForm = ref({ name: '', description: '', website: '', categoryId: '' })
const modelForm = ref({ name: '', brandId: '', categoryId: '' })

const filteredCategories = computed(() => {
  if (!treeSearch.value) return categories.value
  const q = treeSearch.value.toLowerCase()
  return categories.value.filter((c) => c.name.toLowerCase().includes(q))
})

const getBrandsForCategory = (categoryId: string) => {
  const result = brands.value.filter((b) => b.categoryId === categoryId)
  console.log('getBrandsForCategory', { categoryId, result })
  return result
}

const getModelsForBrand = (brandId: string) => {
  // Поддержка обоих форматов: новые модели с brandId и старые с subcategoryId
  const result = models.value.filter((m) => {
    if (m.brandId) return m.brandId === brandId
    // Для старых моделей: brandId = subcategoryId (бренд как подкатегория)
    if (m.subcategoryId) return m.subcategoryId === brandId
    return false
  })
  console.log('getModelsForBrand', { brandId, result })
  return result
}

const getCategoryName = (categoryId: string) => {
  return categories.value.find((c) => c.id === categoryId)?.name || categoryId
}

const getBrandName = (modelId: string) => {
  const model = models.value.find((m) => m.id === modelId)
  if (!model) return ''
  // Поддержка обоих форматов
  const brandId = model.brandId || model.subcategoryId
  return brands.value.find((b) => b.id === brandId)?.name || ''
}

const getCategoryNameByModel = (modelId: string) => {
  const model = models.value.find((m) => m.id === modelId)
  if (!model) return ''
  return categories.value.find((c) => c.id === model.categoryId)?.name || ''
}

const getBrandCount = (categoryId: string) => brands.value.filter((b) => b.categoryId === categoryId).length
const getModelCount = (categoryId: string) => {
  return models.value.filter((m) => {
    if (m.categoryId) return m.categoryId === categoryId
    // Для старых моделей: categoryId = subcategoryId
    if (m.subcategoryId) return m.subcategoryId.startsWith(categoryId.replace('cat', 'sub'))
    return false
  }).length
}
const getProductCount = (categoryId: string) => products.value.filter((p) => p.categoryId === categoryId).length
const getModelCountForBrand = (brandId: string) => models.value.filter((m) => m.brandId === brandId).length
const getProductCountForBrand = (brandName: string) => products.value.filter((p) => p.brand === brandName).length
const getProductCountForModel = (modelId: string) => products.value.filter((p) => p.modelId === modelId).length

const toggleCategory = (id: string) => {
  const idx = expandedCategories.value.indexOf(id)
  if (idx > -1) {
    expandedCategories.value.splice(idx, 1)
  } else {
    expandedCategories.value.push(id)
  }
}

const toggleBrand = (id: string) => {
  const idx = expandedBrands.value.indexOf(id)
  if (idx > -1) {
    expandedBrands.value.splice(idx, 1)
  } else {
    expandedBrands.value.push(id)
  }
}

const expandAll = () => {
  expandedCategories.value = categories.value.map((c) => c.id)
  expandedBrands.value = brands.value.map((b) => b.id)
}

const collapseAll = () => {
  expandedCategories.value = []
  expandedBrands.value = []
}

const selectNode = (type: string, item: any) => {
  selected.value = { type, item, id: item.id }
}

const openCategoryModal = () => {
  editingCategory.value = null
  categoryForm.value = { name: '' }
  showCategoryModal.value = true
}

const editCategory = (cat: any) => {
  editingCategory.value = cat
  categoryForm.value = { name: cat.name }
  showCategoryModal.value = true
}

const saveCategory = async () => {
  try {
    if (editingCategory.value) {
      await adminStore.updateCategory(editingCategory.value.id, categoryForm.value)
    } else {
      await adminStore.createCategory(categoryForm.value)
    }
    showCategoryModal.value = false
    await loadCatalog()
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Ошибка')
  }
}

const openBrandModal = (categoryId: string) => {
  editingBrand.value = null
  brandForm.value = { name: '', description: '', website: '', categoryId }
  showBrandModal.value = true
}

const editBrand = (brand: any) => {
  editingBrand.value = brand
  brandForm.value = { name: brand.name, description: brand.description || '', website: brand.website || '', categoryId: brand.categoryId }
  showBrandModal.value = true
}

const saveBrand = async () => {
  try {
    console.log('Saving brand:', brandForm.value)
    if (editingBrand.value) {
      await adminStore.updateBrand(editingBrand.value.id, brandForm.value)
    } else {
      await adminStore.createBrand(brandForm.value)
    }
    showBrandModal.value = false
    await loadCatalog()
  } catch (err: any) {
    console.error('Brand error:', err)
    alert(err?.response?.data?.error || 'Ошибка')
  }
}

const openModelModal = (categoryId: string, brandId: string) => {
  editingModel.value = null
  const brand = brands.value.find((b: any) => b.id === brandId)
  modelForm.value = { name: '', brandId: brandId, categoryId: categoryId }
  console.log('Opening model modal:', { categoryId, brandId, brandName: brand?.name })
  showModelModal.value = true
}

const editModel = (model: any) => {
  editingModel.value = model
  modelForm.value = { name: model.name, brandId: model.brandId, categoryId: model.categoryId }
  showModelModal.value = true
}

const saveModel = async () => {
  try {
    if (editingModel.value) {
      const res = await api.put(`/admin/models/${editingModel.value.id}`, modelForm.value)
      console.log('Model updated:', res.data)
    } else {
      const res = await api.post('/admin/models', modelForm.value)
      console.log('Model created:', res.data)
    }
    showModelModal.value = false
    await loadCatalog()
  } catch (err: any) {
    console.error('Model save error:', err)
    alert(err?.response?.data?.error || 'Ошибка')
  }
}

const openProductModal = (model: any) => {
  router.push(`/admin/products/new?modelId=${model.id}&categoryId=${model.categoryId || model.subcategoryId}`)
}

const loadCatalog = async () => {
  await Promise.all([adminStore.fetchCategories(), adminStore.fetchBrands()])
  categories.value = adminStore.categories.items
  brands.value = adminStore.brands.items

  try {
    const modelsRes = await api.get('/admin/models')
    models.value = modelsRes.data.models || []
    console.log('Models loaded:', models.value)
    
    const catalogRes = await api.get('/catalog')
    products.value = Object.values(catalogRes.data.products || {})
  } catch (err) {
    console.error('Failed to load catalog:', err)
  }
}

onMounted(() => {
  loadCatalog()
})
</script>

<style scoped>
.catalog-admin { display: flex; flex-direction: column; gap: 20px; height: calc(100vh - 100px); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }
.header-actions { display: flex; gap: 8px; }

.catalog-layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; flex: 1; min-height: 0; }

/* Tree Panel */
.tree-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; display: flex; flex-direction: column; overflow: hidden; }
.tree-toolbar { padding: 12px; border-bottom: 1px solid var(--color-border); }
.search-box { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; }
.search-box svg { width: 14px; height: 14px; color: var(--color-text-tertiary); }
.search-box input { border: none; outline: none; font-size: 12px; background: transparent; color: var(--color-text-primary); width: 100%; }

.tree-container { flex: 1; overflow-y: auto; padding: 8px; }
.tree-node { margin-left: 0; }
.tree-children { margin-left: 16px; }
.tree-item { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-radius: 6px; cursor: pointer; font-size: 13px; color: var(--color-text-secondary); transition: all 0.1s; }
.tree-item:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.tree-item.selected { background: var(--color-primary-light, #DBEAFE); color: var(--color-primary); }
.tree-item.add-item { color: var(--color-text-tertiary); font-style: italic; }
.tree-item.add-item:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.tree-toggle { display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border: none; background: transparent; cursor: pointer; color: var(--color-text-tertiary); padding: 0; }
.tree-toggle svg { width: 12px; height: 12px; }
.tree-toggle-placeholder { width: 18px; }
.tree-label { flex: 1; }
.tree-action { opacity: 0; padding: 2px 6px; border: none; background: transparent; cursor: pointer; font-size: 12px; }
.tree-item:hover .tree-action { opacity: 1; }
.tree-action:hover { background: var(--color-surface-secondary, #F9FAFB); border-radius: 4px; }

/* Info Panel */
.info-panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; padding: 24px; overflow-y: auto; }
.empty-state { text-align: center; padding: 60px 20px; color: var(--color-text-secondary); }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.empty-state p { margin: 0; font-size: 14px; }

.info-content { display: flex; flex-direction: column; gap: 20px; }
.info-header { display: flex; align-items: center; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); }
.info-icon { font-size: 32px; }
.info-header h2 { margin: 0; font-size: 20px; font-weight: 600; }
.info-type { font-size: 12px; color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; }

.info-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card { background: var(--color-background); border: 1px solid var(--color-border); border-radius: 10px; padding: 16px; text-align: center; }
.stat-value { display: block; font-size: 24px; font-weight: 700; color: var(--color-primary); }
.stat-label { font-size: 12px; color: var(--color-text-tertiary); }

.info-meta { background: var(--color-background); border: 1px solid var(--color-border); border-radius: 10px; padding: 16px; }
.meta-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 13px; }
.meta-row:last-child { margin-bottom: 0; }
.meta-label { color: var(--color-text-tertiary); font-weight: 500; }
.meta-value { color: var(--color-text-primary); }
.meta-link { color: var(--color-primary); text-decoration: none; }
.meta-link:hover { text-decoration: underline; }

.info-actions { display: flex; gap: 8px; }

/* Modal */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
.modal { background: var(--color-surface); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.15); width: 90%; max-width: 420px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--color-border); }
.modal-header h2 { margin: 0; font-size: 17px; font-weight: 600; }
.btn-close { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border: none; background: var(--color-surface-secondary, #F9FAFB); border-radius: 8px; cursor: pointer; }
.btn-close svg { width: 16px; height: 16px; color: var(--color-text-secondary); }
.modal-body { padding: 24px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-group label { font-size: 13px; font-weight: 500; }
.input { padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 13px; font-family: inherit; background: var(--color-surface); color: var(--color-text-primary); outline: none; }
.input:focus { border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(37,99,235,0.08); }
.modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding-top: 16px; border-top: 1px solid var(--color-border-light, #F3F4F6); }

.btn-primary { display: flex; align-items: center; gap: 6px; padding: 9px 16px; background: var(--color-primary); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-ghost { padding: 8px 16px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; color: var(--color-text-primary); }
.btn-ghost:hover { background: var(--color-surface-secondary, #F9FAFB); }

@media (max-width: 900px) {
  .catalog-layout { grid-template-columns: 1fr; }
  .tree-panel { max-height: 300px; }
}
</style>
