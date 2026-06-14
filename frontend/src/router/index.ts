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
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/Cart/CartView.vue'),
      meta: { requiresAuth: true },
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
      path: '/notifications',
      redirect: '/profile/notifications',
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/dashboard',
      redirect: '/admin',
    },
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('@/views/Admin/AdminDashboard.vue'),
        },
        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/Admin/ProductsAdmin.vue'),
        },
        {
          path: 'products/new',
          name: 'admin-product-create',
          component: () => import('@/views/Admin/ProductEditAdmin.vue'),
        },
        {
          path: 'products/:id',
          name: 'admin-product-edit',
          component: () => import('@/views/Admin/ProductEditAdmin.vue'),
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/Admin/UsersAdmin.vue'),
        },
        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/Admin/OrdersAdmin.vue'),
        },
        {
          path: 'catalog',
          name: 'admin-catalog',
          component: () => import('@/views/Admin/CatalogAdmin.vue'),
        },
        {
          path: 'categories',
          name: 'admin-categories',
          component: () => import('@/views/Admin/CategoriesAdmin.vue'),
        },
        {
          path: 'brands',
          name: 'admin-brands',
          component: () => import('@/views/Admin/BrandsAdmin.vue'),
        },
        {
          path: 'notifications',
          name: 'admin-notifications',
          component: () => import('@/views/Admin/NotificationsAdmin.vue'),
        },
        {
          path: 'characteristics',
          name: 'admin-characteristics',
          component: () => import('@/views/Admin/CharacteristicsView.vue'),
        },
      ],
    },
  ],
})

// Navigation guard для защиты маршрутов
router.beforeEach((to, _from) => {
  const authStore = useAuthStore()
  
  // Инициализируем auth store если ещё не инициализирован
  if (!authStore.initialized) {
    authStore.initializeAuth()
  }
  
  // Проверка на требуемую авторизацию
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return {
      path: '/auth/login',
      query: { redirect: to.fullPath },
    }
  }
  
  // Проверка на админский доступ
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { path: '/' }
  }
  
  // Если уже авторизован и пытается зайти на страницы авторизации
  if (
    authStore.isAuthenticated &&
    ['/auth/login', '/auth/register'].includes(to.path)
  ) {
    const redirect = to.query.redirect as string || '/profile'
    return { path: redirect }
  }
  
  // Продолжить навигацию
  return true
})

export default router
