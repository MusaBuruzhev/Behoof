<template>
 <div class="product-detail">
 <div v-if="loading" class="loading">Загрузка товара...</div>
 <div v-if="error" class="error">{{ error }}</div>

 <div class="product-detail-cont" v-if="!loading && !error">
 <div class="product-images">
 <div class="main-image-container">
 <button @click="prevImage" class="nav-arrow left-arrow" :disabled="product.images.length <= 1">‹</button>
 <div class="main-image">
 <img :src="currentImage" :alt="product.name" />
 </div>
 <button @click="nextImage" class="nav-arrow right-arrow" :disabled="product.images.length <= 1">›</button>
 </div>

 <div class="thumbnail-images">
 <img
 v-for="(image, index) in product.images"
 :key="index"
 :src="image"
 :alt="`${product.name} ${index + 1}`"
 @click="currentImage = image"
 :class="{ active: currentImage === image }"
 />
 </div>
 </div>

 <div class="product-info">
 <h1>{{ product.name }}</h1>
 <p class="brand">Бренд: {{ product.brand }}</p>

 <div class="price-section">
 <span class="current-price">{{ currentPrice }} ₽</span>
 </div>

 <div v-if="product.priceHistory && product.priceHistory.length >=5" class="price-history">
 <div class="chart-container">
 <PriceHistoryChart :priceHistory="product.priceHistory" />
 </div>
 </div>

 <div class="description">
 <h3>Описание</h3>
 <p>{{ product.description || 'Описание отсутствует' }}</p>
 </div>

 <div class="characteristics">
 <h3>Характеристики</h3>
 <div class="traits-list">
 <div v-for="char in product.characteristics" :key="char.trait" class="trait-item">
 <span class="trait-name">{{ char.trait }}</span>
 <span class="trait-value">{{ char.value }}</span>
 </div>
 </div>
 </div>

 <div class="ratings">
 <h3>Оценки характеристик</h3>
 <div class="rating-list">
 <div v-for="(rating, trait) in product.traitRatings" :key="trait" class="rating-item">
 <span class="trait-name rating-list-s">{{ trait }}</span>
 <div class="rating-segments">
 <span v-for="i in 5" :key="i" :class="{ filled: i <= rating }" class="segment"></span>
 </div>
 </div>
 </div>
 </div>

 <div class="actions">
 <button @click="toggleFavorite" class="favorite-btn" :class="{ active: isFavorite }" :disabled="isLoadingFavorite">
 <span class="heart-icon">♥</span>
 <span>{{ isFavorite ? 'В избранном' : 'Добавить в избранное' }}</span>
 </button>
 <button class="cart-btn" @click="openOrderModal">Заказать</button>
 </div>
 </div>
 </div>

 <div v-if="showOrderModal" class="order-modal" @click.self="closeOrderModal">
 <div class="order-modal-content">
 <h3>Оформление заказа</h3>
 <p>Товар: <strong>{{ product?.name }}</strong></p>

 <div class="form-group">
 <label for="pickupAt">Время самовывоза</label>
 <input id="pickupAt" v-model="orderForm.pickupAt" type="datetime-local" />
 </div>

 <div class="form-group">
 <label for="contactPhone">Телефон</label>
 <input id="contactPhone" v-model="orderForm.contactPhone" type="text" placeholder="+7..." />
 </div>

 <div class="form-group">
 <label for="comment">Комментарий</label>
 <textarea id="comment" v-model="orderForm.comment" rows="3" placeholder="Комментарий к заказу"></textarea>
 </div>

 <div class="order-actions">
 <button class="secondary-btn" @click="closeOrderModal">Отмена</button>
 <button class="cart-btn" @click="submitOrder" :disabled="isOrdering">
 {{ isOrdering ? 'Оформление...' : 'Подтвердить заказ' }}
 </button>
 </div>
 </div>
 </div>
 </div>
</template>

<script>
import { getProduct } from '@/api/catalog.js';
import favoritesAPI from '@/api/favorites.js';
import ordersAPI from '@/api/orders.js';
import PriceHistoryChart from '@/components/PriceHistoryChart.vue';

