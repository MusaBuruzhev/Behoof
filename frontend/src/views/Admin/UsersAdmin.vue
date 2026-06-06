<template>
  <div class="users-admin">
    <div class="header">
      <h1 class="title">Управление пользователями</h1>
    </div>

    <div class="controls">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск пользователей..."
        class="search-input"
      />
    </div>

    <DataTable
      :columns="columns"
      :items="filteredUsers"
      :is-loading="adminStore.users.isLoading"
      :current-page="adminStore.users.page"
      :total-pages="Math.ceil(adminStore.users.total / 20)"
      @page-change="handlePageChange"
    >
      <template #cell-role="{ item }">
        <select :value="item.role" class="role-select" @change="e => changeRole(item, (e.target as HTMLSelectElement).value)">
          <option value="user">Пользователь</option>
          <option value="admin">Админ</option>
        </select>
      </template>

      <template #cell-createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>

      <template #actions="{ item }">
        <button class="btn btn-small btn-danger" @click="deleteUser(item._id)">
          Удалить
        </button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores'
import DataTable from '@/components/admin/DataTable.vue'

const adminStore = useAdminStore()
const searchQuery = ref('')

const columns = [
  { key: 'firstName', label: 'Имя' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Роль' },
  { key: 'createdAt', label: 'Дата регистрации' },
]

const filteredUsers = computed(() => {
  if (!searchQuery.value) return adminStore.users.items
  const q = searchQuery.value.toLowerCase()
  return adminStore.users.items.filter(
    u =>
      u.firstName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
  )
})

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const handlePageChange = (page: number) => {
  adminStore.fetchUsers(page)
}

const changeRole = async (user: any, role: string) => {
  try {
    await adminStore.updateUserRole(user._id, role)
  } catch (error) {
    console.error('Error changing role:', error)
  }
}

const deleteUser = async (id: string) => {
  if (confirm('Вы уверены?')) {
    try {
      await adminStore.deleteUser(id)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
}

onMounted(() => {
  adminStore.fetchUsers()
})
</script>

<style scoped>
.users-admin {
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

.role-select {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 14px;
  cursor: pointer;
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

.btn-small {
  padding: var(--spacing-2) var(--spacing-3);
  font-size: 12px;
}

.btn-danger {
  background-color: #FEE2E2;
  color: var(--color-error);
}

.btn-danger:hover {
  background-color: #FCA5A5;
}
</style>
