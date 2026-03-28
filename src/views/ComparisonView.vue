
<template>
 <div class="comparison-page">
 <div class="container">
 <h1>⚖️ Сравнение товаров</h1>

 <div v-if="loading" class="loading">Загрузка товаров...</div>

 <div v-else-if="displayProducts.length === 0" class="empty">
 <p>Нет товаров для сравнения.</p>
 <p class="hint">Нажмите "Сравнить" на карточке товара или выберите товары из избранного.</p>
 <button @click="openSelectModal" class="btn">Выбрать товары</button>
 </div>

 <div v-else-if="displayProducts.length === 1" class="empty">
 <p>Выбран только 1 товар.</p>
 <p class="hint">Выберите ещё один товар для сравнения.</p>
 <button @click="openSelectModal" class="btn">Добавить товар</button>
 </div>

 <div v-else class="comparison-content">
 <div class="comparison-controls">
 <button @click="openSelectModal" class="add-btn">+ Добавить товар</button>
 <button @click="clearComparison" class="clear-btn">Очистить</button>
 </div>

 <div class="comparison-table">
 <div class="table-header">
 <div class="cell label"></div>
 <div v-for="product in displayProducts" :key="product.id" class="cell product-header">
 <button @click="removeProduct(product.id)" class="remove-btn" title="Убрать">✕</button>
 <img :src="product.images?.[0]" :alt="product.name" />
 <h3>{{ product.name }}</h3>
 <p class="brand">{{ product.brand }}</p>
 <p class="price" :class="getPriceClass(product)">{{ currentPrice(product) }} ₽</p>
 </div>
 </div>

 <!-- Характеристики -->
 <div class="table-section">
 <div class="section-title">Характеристики</div>
 <div class="table-body">
 <div
 v-for="trait in allCharacteristics"
 :key="trait"
 class="table-row"
 >
 <div class="cell label">{{ trait }}</div>
 <div
 v-for="product in displayProducts"
 :key="product.id"
 class="cell"
 :class="getValueClass(product, trait)"
 >
 {{ getCharacteristicValue(product, trait) }}
 </div>
 </div>
 </div>
 </div>

 <!-- Рейтинги -->
 <div v-if="hasRatings" class="table-section">
 <div class="section-title">Оценки характеристик</div>
 <div class="table-body">
 <div
 v-for="rating in allRatings"
 :key="rating"
 class="table-row"
 >
 <div class="cell label">{{ rating }}</div>
 <div
 v-for="product in displayProducts"
 :key="product.id"
 class="cell rating-cell"
 :class="getRatingClass(product, rating)"
 >
 <div class="rating-bar">
 <div class="rating-fill" :style="{ width: (product.traitRatings?.[rating] || 0) * 20 + '%' }"></div>
 </div>
 <span class="rating-value">{{ product.traitRatings?.[rating] || 0 }}/5</span>
 </div>
 </div>
 </div>
 </div>

 <!-- Описание -->
 <div class="table-section">
 <div class="section-title">Описание</div>
 <div class="table-body">
 <div class="table-row">
 <div class="cell label"></div>
 <div v-for="product in displayProducts" :key="product.id" class="cell">
 <p class="description">{{ product.description || 'Описание отсутствует' }}</p>
 </div>
 </div>
 </div>
 </div>

 <!-- Действия -->
 <div class="table-section actions-section">
 <div class="table-row">
 <div class="cell label"></div>
 <div v-for="product in displayProducts" :key="product.id" class="cell">
 <button class="order-btn" @click="goToProduct(product.id)">Заказать</button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <CompareSelectModal
 :show="showSelectModal"
 :currentProduct="null"
 @close="closeSelectModal"
 />
 </div>
</template>

<script>
import { fetchProducts } from '@/api/catalog.js';
import comparisonAPI from '@/api/comparison.js';
import CompareSelectModal from '@/components/CompareSelectModal.vue';

