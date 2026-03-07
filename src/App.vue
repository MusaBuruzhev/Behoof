<template>
  <div id="app">
    <HeaderComponent />
    <main>
      <router-view />
    </main>
    <!-- не показываем футер на экранах логина/регистрации -->
    <FooterComponent v-if="!isAuthRoute" />
    <Toast
      :message="toastMessage"
      :type="toastType"
      @close="clearToast"
    />
  </div>
</template>

<script>
import HeaderComponent from '@/components/Header.vue'
import FooterComponent from '@/components/Footer.vue'
import Toast from '@/components/Toast.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
    Toast,
  },
  data() {
    return {
      toastMessage: '',
      toastType: 'info'
    };
  },
  computed: {
    isAuthRoute() {
      const authPaths = ['/login', '/register', '/profile'];
      return authPaths.includes(this.$route.path);
    }
  },
  methods: {
    showToast(message, type = 'info') {
      this.toastMessage = message;
      this.toastType = type;
    },
    clearToast() {
      this.toastMessage = '';
    }
  },
  provide() {
    return {
      showToast: this.showToast
    };
  }
}
</script>

<style>
body {
  margin: 0;
  background-color: #ffffff;
}
</style>
