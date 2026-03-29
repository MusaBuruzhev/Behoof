<template>
 <div class="orders-page">
 <div class="container">
 <h1>Мои заказы</h1>

 <div v-if="loading" class="loading">
 <div class="loading-spinner"></div>
 <p>Загрузка заказов...</p>
 </div>

 <div v-else-if="orders.length === 0" class="empty">
 <img src="/profIcon/l5.png" alt="Нет заказов" class="empty-icon-img" />
 <p>У вас пока нет заказов</p>
 <router-link to="/catalog" class="go-catalog">Перейти в каталог</router-link>
 </div>

 <div v-else class="orders-list">
 <article v-for="order in orders" :key="order.id" class="order-card">
 <div class="order-card-inner">
 <div class="order-image">
 <img 
 v-if="order.product?.images?.length" 
 :src="order.product.images[0]" 
 :alt="order.product?.name"
 >
 <div v-else class="no-image">
  <img src="/profIcon/l3.png" alt="Нет изображения" class="no-image-img" />
</div>
 </div>

 <div class="order-content">
 <div class="order-header">
 <span class="order-id">Заказ №{{ order.id }}</span>
 <span :class="['status-badge', `status-${order.status}`]">
 {{ statusLabel(order.status) }}
 </span>
 </div>

 <div class="product-info">
 <h3>{{ order.product?.name || 'Товар удалён' }}</h3>
 <p class="product-brand">{{ order.product?.brand || '—' }}</p>
 </div>

 <div class="order-details">
 <div class="detail-row">
 <span class="detail-label">Дата получения:</span>
 <span class="detail-value">{{ formatDate(order.pickupAt) }}</span>
 </div>
 <div class="detail-row">
 <span class="detail-label">Телефон:</span>
 <span class="detail-value">{{ order.contactPhone || 'Не указан' }}</span>
 </div>
 <div v-if="order.comment" class="detail-row">
 <span class="detail-label">Комментарий:</span>
 <span class="detail-value comment">{{ order.comment }}</span>
 </div>
 </div>

 <div class="order-footer">
 <span class="order-price">{{ order.product?.price ?? '—' }} ₽</span>
 <router-link 
 v-if="order.product?.id" 
 :to="`/product/${order.product.id}`" 
 class="view-product-btn"
 >
 Подробнее
 </router-link>
 </div>
 </div>
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
 pending: 'Ожидает',
 confirmed: 'Подтверждён',
 ready: 'Готов',
 completed: 'Получен',
 cancelled: 'Отменён',
 };
 return map[status] || status;
 },
 formatDate(date) {
 return new Date(date).toLocaleDateString('ru-RU', {
 weekday: 'short',
 day: 'numeric',
 month: 'long',
 hour: '2-digit',
 minute: '2-digit',
 });
 },
 },
};
</script>

<style scoped>
.orders-page {
 min-height: 100vh;
 background: #f5f7fa;
 padding: 30px 0;
}

.container {
 width: 85%;
 margin: 0 auto;
}

h1 {
 font-size: 32px;
 color: #263141;
 margin-bottom: 30px;
 font-weight: 700;
}

.loading {
 background: #fff;
 padding: 60px;
 border-radius: 16px;
 text-align: center;
}

.loading-spinner {
 width: 40px;
 height: 40px;
 border: 4px solid #f3f3f3;
 border-top: 4px solid #ff4d4d;
 border-radius: 50%;
 margin: 0 auto 20px;
 animation: spin 1s linear infinite;
}

@keyframes spin {
 0% { transform: rotate(0deg); }
 100% { transform: rotate(360deg); }
}

.empty {
 background: #fff;
 padding: 60px;
 border-radius: 16px;
 text-align: center;
}

.empty-icon {
 font-size: 64px;
 margin-bottom: 20px;
}

.empty-icon-img {
 width: 80px;
 height: 80px;
 object-fit: contain;
 margin-bottom: 20px;
}

.no-image-img {
 width: 60%;
 height: 60%;
 object-fit: contain;
}

.empty p {
 font-size: 18px;
 color: #666;
 margin-bottom: 20px;
}

.go-catalog {
 display: inline-block;
 padding: 14px 28px;
 background: #ff4d4d;
 color: white;
 text-decoration: none;
 border-radius: 10px;
 font-weight: 600;
 font-size: 16px;
 transition: all 0.3s;
}

.go-catalog:hover {
 background: #e63939;
 transform: translateY(-2px);
}

.orders-list {
 display: flex;
 flex-direction: column;
 gap: 20px;
}

.order-card {
 background: #fff;
 border-radius: 16px;
 overflow: hidden;
 box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
 transition: transform 0.3s, box-shadow 0.3s;
}

.order-card:hover {
 transform: translateY(-4px);
 box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.order-card-inner {
 display: flex;
}

.order-image {
 width: 180px;
 min-height: 180px;
 background: #f8f9fa;
 display: flex;
 align-items: center;
 justify-content: center;
 flex-shrink: 0;
}

.order-image img {
 width: 100%;
 height: 100%;
 object-fit: cover;
}

.no-image {
 font-size: 48px;
 opacity: 0.3;
}

.order-content {
 flex: 1;
 padding: 20px;
 display: flex;
 flex-direction: column;
}

.order-header {
 display: flex;
 justify-content: space-between;
 align-items: center;
 margin-bottom: 12px;
}

.order-id {
 font-size: 14px;
 color: #888;
 font-weight: 500;
}

.status-badge {
 padding: 6px 12px;
 border-radius: 20px;
 font-size: 13px;
 font-weight: 600;
}

.status-pending { background: #fff8e1; color: #f57c00; }
.status-confirmed { background: #e3f2fd; color: #1976d2; }
.status-ready { background: #e8f5e9; color: #388e3c; }
.status-completed { background: #f5f5f5; color: #616161; }
.status-cancelled { background: #ffebee; color: #d32f2f; }

.product-info {
 margin-bottom: 16px;
}

.product-info h3 {
 font-size: 20px;
 color: #263141;
 margin: 0 0 4px 0;
 font-weight: 600;
}

.product-brand {
 color: #666;
 font-size: 14px;
 margin: 0;
}

.order-details {
 flex: 1;
 display: flex;
 flex-direction: column;
 gap: 8px;
 margin-bottom: 16px;
}

.detail-row {
 display: flex;
 gap: 8px;
 font-size: 14px;
}

.detail-label {
 color: #888;
 min-width: 120px;
}

.detail-value {
 color: #263141;
 font-weight: 500;
}

.detail-value.comment {
 font-weight: 400;
 font-style: italic;
}

.order-footer {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding-top: 16px;
 border-top: 1px solid #eee;
}

.order-price {
 font-size: 24px;
 font-weight: 700;
 color: #ff4d4d;
}

.view-product-btn {
 padding: 10px 20px;
 background: #f5f7fa;
 color: #263141;
 text-decoration: none;
 border-radius: 8px;
 font-weight: 500;
 font-size: 14px;
 transition: all 0.3s;
}

.view-product-btn:hover {
 background: #ff4d4d;
 color: white;
}

@media (max-width: 640px) {
 .order-card-inner {
 flex-direction: column;
 }

 .order-image {
 width: 100%;
 height: 160px;
 }

 .detail-label {
 min-width: 100px;
 }
}
</style>
