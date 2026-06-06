import { defineStore } from 'pinia'
import type { User } from '@/types'

// Auth store - управление состоянием авторизации
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isLoading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => {
      if (!state.user) return ''
      return `${state.user.firstName} ${state.user.lastName}`.trim() || state.user.email
    },
    userInitials: (state) => {
      if (!state.user) return ''
      const name = `${state.user.firstName} ${state.user.lastName}`.trim() || state.user.email
      return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
    },
  },

  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },

    logout() {
      this.user = null
      this.token = null
      this.initialized = true
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    async initializeAuth() {
      if (this.initialized) return
      
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as User
          this.user = user
          this.token = token
          this.initialized = true
        } catch {
          this.logout()
        }
      } else {
        this.initialized = true
      }
    },

    updateUser(user: Partial<User>) {
      if (this.user) {
        this.user = { ...this.user, ...user }
        localStorage.setItem('user', JSON.stringify(this.user))
      }
    },
  },
})

// Catalog store - каталог товаров
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    categories: [] as any[],
    subcategories: {} as Record<string, any>,
    products: {} as Record<string, any>,
    isLoading: false,
  }),

  getters: {
    getCategoryById: (state) => (id: string) => state.categories.find(c => c.id === id),
    getSubcategoryById: (state) => (id: string) => state.subcategories[id],
    getProductById: (state) => (id: string) => state.products[id],
  },

  actions: {
    setCatalog(data: { categories: any[]; subcategories: Record<string, any>; products: Record<string, any> }) {
      this.categories = data.categories
      this.subcategories = data.subcategories
      this.products = data.products
    },
  },
})

// Favorites store - избранное
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    productIds: [] as string[],
    isLoading: false,
  }),

  getters: {
    isFavorite: (state) => (productId: string) => state.productIds.includes(productId),
    favoritesCount: (state) => state.productIds.length,
  },

  actions: {
    setFavorites(ids: string[]) {
      this.productIds = ids
    },
    addFavorite(productId: string) {
      if (!this.productIds.includes(productId)) {
        this.productIds.push(productId)
      }
    },
    removeFavorite(productId: string) {
      this.productIds = this.productIds.filter(id => id !== productId)
    },
  },
})

// Cart store - корзина (если понадобится в будущем)
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as any[],
  }),
})

// Orders store - заказы
export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [] as any[],
    isLoading: false,
  }),

  actions: {
    setOrders(orders: any[]) {
      this.orders = orders
    },
    addOrder(order: any) {
      this.orders.unshift(order)
    },
    updateOrderStatus(orderId: string, status: string) {
      const order = this.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
  },
})

// Notifications store - уведомления
export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as any[],
    unreadCount: 0,
    isLoading: false,
  }),

  getters: {
    unreadNotifications: (state) => state.notifications.filter(n => !n.isRead),
  },

  actions: {
    setNotifications(notifications: any[]) {
      this.notifications = notifications
    },
    setUnreadCount(count: number) {
      this.unreadCount = count
    },
    markAsRead(notificationId: string) {
      const notification = this.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.isRead = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      }
    },
    markAllAsRead() {
      this.notifications.forEach(n => n.isRead = true)
      this.unreadCount = 0
    },
  },
})

// Comparison store - сравнение товаров
export const useComparisonStore = defineStore('comparison', {
  state: () => ({
    productIds: [] as string[],
  }),

  getters: {
    isInCompare: (state) => (productId: string) => state.productIds.includes(productId),
    compareCount: (state) => state.productIds.length,
    maxReached: (state) => state.productIds.length >= 4,
  },

  actions: {
    addToCompare(productId: string) {
      if (!this.productIds.includes(productId) && this.productIds.length < 4) {
        this.productIds = [...this.productIds, productId]
      }
    },
    removeFromCompare(productId: string) {
      this.productIds = this.productIds.filter(id => id !== productId)
    },
    clearCompare() {
      this.productIds = []
    },
  },
})
