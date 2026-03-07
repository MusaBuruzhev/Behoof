<template>
  <div class="product-card" @click="goToProductDetail">
    <img :src="product.images[0]" :alt="product.name" />
    <div class="product-card-div">
      <p class="category">{{ categoryName }}</p>
    <h3>{{ product.name }}</h3>
    <div class="price-block">
      <div class="price-info">
        <div class="price-info_b">
          <p>Цена</p>
          <span class="change" :class="{ 'up': changePercent > 0, 'down': changePercent < 0 }">
          {{ changePercent > 0 ? '⯅' : '⯆' }} {{ Math.abs(changePercent) }}%
        </span>
        </div>

        <span class="current-price">{{ currentPrice }}</span>

      </div>
      <div class="buttons">
        <button @click.stop="toggleFavorite" class="action-btn favorite" :class="{ 'active': isFavorite }" :disabled="isLoading" title="Добавить в избранное">♥</button>
        <button @click.stop class="action-btn"><img src="../../public/iconHed/chart.svg" alt="Сравнить"></button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import favoritesAPI from '@/api/favorites.js';

export default {
  name: 'ProductCard',
  props: {
    product: {
      type: Object,
      required: true
    },
    categoryName: {
      type: String,
      required: true
    }
  },
  inject: ['showToast'],
  data() {
    return {
      isFavorite: false,
      isLoading: false
    };
  },
  computed: {
    sortedPrices() {
      return [...this.product.priceHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    currentPrice() {
      const prices = this.sortedPrices;
      if (prices.length === 0) return 0;
      return prices[0].price;
    },
    changePercent() {
      const prices = this.sortedPrices;
      if (prices.length < 2) return 0;
      const current = prices[0].price;
      const previous = prices[1].price;
      return Math.round((current - previous) / previous * 100);
    }
  },
  methods: {
    goToProductDetail() {
      this.$router.push(`/product/${this.product.id}`);
    },
    async toggleFavorite() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.showToast('Войдите в аккаунт для добавления в избранное', 'warning');
        this.$router.push('/login');
        return;
      }

      this.isLoading = true;
      try {
        if (this.isFavorite) {
          await favoritesAPI.removeFromFavorites(this.product.id);
          this.isFavorite = false;
          this.showToast(`${this.product.name} удалён из избранного`, 'info');
          this.$emit('removed', this.product.id);
        } else {
          await favoritesAPI.addToFavorites(this.product.id);
          this.isFavorite = true;
          this.showToast(`${this.product.name} добавлен в избранное ❤️`, 'heart');
        }
      } catch (error) {
        console.error('Ошибка при изменении избранного:', error);
        this.showToast('Ошибка при сохранении', 'error');
      } finally {
        this.isLoading = false;
      }
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
    }
  },
  mounted() {
    this.loadFavoriteStatus();
  }
}
</script>

<style scoped>
.product-card img {
    width: 85%;
    height: 250px;
    margin-top: 20px;
    object-fit: cover;
}
.product-card{
    background-color: #F6F7FA;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 420px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
}

.product-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
}

.buttons button.active {
  background-color: #ffcccc;
  transform: scale(1.05);
}

.buttons button.active img {
  filter: brightness(0.8);
}

.buttons button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.product-card-div{
  width: 85%;
}

.category {
  font-size: 12px;
  color: gray;
}

h3 {
  font-weight: bold;
}

.price-block {
  display: flex;
  justify-content: space-between;
}

.price-info p {
  margin: 0;
}

.change.up {
  color: red;
}

.change.down {
  color: green;
}

.price-info_b {
  display: flex;
}

.product-card-div h3 {
  font-size: 25px;
}

.price-info_b p {
  font-size: 20px;
  margin-top: -20px;
}

.price-info_b span {
  margin-left: 10px;
  margin-top: -20px;
}

.current-price {
  font-size: 25px;
}

.buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #f2f5f9;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-btn:hover:not(:disabled),
.action-btn.active {
  background: #ff4d4d;
  color: white;
}

.action-btn.favorite.active {
  transform: scale(1.05);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-btn img {
  width: 20px;
  height: 20px;
}</style>
