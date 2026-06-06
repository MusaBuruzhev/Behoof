import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: () => import('@/views/Catalog/CatalogView.vue'),
    },
    {
      path: '/catalog/:categoryId',
      name: 'category',
      component: () => import('@/views/Catalog/CategoryView.vue'),
    },
    {
      path: '/catalog/:categoryId/:subcategoryId',
      name: 'subcategory',
      component: () => import('@/views/Catalog/SubcategoryView.vue'),
    },
    {
      path: '/product/:id',
      name: 'product',
      component: () => import('@/views/Product/ProductView.vue'),
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('@/views/Auth/LoginView.vue'),
    },
    {
      path: '/auth/register',
      name: 'register',
      component: () => import('@/views/Auth/RegisterView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/Profile/ProfileView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/Favorites/FavoritesView.vue'),
    },
    {
      path: '/comparison',
      name: 'comparison',
      component: () => import('@/views/Comparison/ComparisonView.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/views/Order/OrdersView.vue'),
    },
    {
      path: '/orders/:id',
      name: 'order',
      component: () => import('@/views/Order/OrderDetailView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin/AdminDashboard.vue'),
    },
  ],
})

export default router
