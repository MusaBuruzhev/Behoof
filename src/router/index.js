import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import AddProductView from '@/views/AddProductView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import CatalogView from '@/views/CatalogView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
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
    component: { template: '<div style="padding: 40px; text-align: center;"><h1>⚖️ Сравнение товаров</h1><p>Раздел в разработке</p></div>' },
  },
  {
    path: '/orders',
    name: 'orders',
    component: { template: '<div style="padding: 40px; text-align: center;"><h1>📦 Мои заказы</h1><p>Раздел в разработке</p></div>' },
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

export default router