export default {
 components: {
 PriceHistoryChart,
 },
 name: 'ProductDetailView',
 inject: ['showToast'],
 data() {
 return {
 product: null,
 currentImage: '',
 loading: true,
 error: null,
 isFavorite: false,
 isLoadingFavorite: false,
 showOrderModal: false,
 isOrdering: false,
 orderForm: {
 pickupAt: '',
 contactPhone: '',
 comment: '',
 },
 };
 },
 async mounted() {
 const productId = this.$route.params.id;
 try {
 this.product = await getProduct(productId);
 this.currentImage = this.product.images[0] || '';
 await this.loadFavoriteStatus();
 } catch (error) {
 console.error('Ошибка загрузки товара:', error);
 this.error = 'Товар не найден';
 } finally {
 this.loading = false;
 }
 },
 computed: {
 sortedPrices() {
 return [...(this.product?.priceHistory || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
 },
 currentPrice() {
 const prices = this.sortedPrices;
 return prices.length > 0 ? prices[0].price :0;
 },
 currentImageIndex() {
 return this.product?.images?.indexOf(this.currentImage) || 0;
 },
 },
 methods: {
 prevImage() {
 if (!this.product?.images?.length) return;
 const currentIndex = this.currentImageIndex;
 const newIndex = currentIndex > 0 ? currentIndex - 1 : this.product.images.length - 1;
 this.currentImage = this.product.images[newIndex];
 },
 nextImage() {
 if (!this.product?.images?.length) return;
 const currentIndex = this.currentImageIndex;
 const newIndex = currentIndex < this.product.images.length - 1 ? currentIndex + 1 :0;
 this.currentImage = this.product.images[newIndex];
 },
 async loadFavoriteStatus() {
 const token = localStorage.getItem('token');
 if (!token) {
 this.isFavorite = false;
 return;
 }

 try {
 const data = await favoritesAPI.getFavorites();
 this.isFavorite = data.favorites.includes(this.product.id);
 } catch (error) {
 console.error('Ошибка при загрузке избранного:', error);
 this.isFavorite = false;
 }
 },
 async toggleFavorite() {
 const token = localStorage.getItem('token');
 if (!token) {
 this.showToast('Войдите в аккаунт для добавления в избранное', 'warning');
 this.$router.push('/login');
 return;
 }

 this.isLoadingFavorite = true;
 try {
 if (this.isFavorite) {
 await favoritesAPI.removeFromFavorites(this.product.id);
 this.isFavorite = false;
 this.showToast(`${this.product.name} удалён из избранного`, 'info');
 } else {
 await favoritesAPI.addToFavorites(this.product.id);
 this.isFavorite = true;
 this.showToast(`${this.product.name} добавлен в избранное ❤️`, 'heart');
 }
 } catch (error) {
 console.error('Ошибка при изменении избранного:', error);
 this.showToast('Ошибка при сохранении', 'error');
 } finally {
 this.isLoadingFavorite = false;
 }
 },
 openOrderModal() {
 const token = localStorage.getItem('token');
 if (!token) {
 this.showToast('Войдите в аккаунт для оформления заказа', 'warning');
 this.$router.push('/login');
 return;
 }

 const now = new Date();
 now.setHours(now.getHours() +2);
 this.orderForm.pickupAt = now.toISOString().slice(0,16);
 this.showOrderModal = true;
 },
 closeOrderModal() {
 this.showOrderModal = false;
 },
 async submitOrder() {
 if (!this.orderForm.pickupAt) {
 this.showToast('Укажите дату и время самовывоза', 'warning');
 return;
 }

 this.isOrdering = true;
 try {
 await ordersAPI.createOrder({
 productId: this.product.id,
 pickupAt: this.orderForm.pickupAt,
 contactPhone: this.orderForm.contactPhone,
 comment: this.orderForm.comment,
 });
 this.showToast('Заказ успешно оформлен! 🎉', 'success');
 this.closeOrderModal();
 this.$router.push('/orders');
 } catch (error) {
 console.error('Ошибка оформления заказа:', error);
 this.showToast(error.response?.data?.error || 'Не удалось оформить заказ', 'error');
 } finally {
 this.isOrdering = false;
 }
 },
 },
};
</script>

<style scoped>
.product-detail {
 width:100%;
 min-height:100vh;
 background-color: #f8f9fa;
 padding:20px0;
}

.product-detail-cont {
 width:85%;
 margin:0 auto;
 display: flex;
 gap:40px;
 align-items: flex-start;
}

.product-images {
 flex:1.1;
 display: flex;
 flex-direction: column;
 gap:20px;
}

.main-image-container {
 position: relative;
 width:100%;
 display: flex;
 align-items: center;
 justify-content: center;
}

.main-image {
 width:80%;
 height:140vh;
 max-height:750px;
 min-height:300px;
 border-radius:10px;
 overflow: hidden;
 display: flex;
 align-items: center;
 justify-content: center;
 background-color: #f8f9fa;
}

.nav-arrow {
 position: absolute;
 top:50%;
 transform: translateY(-50%);
 width:50px;
 height:50px;
 border: none;
 border-radius:50%;
 background: rgba(255,77,77,0.8);
 color: white;
 font-size:24px;
 cursor: pointer;
 display: flex;
 align-items: center;
 justify-content: center;
 transition: all0.3s;
 z-index:10;
}

.nav-arrow:hover:not(:disabled) {
 background: rgba(255,77,77,1);
 transform: translateY(-50%) scale(1.1);
}

.nav-arrow:disabled {
 opacity:0.3;
 cursor: not-allowed;
}

.left-arrow {
 left:10px;
}

.right-arrow {
 right:10px;
}

.main-image img {
 width:100%;
 height:100%;
 border-radius:10px;
 object-fit: cover;
 display: block;
}

.thumbnail-images {
 display: flex;
 gap:10px;
 flex-wrap: wrap;
}

.thumbnail-images img {
 width:100px;
 height:100px;
 object-fit: cover;
 border-radius:5px;
 cursor: pointer;
 border:2px solid transparent;
 transition: border-color0.3s;
}

.thumbnail-images img.active,
.thumbnail-images img:hover {
 border-color: #ff4d4d;
}

.product-info {
 flex:0.9;
 background: white;
 padding:30px;
 border-radius:10px;
 box-shadow:02px10px rgba(0,0,0,0.1);
}

.product-info h1 {
 font-size:32px;
 margin-bottom:10px;
}

.brand {
 color: #666;
 font-size:18px;
 margin-bottom:20px;
}

.price-section {
 display: flex;
 align-items: center;
 gap:15px;
 margin-bottom:30px;
}

.current-price {
 font-size:28px;
 font-weight: bold;
 color: #ff4d4d;
}

.description,
.characteristics,
.ratings,
.price-history {
 margin-bottom:30px;
}

.description h3,
.characteristics h3,
.ratings h3,
.price-history h3 {
 font-size:24px;
 margin-bottom:15px;
}

.chart-container {
 width:100%;
 height:300px;
}

.traits-list,
.rating-list {
 display: flex;
 flex-direction: column;
 gap:10px;
}

.trait-item,
.rating-item {
 display: flex;
 justify-content: space-between;
 align-items: center;
 padding:10px0;
 border-bottom:1px solid #eee;
}

.rating-segments {
 display: flex;
 gap:2px;
 flex-shrink:0;
 width:100%;
 margin:010px;
}

.segment {
 flex:1;
 height:6px;
 background: #e0e0e0;
 border-radius:3px;
}

.segment.filled {
 background: #ff4d4d;
}

.actions {
 display: flex;
 gap:20px;
 margin-top:40px;
}

.favorite-btn,
.cart-btn {
 padding:15px30px;
 border: none;
 display: flex;
 align-items: center;
 gap:10px;
}

.favorite-btn {
 background-color: #f2f5f9;
 color: #666;
 border:2px solid #e0e0e0;
}

.favorite-btn:hover:not(:disabled),
.favorite-btn.active {
 background-color: #ff4d4d;
 color: white;
 border-color: #ff4d4d;
}

.heart-icon {
 font-size:20px;
}

.favorite-btn:disabled {
 opacity:0.6;
 cursor: not-allowed;
}

.favorite-btn:hover {
 background-color: #e9ecef;
}

.cart-btn {
 background-color: #ff4d4d;
 color: white;
}

.cart-btn:hover {
 background-color: #e63939;
 transform: translateY(-2px);
}

.loading,
.error {
 text-align: center;
 padding:50px;
 font-size:20px;
}

.error {
 color: red;
}

.rating-list-s {
 position: absolute;
 margin-top: -25px;
 margin-left:10px;
}

.order-modal {
 position: fixed;
 inset:0;
 background: rgba(0,0,0,0.4);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index:1000;
}

.order-modal-content {
 width: min(520px,92vw);
 background: #fff;
 border-radius:12px;
 padding:20px;
}

.form-group {
 display: flex;
 flex-direction: column;
 gap:6px;
 margin-bottom:12px;
}

.form-group input,
.form-group textarea {
 border:1px solid #ddd;
 border-radius:8px;
 padding:10px;
}

.order-actions {
 display: flex;
 justify-content: flex-end;
 gap:10px;
}

.secondary-btn {
 border:1px solid #ddd;
 border-radius:8px;
 background: #fff;
 padding:10px16px;
}
</style>
