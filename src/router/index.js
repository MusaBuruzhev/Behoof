import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import AddProductView from '@/views/AddProductView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
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
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
