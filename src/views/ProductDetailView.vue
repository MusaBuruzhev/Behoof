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
                <div v-if="product.priceHistory && product.priceHistory.length >= 5" class="price-history">
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
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="{ filled: i <= rating }"
                  class="segment"
                ></span>
              </div>
            </div>
          </div>
        </div>



        <div class="actions">
          <button class="favorite-btn">Добавить в избранное</button>
          <button class="cart-btn">Добавить в корзину</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProduct } from '@/api/catalog.js';
import PriceHistoryChart from '@/components/PriceHistoryChart.vue';

export default {
  components: {
    PriceHistoryChart,
  },
  name: 'ProductDetailView',
  data() {
    return {
      product: null,
      currentImage: '',
      loading: true,
      error: null,
    };
  },
  async mounted() {
    const productId = this.$route.params.id;
    try {
      this.product = await getProduct(productId);
      this.currentImage = this.product.images[0] || '';
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
      return prices.length > 0 ? prices[0].price : 0;
    },
    changePercent() {
      const prices = this.sortedPrices;
      if (prices.length < 2) return 0;
      const current = prices[0].price;
      const previous = prices[1].price;
      return Math.round((current - previous) / previous * 100);
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
      const newIndex = currentIndex < this.product.images.length - 1 ? currentIndex + 1 : 0;
      this.currentImage = this.product.images[newIndex];
    },
  },
};
</script>

<style scoped>
.product-detail {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px 0;
}

.product-detail-cont {
  width: 85%;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.product-images {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 80%;
  height: 140vh;
  max-height: 750px;
  min-height: 300px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 77, 77, 0.8);
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(255, 77, 77, 1);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.left-arrow {
  left: 10px;
}

.right-arrow {
  right: 10px;
}

.main-image img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

.thumbnail-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail-images img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail-images img.active,
.thumbnail-images img:hover {
  border-color: #ff4d4d;
}

.product-info {
  flex: 0.9;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.product-info h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.brand {
  color: #666;
  font-size: 18px;
  margin-bottom: 20px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #ff4d4d;
}

.change.up {
  color: red;
}

.change.down {
  color: green;
}

.description, .characteristics, .ratings, .price-history {
  margin-bottom: 30px;
}

.description h3, .characteristics h3, .ratings h3, .price-history h3 {
  font-size: 24px;
  margin-bottom: 15px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.traits-list, .rating-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trait-item, .rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.rating-segments {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
  width: 100%;
  margin: 0 10px;
}

.segment {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
}

.segment.filled {
  background: #ff4d4d;
}

.actions {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

.favorite-btn, .cart-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.favorite-btn {
  background-color: #f8f9fa;
  color: #666;
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
}

.loading, .error {
  text-align: center;
  padding: 50px;
  font-size: 20px;
}

.error {
  color: red;
}



.rating-list-s{
  position: absolute;
  margin-top: -25px;
  margin-left: 10px;
}
</style>
