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
        <button @click.stop="openCompareModal" class="action-btn compare" title="Сравнить"><img src="../../public/iconHed/chart.svg" alt="Сравнить"></button>
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
  emits: ['open-compare-modal'],
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
    openCompareModal() {
      // Открываем модальное окно выбора товара для сравнения
      this.$emit('open-compare-modal', this.product);
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
.product-card {
  background-color: #F6F7FA;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 420px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  padding-bottom: 20px;
}

.product-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

}

.product-card img {
  width: 85%;
  height: 250px;
  margin-top: 20px;
  object-fit: cover;
  border-radius: 8px;
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

.product-card-div {
  width: 85%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
}

.category {
  font-size: 14px;
  color: gray;
  margin-bottom: 5px;
}

.product-card-div h3 {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.price-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.price-info p {
  margin: 0;
  font-size: 14px;
}

.change.up {
  color: red;
}

.change.down {
  color: green;
}

.price-info_b {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.price-info_b p {
  font-size: 14px;
  margin: 0;
}

.price-info_b span {
  font-size: 14px;
  margin: 0;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
}

.buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f2f5f9;
  cursor: pointer;
  font-size: 16px;
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
    margin-top: 0;
    width: 20px;
    height: 20px;
}

@media (max-width: 768px) {
  .product-card {
    min-height: 380px;
    padding-bottom: 15px;
  }

  .product-card img {
    height: 200px;
    margin-top: 15px;
  }

  .product-card-div h3 {
    font-size: 18px;
  }

  .current-price {
    font-size: 18px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
  }

  .action-btn img {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .product-card {
    min-height: 350px;
  }

  .product-card img {
    height: 180px;
    margin-top: 10px;
  }

  .product-card-div {
    width: 90%;
  }

  .product-card-div h3 {
    font-size: 16px;
  }

  .current-price {
    font-size: 16px;
  }

  .price-info_b p,
  .price-info_b span {
    font-size: 13px;
  }
}
</style>
