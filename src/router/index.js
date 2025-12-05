import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
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
]



const router = createRouter({
  history: createWebHistory(),
  routes  
})

export default router
