<template>
  <div id="app">
    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppHeader from "@/components/common/AppHeader.vue";
import {
  useAuthStore,
  useFavoritesStore,
  useNotificationsStore,
  useCartStore,
} from "@/stores";

const authStore = useAuthStore();
const favoritesStore = useFavoritesStore();
const notificationsStore = useNotificationsStore();
const cartStore = useCartStore();

onMounted(async () => {
  await authStore.initializeAuth();

  if (authStore.isAuthenticated) {
    await cartStore.fetchCart();
  }

  if (authStore.isAuthenticated) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/favorites`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        favoritesStore.setFavorites(data.productIds || []);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }

  if (authStore.isAuthenticated) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        notificationsStore.setNotifications(data.notifications || []);
        notificationsStore.setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }
});
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
