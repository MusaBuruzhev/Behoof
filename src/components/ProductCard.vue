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
        <button><img src="../../public/iconHed/heart.svg" alt=""></button>
        <button><img src="../../public/iconHed/chart.svg" alt=""></button>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
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
    }
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
    border-radius: 10px;
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
.buttons button img{
  width: 30px;
  height: 30px;
  margin: 0;

}
.buttons button {
  margin-left: 10px;
  width: 50px;
  height: 50px;
  background-color: white;
  border: none;
  border-radius: 50%;
}
.price-info_b{
  display: flex;
}

.product-card-div h3{
  font-size: 25px;
}

.price-info_b p{
  font-size: 20px;
  margin-top: -20px;

}

.price-info_b span{
  margin-left: 10px;
  margin-top: -20px;
}

.current-price{
  font-size: 25px;
}
</style>
