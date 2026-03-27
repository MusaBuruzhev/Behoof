import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import AddProductView from '@/views/AddProductView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import CatalogView from '@/views/CatalogView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import ComparisonView from '@/views/ComparisonView.vue'
import OrdersView from '@/views/OrdersView.vue'
import AdminPanelView from '@/views/AdminPanelView.vue'
import authAPI from '@/api/auth.js'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView,
  },
 {
 path: '/add-product',
 name: 'add-product',
 component: AddProductView,
 meta: { requiresAuth: true, requiresAdmin: true },
 },
  {
    path: '/product/:id',
    name: 'product-detail',
    component: ProductDetailView,
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: CatalogView,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: FavoritesView,
  },
  {
    path: '/comparison',
    name: 'comparison',
    component: ComparisonView,
  },
 {
 path: '/orders',
 name: 'orders',
 component: OrdersView,
 meta: { requiresAuth: true },
 },
 {
 path: '/admin',
 name: 'admin',
 component: AdminPanelView,
 meta: { requiresAuth: true, requiresAdmin: true },
 },
  {
    path: '/notifications',
    name: 'notifications',
    component: { template: '<div style="padding: 40px; text-align: center;"><h1>🔔 Уведомления</h1><p>Раздел в разработке</p></div>' },
  },
]



const router = createRouter({
 history: createWebHistory(),
 routes
})

router.beforeEach(async (to) => {
 if (!to.meta.requiresAuth && !to.meta.requiresAdmin) {
 return true;
 }

 const token = authAPI.getToken();
 if (!token) {
 return { path: '/login', query: { redirect: to.fullPath } };
 }

 const verification = await authAPI.verifyToken();
 if (!verification.valid) {
 return { path: '/login', query: { redirect: to.fullPath } };
 }

 if (to.meta.requiresAdmin && verification.user?.role !== 'admin') {
 return { path: '/' };
 }

 if (verification.user) {
 localStorage.setItem('user', JSON.stringify(verification.user));
 }

 return true;
});

export default router
