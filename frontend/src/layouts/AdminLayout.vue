<template>
  <div class="admin-layout">
    <AdminSidebar />
    <div class="admin-main">
      <AdminHeader />
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'

const authStore = useAuthStore()
const router = useRouter()


onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  
  if (authStore.user?.role !== 'admin') {
    router.push('/')
    return
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background-color: var(--color-background);
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-6);
}

@media (max-width: 768px) {
  .admin-layout {
    flex-direction: column;
  }

  .admin-content {
    padding: var(--spacing-4);
  }
}
</style>
