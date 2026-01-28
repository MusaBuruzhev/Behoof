<template>
  <div class="home">
    <BanerComponent />
    <BestProductsComponent />
    <HomeInfo/>
  </div>
</template>

<script>
import BanerComponent from '../components/Baner.vue'
import BestProductsComponent from '../components/BestProducts.vue'
import HomeInfo from '@/components/HomeInfo.vue';

export default {
  name: 'HomeView',
  components: {
    BanerComponent,
    BestProductsComponent,
    HomeInfo
  },
}
</script>
