<template>
 <div v-if="show" class="modal-overlay" @click.self="close">
 <div class="modal-content">
 <h3>Выберите товар для сравнения</h3>
 <p class="hint" v-if="currentProduct">
 Выберите товар из избранного для сравнения с "{{ currentProduct.name }}"
 </p>
 <p class="hint" v-else>
 Выберите 2 товара из избранного для сравнения
 </p>

 <div v-if="loading" class="loading">Загрузка...</div>

 <div v-else-if="favorites.length === 0" class="empty-favorites">
 <p>В избранном нет товаров.</p>
 <router-link to="/favorites" @click="close" class="btn">Перейти в избранное</router-link>
 </div>

 <div v-else class="favorites-list">
 <div
 v-for="item in favorites"
 :key="item.id"
 class="favorite-item"
 :class="{
   disabled: currentProduct && item.id === currentProduct.id,
   selected: selectedItems.includes(item.id)
 }"
 @click="toggleSelection(item)"
 >
 <div class="checkbox" :class="{ checked: selectedItems.includes(item.id) }">
 <span v-if="selectedItems.includes(item.id)">✓</span>
 </div>
 <img :src="item.images?.[0]" :alt="item.name" />
 <div class="item-info">
 <h4>{{ item.name }}</h4>
 <p class="brand">{{ item.brand }}</p>
 <p class="price">{{ currentPrice(item) }} ₽</p>
 </div>
 <span v-if="currentProduct && item.id === currentProduct.id" class="current-badge">Текущий</span>
 </div>
 </div>

 <div class="selection-info" v-if="!currentProduct">
 <span>Выбрано: {{ selectedItems.length }}/2</span>
 </div>

 <div class="modal-actions">
 <button class="cancel-btn" @click="close">Отмена</button>
 <button
 class="compare-btn"
 @click="startComparison"
 :disabled="!canCompare"
 >
 {{ currentProduct ? 'Сравнить' : 'Сравнить выбранные' }}
 </button>
 </div>
 </div>
 </div>
</template>

<script>
import { fetchProducts } from '@/api/catalog.js';
import favoritesAPI from '@/api/favorites.js';
import comparisonAPI from '@/api/comparison.js';

