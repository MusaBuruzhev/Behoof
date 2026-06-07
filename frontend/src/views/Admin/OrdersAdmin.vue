<template>
  <div class="orders-admin">
    <div class="header">
      <h1 class="title">Управление заказами</h1>
    </div>

    <DataTable
      :columns="columns"
      :items="adminStore.orders.items"
      :is-loading="adminStore.orders.isLoading"
      :current-page="adminStore.orders.page"
      :total-pages="Math.ceil(adminStore.orders.total / 20)"
      @page-change="handlePageChange"
    >
      <template #cell-status="{ item }">
        <select :value="item.status" class="status-select" @change="e => changeStatus(item, (e.target as HTMLSelectElement).value)">
          <option value="pending">В ожидании</option>
          <option value="confirmed">Подтвержден</option>
          <option value="ready">Готов</option>
          <option value="completed">Завершен</option>
          <option value="cancelled">Отменен</option>
        </select>
      </template>

      <template #cell-totalAmount="{ item }">
        {{ formatPrice(item.totalAmount) }} ₽
      </template>

      <template #cell-createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>

      <template #actions="{ item }">
        <button class="btn btn-small btn-secondary" @click="viewOrder(item)">
          Просмотр
        </button>
        <button class="btn btn-small btn-danger" @click="deleteOrder(item._id)">
          Удалить
        </button>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores'
import { useRouter } from 'vue-router'
import DataTable from '@/components/admin/DataTable.vue'

const adminStore = useAdminStore()
const router = useRouter()

const columns = [
  { key: 'id', label: 'ID заказа' },
  { key: 'status', label: 'Статус' },
  { key: 'totalAmount', label: 'Сумма' },
  { key: 'createdAt', label: 'Дата' },
]

const formatPrice = (price: number | undefined | null) => {
  if (price === undefined || price === null) return '0'
  return price.toLocaleString('ru-RU')
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('ru-RU')
}

const handlePageChange = (page: number) => {
  adminStore.fetchOrders(page)
}

const changeStatus = async (order: any, status: string) => {
  try {
    await adminStore.updateOrderStatus(order.id, status)
  } catch (error) {
    console.error('Error changing status:', error)
  }
}

const deleteOrder = async (id: string) => {
  if (confirm('Вы уверены?')) {
    try {
      await adminStore.deleteOrder(id)
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }
}

const viewOrder = (order: any) => {
  router.push(`/admin/orders/${order._id}`)
}

onMounted(() => {
  adminStore.fetchOrders()
})
</script>

<style scoped>
.orders-admin {
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

.status-select {
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
</style>
