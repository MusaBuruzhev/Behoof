<template>
  <div id="app">
    <HeaderComponent />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import HeaderComponent from '@/components/Header.vue'

export default {
  name: 'App',
  components: {
    HeaderComponent,
  },
}
</script>

<style>
body {
  margin: 0;
  background-color: #ffffff;
}
</style>
