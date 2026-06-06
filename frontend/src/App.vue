<template>
  <div id="app">
    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useAuthStore, useFavoritesStore, useNotificationsStore } from '@/stores'

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const notificationsStore = useNotificationsStore()

onMounted(async () => {
  // Инициализация авторизации
  await authStore.initializeAuth()
  
  // Загрузка избранных товаров
  try {
    const response = await fetch('/api/favorites', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      favoritesStore.setFavorites(data.productIds || [])
    }
  } catch (error) {
    console.error('Failed to load favorites:', error)
  }
  
  // Загрузка уведомлений
  try {
    const response = await fetch('/api/notifications', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      const data = await response.json()
      notificationsStore.setNotifications(data.notifications || [])
      notificationsStore.setUnreadCount(data.unreadCount || 0)
    }
  } catch (error) {
    console.error('Failed to load notifications:', error)
  }
})
</script>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
</style>
