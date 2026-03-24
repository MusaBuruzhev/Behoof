<template>
 <div class="admin-page">
 <div class="container">
 <h1>⚙️ Панель администратора</h1>

 <section class="stats" v-if="stats">
 <div class="card"><strong>{{ stats.usersCount }}</strong><span>Пользователей</span></div>
 <div class="card"><strong>{{ stats.adminsCount }}</strong><span>Админов</span></div>
 <div class="card"><strong>{{ stats.productsCount }}</strong><span>Товаров</span></div>
 <div class="card"><strong>{{ stats.ordersCount }}</strong><span>Заказов</span></div>
 <div class="card"><strong>{{ stats.pendingOrdersCount }}</strong><span>Ожидают</span></div>
 </section>

 <section class="admin-block">
 <h2>Пользователи</h2>
 <div class="table-wrap">
 <table>
 <thead>
 <tr>
 <th>Email</th>
 <th>Имя</th>
 <th>Роль</th>
 <th>Действия</th>
 </tr>
 </thead>
 <tbody>
 <tr v-for="user in users" :key="user._id">
 <td>{{ user.email }}</td>
 <td>{{ user.firstName }} {{ user.lastName }}</td>
 <td>{{ user.role }}</td>
 <td class="actions">
 <button
 @click="toggleRole(user)"
 :disabled="currentUserId === user._id"
 >
 {{ user.role === 'admin' ? 'Сделать user' : 'Сделать admin' }}
 </button>
 <button class="danger" @click="removeUser(user)" :disabled="currentUserId === user._id">
 Удалить
 </button>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>

 <section class="admin-block">
 <h2>Заказы</h2>
 <div class="table-wrap">
 <table>
 <thead>
 <tr>
 <th>ID</th>
 <th>Пользователь</th>
 <th>Товар</th>
 <th>Самовывоз</th>
 <th>Статус</th>
 </tr>
 </thead>
 <tbody>
 <tr v-for="order in orders" :key="order.id">
 <td>{{ order.id }}</td>
 <td>{{ order.userId?.email || '—' }}</td>
 <td>{{ order.product?.name || 'Товар удалён' }}</td>
 <td>{{ formatDate(order.pickupAt) }}</td>
 <td>
 <select :value="order.status" @change="changeOrderStatus(order, $event.target.value)">
 <option value="pending">pending</option>
 <option value="confirmed">confirmed</option>
 <option value="ready">ready</option>
 <option value="completed">completed</option>
 <option value="cancelled">cancelled</option>
 </select>
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </section>
 </div>
 </div>
</template>

<script>
import authAPI from '@/api/auth.js';
import ordersAPI from '@/api/orders.js';

export default {
 name: 'AdminPanelView',
 data() {
 return {
 stats: null,
 users: [],
 orders: [],
 currentUserId: authAPI.getCurrentUser()?._id,
 };
 },
 async mounted() {
 await this.loadAll();
 },
 methods: {
 async loadAll() {
 await Promise.all([this.loadStats(), this.loadUsers(), this.loadOrders()]);
 },
 async loadStats() {
 const data = await authAPI.getAdminStats();
 this.stats = data;
 },
 async loadUsers() {
 const data = await authAPI.getAdminUsers();
 this.users = data.users || [];
 },
 async loadOrders() {
 const data = await ordersAPI.getAllOrdersAdmin();
 this.orders = data.orders || [];
 },
 async toggleRole(user) {
 const targetRole = user.role === 'admin' ? 'user' : 'admin';
 await authAPI.updateUserRole(user._id, targetRole);
 await this.loadUsers();
 await this.loadStats();
 },
 async removeUser(user) {
 if (!confirm(`Удалить пользователя ${user.email}?`)) return;
 await authAPI.deleteUserByAdmin(user._id);
 await this.loadUsers();
 await this.loadStats();
 },
 async changeOrderStatus(order, status) {
 await ordersAPI.updateOrderStatusAdmin(order.id, status);
 await this.loadOrders();
 await this.loadStats();
 },
 formatDate(date) {
 return new Date(date).toLocaleString('ru-RU');
 },
 },
};
</script>

<style scoped>
.admin-page {
 min-height:100vh;
 background:#f8f9fa;
 padding:24px0;
}

.container {
 width:90%;
 margin:0 auto;
}

.stats {
 display:grid;
 grid-template-columns:repeat(auto-fit, minmax(150px,1fr));
 gap:12px;
 margin-bottom:20px;
}

.card {
 background:#fff;
 border-radius:10px;
 padding:12px;
 display:flex;
 flex-direction:column;
 gap:4px;
}

.admin-block {
 background:#fff;
 border-radius:10px;
 padding:16px;
 margin-bottom:16px;
}

.table-wrap {
 overflow:auto;
}

table {
 width:100%;
 border-collapse:collapse;
}

th, td {
 border-bottom:1px solid #eee;
 padding:8px;
 text-align:left;
}

.actions {
 display:flex;
 gap:8px;
}

button.danger {
 background:#dc3545;
 color:#fff;
 border:none;
 border-radius:6px;
 padding:6px10px;
}
</style>
