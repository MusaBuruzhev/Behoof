import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores'

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
      path: '/auth/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/Auth/ForgotPasswordView.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/layouts/ProfileLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'profile-main',
          component: () => import('@/views/Profile/ProfileView.vue'),
        },
        {
          path: 'orders',
          name: 'profile-orders',
          component: () => import('@/views/Profile/OrdersView.vue'),
        },
        {
          path: 'orders/:id',
          name: 'profile-order-detail',
          component: () => import('@/views/Profile/OrderDetailView.vue'),
        },
        {
          path: 'notifications',
          name: 'profile-notifications',
          component: () => import('@/views/Profile/NotificationsView.vue'),
        },
        {
          path: 'security',
          name: 'profile-security',
          component: () => import('@/views/Profile/SecurityView.vue'),
        },
      ],
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/Favorites/FavoritesView.vue'),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: '/orders/:id',
      name: 'order',
      component: () => import('@/views/Order/OrderDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/Admin/AdminDashboard.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
})

// Navigation guard для защиты маршрутов
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Инициализируем auth store если ещё не инициализирован
  if (!authStore.initialized) {
    authStore.initializeAuth()
  }
  
  // Проверка на требуемую авторизацию
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    })
    return
  }
  
  // Проверка на админский доступ
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ path: '/' })
    return
  }
  
  // Если уже авторизован и пытается зайти на страницы авторизации
  if (
    authStore.isAuthenticated &&
    ['/auth/login', '/auth/register'].includes(to.path)
  ) {
    const redirect = to.query.redirect as string || '/profile'
    next(redirect)
    return
  }
  
  next()
})

export default router
