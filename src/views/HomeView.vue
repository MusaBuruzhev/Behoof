<template>
  <div class="home">
    <BanerComponent />
    <BestProductsComponent />
    <HomeInfo/>
    <NoveltiesSection />
    <ProductReviews/>
  </div>
</template>

<script>
import BanerComponent from '../components/Baner.vue'
import BestProductsComponent from '../components/BestProducts.vue'
import HomeInfo from '@/components/HomeInfo.vue';
import NoveltiesSection from '@/components/Novelties.vue';
import ProductReviews from '@/components/Reviews.vue';

export default {
  name: 'HomeView',
  components: {
    BanerComponent,
    BestProductsComponent,
    HomeInfo,
    NoveltiesSection,
    ProductReviews
  },
}
</script>
