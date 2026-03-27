<template>
 <div class="orders-page">
 <div class="container">
 <h1>📦 Мои заказы</h1>

 <div v-if="loading" class="loading">Загрузка заказов...</div>

 <div v-else-if="orders.length ===0" class="empty">
 <p>У вас пока нет заказов.</p>
 <router-link to="/catalog" class="go-catalog">Перейти в каталог</router-link>
 </div>

 <div v-else class="orders-grid">
 <article v-for="order in orders" :key="order.id" class="order-card">
 <div class="order-head">
 <strong>Заказ {{ order.id }}</strong>
 <span :class="['status', `status-${order.status}`]">
 {{ statusLabel(order.status) }}
 </span>
 </div>

 <div class="order-body">
 <p><strong>Товар:</strong> {{ order.product?.name || 'Товар удалён' }}</p>
 <p><strong>Бренд:</strong> {{ order.product?.brand || '—' }}</p>
 <p><strong>Цена:</strong> {{ order.product?.price ?? '—' }} ₽</p>
 <p><strong>Забрать:</strong> {{ formatDate(order.pickupAt) }}</p>
 <p><strong>Телефон:</strong> {{ order.contactPhone || 'Не указан' }}</p>
 <p v-if="order.comment"><strong>Комментарий:</strong> {{ order.comment }}</p>
 </div>
 </article>
 </div>
 </div>
 </div>
</template>

<script>
import ordersAPI from '@/api/orders.js';

export default {
 name: 'OrdersView',
 data() {
 return {
 orders: [],
 loading: true,
 };
 },
 async mounted() {
 await this.loadOrders();
 },
 methods: {
 async loadOrders() {
 try {
 this.loading = true;
 const data = await ordersAPI.getMyOrders();
 this.orders = data.orders || [];
 } catch (error) {
 console.error('Ошибка загрузки заказов:', error);
 } finally {
 this.loading = false;
 }
 },
 statusLabel(status) {
 const map = {
 pending: 'Ожидает подтверждения',
 confirmed: 'Подтверждён',
 ready: 'Готов к выдаче',
 completed: 'Получен',
 cancelled: 'Отменён',
 };
 return map[status] || status;
 },
 formatDate(date) {
 return new Date(date).toLocaleString('ru-RU');
 },
 },
};
</script>

<style scoped>
.orders-page {
 min-height:100vh;
 background: #f8f9fa;
 padding:24px0;
}

.container {
 width:85%;
 margin:0 auto;
}

.loading,
.empty {
 background: #fff;
 padding:24px;
 border-radius:10px;
}

.go-catalog {
 color: #ff4d4d;
}

.orders-grid {
 display: grid;
 grid-template-columns: repeat(auto-fill, minmax(320px,1fr));
 gap:16px;
}

.order-card {
 background: #fff;
 border-radius:12px;
 padding:16px;
}

.order-head {
 display: flex;
 justify-content: space-between;
 margin-bottom:10px;
}

.status {
 font-size:12px;
 padding:4px8px;
 border-radius:8px;
}

.status-pending { background: #fff3cd; color: #856404; }
.status-confirmed { background: #d1ecf1; color: #0c5460; }
.status-ready { background: #d4edda; color: #155724; }
.status-completed { background: #e2e3e5; color: #383d41; }
.status-cancelled { background: #f8d7da; color: #721c24; }
</style>
