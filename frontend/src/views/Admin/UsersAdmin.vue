<template>
  <div class="users-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Пользователи</h1>
        <p class="page-subtitle">{{ totalUsers }} пользователей</p>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="searchQuery" type="text" placeholder="Поиск по имени или email..." />
      </div>
    </div>

    <div v-if="loading" class="loading-state">Загрузка...</div>

    <div v-else-if="filteredUsers.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>
      </div>
      <h3>{{ searchQuery ? 'Ничего не найдено' : 'Нет пользователей' }}</h3>
    </div>

    <div v-else class="table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>Пользователь</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Дата</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user._id || user.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar">{{ (user.firstName || user.email)[0]?.toUpperCase() }}</div>
                <span class="user-name">{{ user.firstName || user.email }}</span>
              </div>
            </td>
            <td class="muted">{{ user.email }}</td>
            <td>
              <select
                :value="user.role"
                :class="['role-select', user.role]"
                @change="changeRole(user, ($event.target as HTMLSelectElement).value)"
              >
                <option value="user">Пользователь</option>
                <option value="admin">Админ</option>
              </select>
            </td>
            <td class="muted">{{ formatDate(user.createdAt) }}</td>
            <td>
              <button class="btn-icon btn-icon-danger" title="Удалить" @click="deleteUserHandler(user)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
const searchQuery = ref('')
const loading = ref(false)
const page = ref(1)
const totalUsers = ref(0)
const limit = 20

const totalPages = computed(() => Math.ceil(totalUsers.value / limit) || 1)

const filteredUsers = computed(() => {
  const items = adminStore.users.items
  if (!searchQuery.value) return items
  const q = searchQuery.value.toLowerCase()
  return items.filter((u: any) => u.firstName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
})

const formatDate = (date: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

const loadUsers = async () => {
  loading.value = true
  try {
    await adminStore.fetchUsers(page.value)
    totalUsers.value = adminStore.users.total || adminStore.users.items.length
  } finally {
    loading.value = false
  }
}

const changePage = (p: number) => {
  page.value = p
  loadUsers()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const changeRole = async (user: any, role: string) => {
  try {
    await adminStore.updateUserRole(user._id || user.id, role)
    user.role = role
  } catch (err) {
    console.error('Error changing role:', err)
  }
}

const deleteUserHandler = async (user: any) => {
  if (!confirm('Удалить пользователя?')) return
  try {
    await adminStore.deleteUser(user._id || user.id)
    await loadUsers()
  } catch (err) {
    console.error('Error deleting user:', err)
  }
}

onMounted(() => { loadUsers() })
</script>

<style scoped>
.users-admin { display: flex; flex-direction: column; gap: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 22px; font-weight: 600; color: var(--color-text-primary); margin: 0; letter-spacing: -0.01em; }
.page-subtitle { margin: 4px 0 0; font-size: 13px; color: var(--color-text-tertiary); }

.toolbar { display: flex; gap: 10px; align-items: center; }
.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 8px; flex: 1; max-width: 340px; }
.search-box svg { width: 16px; height: 16px; color: var(--color-text-tertiary); flex-shrink: 0; }
.search-box input { border: none; outline: none; font-size: 13px; background: transparent; color: var(--color-text-primary); width: 100%; }

.table-wrapper { overflow-x: auto; }
.users-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.users-table th { text-align: left; padding: 10px 12px; color: var(--color-text-tertiary); font-weight: 500; font-size: 12px; border-bottom: 1px solid var(--color-border); }
.users-table td { padding: 10px 12px; border-bottom: 1px solid var(--color-border-light, #F3F4F6); }
.users-table tr:hover { background: var(--color-surface-secondary, #F9FAFB); }

.user-cell { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--color-primary-light, #DBEAFE); color: var(--color-primary);
  font-size: 13px; font-weight: 600; flex-shrink: 0;
}
.user-name { font-weight: 500; }
.muted { color: var(--color-text-tertiary); }

.role-select { padding: 5px 10px; border-radius: 6px; border: 1px solid var(--color-border); font-size: 12px; font-weight: 500; cursor: pointer; outline: none; background: var(--color-surface); color: var(--color-text-primary); }
.role-select.admin { border-color: #7C3AED; background: #F3E8FF; color: #5B21B6; }

.btn-icon {
  display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; color: var(--color-text-tertiary);
}
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon-danger:hover { background: var(--color-error-light, #FEE2E2); color: var(--color-error); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 14px; background: var(--color-surface-secondary, #F9FAFB); margin-bottom: 16px; }
.empty-icon svg { width: 24px; height: 24px; color: var(--color-text-tertiary); }
.empty-state h3 { margin: 0; font-size: 16px; font-weight: 600; }
.loading-state { padding: 40px; text-align: center; color: var(--color-text-tertiary); }

.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; }
.btn-page { padding: 8px 14px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); font-size: 13px; cursor: pointer; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info { font-size: 13px; color: var(--color-text-tertiary); }
</style>
