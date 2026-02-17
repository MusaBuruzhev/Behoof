<template>
  <div class="home">
    <BanerComponent />
    <BestProductsComponent />
    <HomeInfo/>
    <Novelties />
    <Reviews/>
  </div>
</template>

<script>
import BanerComponent from '../components/Baner.vue'
import BestProductsComponent from '../components/BestProducts.vue'
import HomeInfo from '@/components/HomeInfo.vue';
import Novelties from '@/components/Novelties.vue';
import Reviews from '@/components/Reviews.vue';

export default {
  name: 'HomeView',
  components: {
    BanerComponent,
    BestProductsComponent,
    HomeInfo,
    Novelties,
    Reviews
  },
}
</script>
