<template>
  <div class="novelties">
    <div class="header">
      <h1>Новинки</h1>
      <router-link to="/novelties" class="novelties-link">К новинкам ></router-link>
    </div>
    <div class="grid">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :categoryName="getCategoryName(product.categoryId)"
        @open-compare-modal="openCompareModal"
      />
    </div>
  </div>
</template>

<script>
import ProductCard from './ProductCard.vue'
import { fetchCatalog } from '@/api/catalog.js'
import comparisonAPI from '@/api/comparison.js';

export default {
  name: 'NoveltiesSection',
  components: {
    ProductCard
  },
  data() {
    return {
      products: [],
      categories: []
    }
  },
  async mounted() {
    try {
      const data = await fetchCatalog();
      this.categories = data.categories;
      this.products = Object.values(data.products).slice(-10);
    } catch (error) {
      console.error('Error fetching catalog:', error);
    }
  },
  methods: {
    getCategoryName(categoryId) {
      const cat = this.categories.find(c => c.id === categoryId);
      return cat ? cat.name : '';
    },
    openCompareModal(product) {
      comparisonAPI.addToComparison(product.id);
      this.$router.push('/comparison');
    }
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 50px;
}

.novelties{
  width: 85%;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
}

.header a{
  text-decoration: none;
  color: #FF4D4D;
  font-size: 20px;
}

</style>
