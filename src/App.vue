<template>
  <div id="app">
    <HeaderComponent />
    <main>
      <router-view />
    </main>
    <!-- не показываем футер на экранах логина/регистрации -->
    <FooterComponent v-if="!isAuthRoute" />
  </div>
</template>

<script>
import HeaderComponent from '@/components/Header.vue'
import FooterComponent from '@/components/Footer.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
  },
  computed: {
    isAuthRoute() {
      const authPaths = ['/login', '/register'];
      return authPaths.includes(this.$route.path);
    }
  }
}
</script>

<style>
body {
  margin: 0;
  background-color: #ffffff;
}
</style>
