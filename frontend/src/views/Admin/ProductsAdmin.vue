<template>
  <div class="products-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Товары</h1>
        <p class="page-subtitle">{{ totalProducts }} товаров</p>
      </div>
      <router-link to="/admin/products/new" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Добавить товар
      </router-link>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" placeholder="Поиск по названию или бренду..." @input="debouncedSearch" />
      </div>
      <select v-model="filterCategory" class="filter-select" @change="loadProducts">
        <option value="">Все категории</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
      </select>
      <select v-model="filterStatus" class="filter-select" @change="loadProducts">
        <option value="">Все статусы</option>
        <option value="published">Опубликованные</option>
        <option value="draft">Черновики</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">Загрузка...</div>

    <!-- Table -->
    <div v-else-if="products.length > 0" class="table-wrapper">
      <table class="products-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Категория</th>
            <th>Бренд</th>
            <th>Цена</th>
            <th>Статус</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in products" :key="product.id" class="product-row">
            <td>
              <div class="product-cell">
                <div class="product-image">
                  <img v-if="product.images?.[0]" :src="getImageUrl(product.images[0])" alt="" />
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/></svg>
                </div>
                <div class="product-info">
                  <span class="product-name">{{ product.name }}</span>
                  <span class="product-sku" v-if="product.sku">{{ product.sku }}</span>
                </div>
              </div>
            </td>
            <td class="muted">{{ getCategoryName(product.categoryId) }}</td>
            <td>{{ product.brand }}</td>
            <td class="price-cell">{{ formatPrice(product.priceHistory?.[product.priceHistory.length - 1]?.price) }} ₽</td>
            <td>
              <span :class="['status-badge', product.status || 'published']">
                {{ product.status === 'draft' ? 'Черновик' : 'Опубл.' }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <router-link :to="`/admin/products/${product.id}`" class="btn-icon" title="Редактировать">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </router-link>
                <button class="btn-icon btn-icon-danger" @click="deleteProductHandler(product.id)" title="Удалить">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
      </div>
      <h3>Нет товаров</h3>
      <p>Добавьте первый товар через мастер создания</p>
      <router-link to="/admin/products/new" class="btn-primary">Добавить товар</router-link>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)" class="btn-page">←</button>
      <span class="page-info">{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)" class="btn-page">→</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores'

const adminStore = useAdminStore()

const search = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const page = ref(1)
const limit = 20
let searchTimer: ReturnType<typeof setTimeout> | null = null

const loading = ref(false)
const totalProducts = ref(0)
const products = ref<any[]>([])
const categories = ref<any[]>([])

const totalPages = computed(() => Math.ceil(totalProducts.value / limit) || 1)

const getCategoryName = (catId: string) => {
  return categories.value.find((c) => c.id === catId)?.name || catId
}

const getImageUrl = (path: string) => {
  if (path.startsWith('/uploads/')) {
    return 'http://localhost:5000' + path
  }
  return path
}

const formatPrice = (price: number) => {
  if (!price && price !== 0) return '0'
  return price.toLocaleString('ru-RU')
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params: any = { page: page.value, limit }
    if (search.value) params.q = search.value
    if (filterCategory.value) params.categoryId = filterCategory.value
    if (filterStatus.value) params.status = filterStatus.value

    const axios = (await import('@/api/axios')).default
    const res = await axios.get('/products', { params })
    products.value = res.data.items || res.data.products || []
    totalProducts.value = res.data.total || products.value.length
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loading.value = false
  }
}

const debouncedSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    loadProducts()
  }, 300)
}

const changePage = (p: number) => {
  page.value = p
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteProductHandler = async (id: string) => {
  if (!confirm('Удалить товар?')) return
  try {
    await adminStore.deleteProduct(id)
    await loadProducts()
  } catch (err: any) {
    alert(err?.response?.data?.error || 'Ошибка удаления')
  }
}

onMounted(async () => {
  await adminStore.fetchCategories()
  categories.value = adminStore.categories.items
  await loadProducts()
})
</script>

<style scoped>
.products-admin { display: flex; flex-direction: column; gap: 20px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

/* Buttons */
.btn-primary {
  display: flex; align-items: center; gap: 6px; padding: 9px 16px;
  background: var(--color-primary); color: white; border: none; border-radius: 8px;
  font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; text-decoration: none; white-space: nowrap;
}
.btn-primary:hover { background: var(--color-primary-dark); }
.btn-primary svg { width: 16px; height: 16px; }

/* Toolbar */
.toolbar { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; flex: 1; min-width: 200px; max-width: 340px; }
.search-box svg { width: 16px; height: 16px; color: var(--color-text-tertiary); flex-shrink: 0; }
.search-box input { border: none; outline: none; font-size: 13px; background: transparent; color: var(--color-text-primary); width: 100%; }
.filter-select { padding: 8px 12px; border: 1px solid var(--color-border); border-radius: 8px; font-size: 13px; background: var(--color-surface); color: var(--color-text-primary); outline: none; cursor: pointer; }

/* Table */
.table-wrapper { overflow-x: auto; }
.products-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.products-table th { text-align: left; padding: 10px 12px; color: var(--color-text-tertiary); font-weight: 500; font-size: 12px; border-bottom: 1px solid var(--color-border); }
.products-table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border-light, #F3F4F6); }
.product-row:hover { background: var(--color-surface-secondary, #F9FAFB); }

.product-cell { display: flex; align-items: center; gap: 12px; }
.product-image {
  width: 40px; height: 40px; border-radius: 8px; overflow: hidden;
  background: var(--color-surface-secondary, #F9FAFB); border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.product-image img { width: 100%; height: 100%; object-fit: cover; }
.product-image svg { width: 18px; height: 18px; color: var(--color-text-tertiary); }
.product-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.product-name { font-weight: 500; color: var(--color-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-sku { font-size: 11px; color: var(--color-text-tertiary); font-family: 'JetBrains Mono', monospace; }

.muted { color: var(--color-text-tertiary); }
.price-cell { font-weight: 500; white-space: nowrap; }

.status-badge { font-size: 11px; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
.status-badge.published { background: #D1FAE5; color: #065F46; }
.status-badge.draft { background: #FEF3C7; color: #92400E; }

.row-actions { display: flex; gap: 2px; }
.btn-icon {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--color-text-tertiary);
  transition: all 0.15s; text-decoration: none;
}
.btn-icon:hover { background: var(--color-surface-secondary, #F9FAFB); color: var(--color-text-primary); }
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon-danger:hover { background: var(--color-error-light, #FEE2E2); color: var(--color-error); }

/* Empty */
.empty-state { text-align: center; padding: 60px 20px; color: var(--color-text-secondary); }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-surface-secondary, #F9FAFB); margin-bottom: 16px; }
.empty-icon svg { width: 24px; height: 24px; color: var(--color-text-tertiary); }
.empty-state h3 { margin: 0 0 8px; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
.empty-state p { margin: 0 0 20px; font-size: 14px; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-page { padding: 8px 14px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; color: var(--color-text-primary); }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-page:hover:not(:disabled) { background: var(--color-surface-secondary, #F9FAFB); }
.page-info { font-size: 13px; color: var(--color-text-tertiary); }

.loading-state { padding: 40px; text-align: center; color: var(--color-text-tertiary); }
</style>
