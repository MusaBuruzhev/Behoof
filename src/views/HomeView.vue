<template>
  <div class="home">
    <BanerComponent />
    <h2>Добро пожаловать на мой сайт!</h2>
    <p>Это главная страница</p>
  </div>
</template>

<script>
import BanerComponent from '../components/Baner.vue'

export default {
  name: 'HomeView',
  components: {
    BanerComponent,
  },
}
</script>
