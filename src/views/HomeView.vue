<template>
  <div class="home">
    <BanerComponent />
    <BestProductsComponent />
  </div>
</template>

<script>
import BanerComponent from '../components/Baner.vue'
import BestProductsComponent from '../components/BestProducts.vue'

export default {
  name: 'HomeView',
  components: {
    BanerComponent,
    BestProductsComponent,
  },
}
</script>