export default {
 name: 'ComparisonView',
 components: {
 CompareSelectModal
 },
 data() {
 return {
 products: [],
 allProducts: [],
 loading: true,
 showSelectModal: false,
 };
 },
 computed: {
 displayProducts() {
 return this.products;
 },
 allCharacteristics() {
 const chars = new Set();
 this.products.forEach(p => {
 if (p.characteristics) {
 p.characteristics.forEach(c => chars.add(c.trait));
 }
 });
 return Array.from(chars);
 },
 allRatings() {
 const ratings = new Set();
 this.products.forEach(p => {
 if (p.traitRatings) {
 Object.keys(p.traitRatings).forEach(r => ratings.add(r));
 }
 });
 return Array.from(ratings);
 },
 hasRatings() {
 return this.allRatings.length > 0;
 }
 },
 async mounted() {
 await this.loadProducts();
 },
 methods: {
async loadProducts() {
 this.loading = true;
 try {
 // Получаем товары только из localStorage (не из избранного)
 const compareIds = comparisonAPI.getComparison();

 if (compareIds.length ===0) {
 this.products = [];
 return;
 }

 const data = await fetchProducts({ limit:1000 });
 this.allProducts = data.products || [];

 this.products = compareIds
 .map(id => this.allProducts.find(p => p.id === id))
 .filter(p => p);
 } catch (error) {
 console.error('Ошибка загрузки товаров для сравнения:', error);
 } finally {
 this.loading = false;
 }
  this.loading = true;
  try {
    // Получаем товары только из localStorage
    const compareIds = comparisonAPI.getComparison();

    if (compareIds.length === 0) {
      this.products = [];
      return;
    }

    const data = await fetchProducts({ limit: 1000 });
    this.allProducts = data.products || [];

    this.products = compareIds
      .map(id => this.allProducts.find(p => p.id === id))
      .filter(p => p);
  } catch (error) {
    console.error('Ошибка загрузки товаров для сравнения:', error);
  } finally {
    this.loading = false;
  }
},

 currentPrice(product) {
 if (!product.priceHistory?.length) return 0;
 const sorted = [...product.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
 return sorted[0]?.price || 0;
 },

 getPriceClass(product) {
 if (this.products.length < 2) return '';
 const prices = this.products.map(p => this.currentPrice(p));
 const minPrice = Math.min(...prices);
 const maxPrice = Math.max(...prices);

 if (this.currentPrice(product) === minPrice) return 'best';
 if (this.currentPrice(product) === maxPrice) return 'worst';
 return '';
 },

 getCharacteristicValue(product, trait) {
 const char = product.characteristics?.find(c => c.trait === trait);
 return char?.value || '—';
 },

 // Определяем числовые характеристики, которые можно сравнить
 isNumericTrait(trait) {
 const numericTraits = ['емкость', 'объем', 'мощность', 'размер', 'диагональ', 'разрешение', 'вес', 'емкость аккумулятора', 'оперативная память', 'встроенная память', 'частота'];
 return numericTraits.some(t => trait.toLowerCase().includes(t));
 },

 parseNumericValue(value) {
 if (!value) return null;
 const num = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
 const parsed = parseFloat(num);
 return isNaN(parsed) ? null : parsed;
 },

 getValueClass(product, trait) {
 if (this.products.length < 2) return '';

 const currentValue = this.getCharacteristicValue(product, trait);

 // Для числовых значений сравниваем
 if (this.isNumericTrait(trait)) {
 const currentNum = this.parseNumericValue(currentValue);
 if (currentNum === null) return '';

 const allValues = this.products
 .map(p => this.parseNumericValue(this.getCharacteristicValue(p, trait)))
 .filter(v => v !== null);

 if (allValues.length < 2) return '';

 const minVal = Math.min(...allValues);
 const maxVal = Math.max(...allValues);

 // Для некоторых характеристик меньше = лучше (например, вес)
 const inverseTraits = ['вес', 'толщина', 'ширина', 'высота'];
 const isInverse = inverseTraits.some(t => trait.toLowerCase().includes(t));

 if (isInverse) {
 if (currentNum === minVal) return 'best';
 if (currentNum === maxVal) return 'worst';
 } else {
 if (currentNum === maxVal) return 'best';
 if (currentNum === minVal) return 'worst';
 }
 }

 return '';
 },

 getRatingClass(product, rating) {
 if (this.products.length < 2) return '';
 const ratingValue = product.traitRatings?.[rating] || 0;
 const allRatings = this.products
 .map(p => p.traitRatings?.[rating] || 0);

 const maxRating = Math.max(...allRatings);
 const minRating = Math.min(...allRatings);

 if (ratingValue === maxRating) return 'best';
 if (ratingValue === minRating) return 'worst';
 return '';
 },

 removeProduct(productId) {
 comparisonAPI.removeFromComparison(productId);
 this.products = this.products.filter(p => p.id !== productId);
 },

 clearComparison() {
 comparisonAPI.clearComparison();
 this.products = [];
 },

 goToProduct(productId) {
 this.$router.push(`/product/${productId}`);
 },

 openSelectModal() {
 this.showSelectModal = true;
 },

 closeSelectModal() {
 this.showSelectModal = false;
 this.loadProducts();
 }
 },
};
</script>

<style scoped>
.comparison-page {
 min-height: 100vh;
 background: #f8f9fa;
 padding: 24px 0;
}

.container {
 width: 85%;
 margin: 0 auto;
}

.loading,
.empty {
 background: #fff;
 padding: 40px;
 border-radius: 10px;
 text-align: center;
}

.hint {
 color: #666;
 margin: 10px 0 20px;
}

.btn {
 display: inline-block;
 padding: 12px 24px;
 background: #ff4d4d;
 color: #fff;
 border: none;
 border-radius: 8px;
 cursor: pointer;
 font-size: 16px;
}

.comparison-controls {
 display: flex;
 gap: 12px;
 margin-bottom: 16px;
}

.add-btn {
 padding: 8px 16px;
 background: #ff4d4d;
 color: #fff;
 border: none;
 border-radius: 6px;
 cursor: pointer;
}

.clear-btn {
 padding: 8px 16px;
 background: #dc3545;
 color: #fff;
 border: none;
 border-radius: 6px;
 cursor: pointer;
}

.comparison-table {
 background: #fff;
 border-radius: 10px;
 overflow: hidden;
 box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.table-section {
 border-bottom: 2px solid #eee;
}

.table-section:last-child {
 border-bottom: none;
}

.section-title {
 padding: 12px 16px;
 background: #fff0f0;
 font-weight: 600;
 color: #ff4d4d;
 font-size: 14px;
}

.table-header {
 display: flex;
}

.table-header .cell {
 padding: 16px;
 flex: 1;
 min-width: 200px;
}

.table-body .table-row {
 display: flex;
 border-bottom: 1px solid #eee;
}

.table-body .table-row:last-child {
 border-bottom: none;
}

.cell {
 padding: 12px 16px;
 flex: 1;
 min-width: 200px;
 display: flex;
 align-items: center;
}

.label {
 width: 180px;
 flex-shrink: 0;
 font-weight: 600;
 background: #f8f9fa;
 display: flex;
 align-items: center;
 color: #333;
}

.product-header {
 text-align: center;
 position: relative;
 padding-top: 40px;
 display: flex;
 flex-direction: column;
 align-items: center;
}

.product-header .remove-btn {
 position: absolute;
 top: 8px;
 right: 8px;
 width: 24px;
 height: 24px;
 border: none;
 background: #dc3545;
 color: #fff;
 border-radius: 50%;
 cursor: pointer;
 font-size: 12px;
}

.product-header img {
 width: 120px;
 height: 120px;
 object-fit: cover;
 border-radius: 8px;
}

.product-header h3 {
 font-size: 14px;
 margin: 10px 0 5px;
 min-height: 40px;
}

.product-header .brand {
 font-size: 12px;
 color: #666;
 margin: 0;
}

.product-header .price {
 font-size: 20px;
 font-weight: bold;
 color: #ff4d4d;
 margin: 8px 0 0;
}

.product-header .price.best {
 color: #28a745;
}

.product-header .price.worst {
 color: #dc3545;
}

/* Подсветка лучшего/худшего значения */
.cell.best {
 background: rgba(40, 167, 69, 0.15);
 color: #28a745;
 font-weight: 600;
 position: relative;
}

.cell.best::after {
 content: '✓';
 position: absolute;
 right: 8px;
 font-size: 12px;
}

.cell.worst {
 background: rgba(220, 53, 69, 0.15);
 color: #dc3545;
 position: relative;
}

.cell.worst::after {
 content: '✗';
 position: absolute;
 right: 8px;
 font-size: 12px;
}

.rating-cell {
 flex-direction: column;
 align-items: flex-start;
 gap: 4px;
}

.rating-bar {
 width: 100%;
 height: 8px;
 background: #e9ecef;
 border-radius: 4px;
 overflow: hidden;
}

.rating-fill {
 height: 100%;
 background: linear-gradient(135deg, #ff4d4d 0%, #ff6b6b 100%);
 border-radius: 4px;
 transition: width 0.3s;
}

.rating-value {
 font-size: 12px;
 color: #666;
}

.description {
 font-size: 13px;
 color: #555;
 line-height: 1.5;
}

.no-data {
 color: #999;
 font-style: italic;
}

.actions-section .cell {
 justify-content: center;
 padding: 20px;
}

.table-row{
  display: flex;
}
.order-btn {
 padding: 12px 24px;
 background: #ff4d4d;
 color: #fff;
 border: none;
 border-radius: 6px;
 cursor: pointer;
 font-size: 14px;
 font-weight: 600;
 transition: all 0.3s;
}

.order-btn:hover {
 background: #e63939;
 transform: translateY(-2px);
}

@media (max-width: 768px) {
 .table-header,
 .table-body .table-row {
  flex-direction: column;
 }

 .cell.label {
  width: 100%;
  padding: 10px;
  background: #e9ecef;
 }

 .product-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
 }

 .comparison-controls {
  flex-direction: column;
 }
}
</style>