export default {
 name: 'CompareSelectModal',
 props: {
 show: Boolean,
 currentProduct: Object,
 },
 emits: ['close'],
 data() {
 return {
 favorites: [],
 loading: true,
 selectedItems: [],
 };
 },
 computed: {
 canCompare() {
 if (this.currentProduct) {
 // При сравнении с карточки - нужен 1 товар из избранного
 return this.selectedItems.length === 1;
 } else {
 // При сравнении из меню - нужно 2 товара
 return this.selectedItems.length === 2;
 }
 }
 },
 watch: {
 show(newVal) {
 if (newVal) {
 this.selectedItems = [];
 this.loadFavorites();
 }
 }
 },
 methods: {
 async loadFavorites() {
 this.loading = true;
 try {
 const token = localStorage.getItem('token');
 if (!token) {
 this.favorites = [];
 return;
 }

 const data = await favoritesAPI.getFavorites();
 const favoriteIds = data.favorites || [];

 if (favoriteIds.length === 0) {
 this.favorites = [];
 return;
 }

 const productsData = await fetchProducts({ limit: 1000 });
 const allProducts = productsData.products || [];

 this.favorites = favoriteIds
 .map(id => allProducts.find(p => p.id === id))
 .filter(p => p);
 } catch (error) {
 console.error('Ошибка загрузки избранного:', error);
 this.favorites = [];
 } finally {
 this.loading = false;
 }
 },
 currentPrice(product) {
 if (!product.priceHistory?.length) return 0;
 const sorted = [...product.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
 return sorted[0]?.price || 0;
 },
 toggleSelection(item) {
 // Если это текущий товар (при сравнении с карточки) - нельзя выбрать
 if (this.currentProduct && item.id === this.currentProduct.id) return;

 const index = this.selectedItems.indexOf(item.id);

 if (index > -1) {
 // Убираем из выбора
 this.selectedItems.splice(index, 1);
 } else {
 // Добавляем в выбор (максимум 2, или 1 если есть currentProduct)
 const maxSelect = this.currentProduct ? 1 : 2;
 if (this.selectedItems.length < maxSelect) {
 this.selectedItems.push(item.id);
 }
 }
 },
 startComparison() {
 // Очищаем предыдущее сравнение
 comparisonAPI.clearComparison();

 if (this.currentProduct) {
 // Добавляем текущий товар и выбранный из избранного
 comparisonAPI.addToComparison(this.currentProduct.id);
 this.selectedItems.forEach(id => comparisonAPI.addToComparison(id));
 } else {
 // Добавляем 2 выбранных товара
 this.selectedItems.forEach(id => comparisonAPI.addToComparison(id));
 }

 this.$emit('close');
 this.$router.push('/comparison');
 },
 close() {
 this.selectedItems = [];
 this.$emit('close');
 },
 },
};
</script>

<style scoped>
.modal-overlay {
 position: fixed;
 inset: 0;
 background: rgba(0, 0, 0, 0.5);
 display: flex;
 align-items: center;
 justify-content: center;
 z-index: 1000;
}

.modal-content {
 background: #fff;
 border-radius: 12px;
 padding: 24px;
 width: min(500px, 92vw);
 max-height: 80vh;
 overflow-y: auto;
}

.modal-content h3 {
 margin: 0 0 8px;
}

.hint {
 color: #666;
 font-size: 14px;
 margin-bottom: 16px;
}

.loading {
 text-align: center;
 padding: 20px;
 color: #666;
}

.empty-favorites {
 text-align: center;
 padding: 20px;
}

.empty-favorites .btn {
 display: inline-block;
 margin-top: 12px;
 padding: 10px 20px;
 background: #ff4d4d;
 color: #fff;
 border-radius: 6px;
 text-decoration: none;
}

.favorites-list {
 display: flex;
 flex-direction: column;
 gap: 10px;
 margin-bottom: 16px;
 max-height: 400px;
 overflow-y: auto;
}

.favorite-item {
 display: flex;
 align-items: center;
 gap: 12px;
 padding: 12px;
 border: 2px solid #eee;
 border-radius: 8px;
 cursor: pointer;
 transition: all 0.2s;
 position: relative;
}

.favorite-item:hover:not(.disabled) {
 border-color: #4d94ff;
 background: #f0f7ff;
}

.favorite-item.disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.favorite-item.selected {
 border-color: #4d94ff;
 background: #e6f0ff;
}

.checkbox {
 width: 24px;
 height: 24px;
 border: 2px solid #ddd;
 border-radius: 4px;
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 14px;
 font-weight: bold;
 color: #4d94ff;
 flex-shrink: 0;
}

.checkbox.checked {
 background: #4d94ff;
 border-color: #4d94ff;
 color: white;
}

.favorite-item img {
 width: 60px;
 height: 60px;
 object-fit: cover;
 border-radius: 6px;
}

.item-info {
 flex: 1;
}

.item-info h4 {
 margin: 0 0 4px;
 font-size: 14px;
}

.item-info .brand {
 margin: 0;
 font-size: 12px;
 color: #666;
}

.item-info .price {
 margin: 4px 0 0;
 font-weight: bold;
 color: #ff4d4d;
}

.current-badge {
 font-size: 12px;
 background: #e9ecef;
 padding: 4px 8px;
 border-radius: 4px;
 color: #666;
}

.selection-info {
 text-align: center;
 padding: 8px;
 background: #f0f7ff;
 border-radius: 6px;
 margin-bottom: 12px;
 font-weight: 500;
 color: #4d94ff;
}

.modal-actions {
 display: flex;
 justify-content: space-between;
 gap: 12px;
}

.cancel-btn {
 padding: 10px 16px;
 border: 1px solid #ddd;
 border-radius: 6px;
 background: #fff;
 cursor: pointer;
}

.compare-btn {
 padding: 10px 16px;
 background: #4d94ff;
 color: #fff;
 border: none;
 border-radius: 6px;
 cursor: pointer;
 font-weight: 600;
}

.compare-btn:disabled {
 background: #ccc;
 cursor: not-allowed;
}
</style>
