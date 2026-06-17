import { defineStore } from 'pinia'
import api from '@/api/axios'
import type { User, Cart, CartItem } from '@/types'

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

// Cart store - корзина
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    totalAmount: 0,
    itemCount: 0,
    id: null as string | null,
    isLoading: false,
    isInitialized: false,
  }),

  getters: {
    isEmpty: (state) => state.items.length === 0,
    cartItemsCount: (state) => state.itemCount,
    formattedTotal: (state) => state.totalAmount.toLocaleString('ru-RU'),
    getItemQuantity: (state) => (productId: string) => {
      const item = state.items.find(item => item.productId === productId)
      return item ? item.quantity : 0
    },
    isInCart: (state) => (productId: string) => {
      return state.items.some(item => item.productId === productId)
    },
  },

  actions: {
    setCart(cart: Cart) {
      this.items = cart.items
      this.totalAmount = cart.totalAmount
      this.itemCount = cart.itemCount
      this.id = cart.id
      this.isInitialized = true
    },

    updateItem(productId: string, quantity: number) {
      const item = this.items.find(item => item.productId === productId)
      if (item) {
        item.quantity = quantity
      }
      this.recalculateTotals()
    },

    removeItem(productId: string) {
      this.items = this.items.filter(item => item.productId !== productId)
      this.recalculateTotals()
    },

    addItem(item: CartItem) {
      const existingItem = this.items.find(i => i.productId === item.productId)
      if (existingItem) {
        existingItem.quantity += item.quantity
      } else {
        this.items.push(item)
      }
      this.recalculateTotals()
    },

    clear() {
      this.items = []
      this.totalAmount = 0
      this.itemCount = 0
      this.id = null
    },

    recalculateTotals() {
      this.itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0)
      this.totalAmount = this.items.reduce((sum, item) => sum + item.subtotal, 0)
    },

    async fetchCart() {
      this.isLoading = true
      try {
        const response = await api.get('/cart')
        this.setCart(response.data)
      } catch (error: any) {
        // Если токен невалидный (401), очищаем корзину и не показываем ошибку
        if (error?.response?.status === 401) {
          this.clear()
          return
        }
        console.error('Failed to fetch cart:', error)
      } finally {
        this.isLoading = false
      }
    },

    async addToCart(productId: string, quantity: number = 1) {
      this.isLoading = true
      try {
        const response = await api.post('/cart/items', { productId, quantity })
        this.setCart(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to add to cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async updateQuantity(productId: string, quantity: number) {
      this.isLoading = true
      try {
        const response = await api.put(`/cart/items/${productId}`, { quantity })
        this.setCart(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to update quantity:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async removeFromCart(productId: string) {
      this.isLoading = true
      try {
        const response = await api.delete(`/cart/items/${productId}`)
        this.setCart(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to remove from cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },

    async clearCart() {
      this.isLoading = true
      try {
        const response = await api.delete('/cart')
        this.setCart(response.data)
        return response.data
      } catch (error) {
        console.error('Failed to clear cart:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
  },
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

// Admin store - админ-панель
export const useAdminStore = defineStore('admin', {
  state: () => ({
    stats: {
      totalProducts: 0,
      totalUsers: 0,
      totalOrders: 0,
      totalCategories: 0,
      totalBrands: 0,
      recentOrders: [] as any[],
      recentUsers: [] as any[],
      recentProducts: [] as any[],
    },
    products: {
      items: [] as any[],
      total: 0,
      page: 1,
      limit: 20,
      isLoading: false,
    },
    users: {
      items: [] as any[],
      total: 0,
      page: 1,
      limit: 20,
      isLoading: false,
    },
    orders: {
      items: [] as any[],
      total: 0,
      active: 0,
      history: 0,
      page: 1,
      limit: 20,
      isLoading: false,
    },
    categories: {
      items: [] as any[],
      isLoading: false,
    },
    brands: {
      items: [] as any[],
      isLoading: false,
    },
  }),

  getters: {
    totalPages: (state) => ({
      products: Math.ceil(state.products.total / state.products.limit),
      users: Math.ceil(state.users.total / state.users.limit),
      orders: Math.ceil(state.orders.total / state.orders.limit),
    }),
  },

  actions: {
    // Stats
    setStats(stats: any) {
      this.stats = {
        totalProducts: stats.totalProducts || 0,
        totalUsers: stats.totalUsers || 0,
        totalOrders: stats.totalOrders || 0,
        totalCategories: stats.totalCategories || 0,
        totalBrands: stats.totalBrands || 0,
        recentOrders: stats.recentOrders || [],
        recentUsers: stats.recentUsers || [],
        recentProducts: stats.recentProducts || [],
      }
    },

    async fetchStats() {
      try {
        const response = await api.get('/admin/stats')
        this.setStats(response.data)
      } catch (error) {
        // error handled silently
      }
    },

    // Products
    setProducts(data: any) {
      this.products.items = data.items
      this.products.total = data.total
    },

    async fetchProducts(page: number = 1) {
      this.products.isLoading = true
      try {
        const response = await api.get('/products', {
          params: { page, limit: this.products.limit },
        })
        this.setProducts(response.data)
        this.products.page = page
      } catch (error) {
        // error handled silently
      } finally {
        this.products.isLoading = false
      }
    },

    async addProduct(productData: any) {
      try {
        let response
        if (productData instanceof FormData) {
          response = await api.post('/products', productData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          response = await api.post('/products', productData)
        }
        await this.fetchProducts(1)
        return response.data
      } catch (error) {
        throw error
      }
    },

    async updateProduct(productId: string, productData: any) {
      try {
        await api.put(`/products/${productId}`, productData)
        await this.fetchProducts(this.products.page)
      } catch (error) {
        throw error
      }
    },

    async deleteProduct(productId: string) {
      try {
        await api.delete(`/products/${productId}`)
        await this.fetchProducts(this.products.page)
      } catch (error) {
        throw error
      }
    },

    // Users
    setUsers(data: any) {
      this.users.items = data.users || data.items
      this.users.total = data.total || data.users?.length || 0
    },

    async fetchUsers(page: number = 1) {
      this.users.isLoading = true
      try {
        const response = await api.get('/admin/users', {
          params: { page, limit: this.users.limit },
        })
        this.setUsers(response.data)
        this.users.page = page
      } catch (error) {
        // error handled silently
      } finally {
        this.users.isLoading = false
      }
    },

    async updateUserRole(userId: string, role: string) {
      try {
        await api.put(`/admin/users/${userId}/role`, { role })
        await this.fetchUsers(this.users.page)
      } catch (error) {
        throw error
      }
    },

    async deleteUser(userId: string) {
      try {
        await api.delete(`/admin/users/${userId}`)
        await this.fetchUsers(this.users.page)
      } catch (error) {
        throw error
      }
    },

    // Orders
    setOrders(data: any) {
      this.orders.items = data.orders || data.items
      this.orders.total = data.total || data.orders?.length || 0
    },

    async fetchOrders(page: number = 1, filter: string = 'active') {
      this.orders.isLoading = true
      try {
        const response = await api.get('/admin/orders', {
          params: { page, limit: this.orders.limit, filter },
        })
        this.setOrders(response.data)
        this.orders.page = page
        this.orders.total = response.data.stats?.total || response.data.orders?.length || 0
        this.orders.active = response.data.stats?.active || 0
        this.orders.history = response.data.stats?.history || 0
      } catch (error) {
        // error handled silently
      } finally {
        this.orders.isLoading = false
      }
    },

    async updateOrderStatus(orderId: string, status: string, preorderMessage?: string) {
      try {
        await api.put(`/admin/orders/${orderId}/status`, { status, preorderMessage })
        await this.fetchOrders(this.orders.page)
      } catch (error) {
        throw error
      }
    },

    async deleteOrder(orderId: string) {
      try {
        await api.delete(`/admin/orders/${orderId}`)
        await this.fetchOrders(this.orders.page)
      } catch (error) {
        throw error
      }
    },

    // Categories
    setCategories(items: any[]) {
      this.categories.items = items
    },

    async fetchCategories() {
      this.categories.isLoading = true
      try {
        const response = await api.get('/admin/categories')
        this.setCategories(response.data.categories || response.data || [])
      } catch (error) {
        // error handled silently
        throw error
      } finally {
        this.categories.isLoading = false
      }
    },

    async fetchSubcategories() {
      this.brands.isLoading = true
      try {
        const response = await api.get('/admin/subcategories')
        this.brands.items = response.data.subcategories || response.data || []
      } catch (error) {
        // error handled silently
        throw error
      } finally {
        this.brands.isLoading = false
      }
    },

    async createCategory(categoryData: any) {
      try {
        await api.post('/admin/categories', categoryData)
        await this.fetchCategories()
      } catch (error) {
        // error handled silently
        throw error
      }
    },

    async updateCategory(categoryId: string, categoryData: any) {
      try {
        await api.put(`/admin/categories/${categoryId}`, categoryData)
        await this.fetchCategories()
      } catch (error) {
        throw error
      }
    },

    async deleteCategory(categoryId: string) {
      try {
        await api.delete(`/admin/categories/${categoryId}`)
        await this.fetchCategories()
      } catch (error) {
        throw error
      }
    },

    // Brands = Subcategories (legacy naming for backwards compatibility)
    setBrands(items: any[]) {
      this.brands.items = items
    },

    async fetchBrands() {
      return this.fetchSubcategories()
    },

    async createBrand(brandData: any) {
      return api.post('/admin/subcategories', brandData)
    },

    async updateBrand(brandId: string, brandData: any) {
      return api.put(`/admin/subcategories/${brandId}`, brandData)
    },

    async deleteBrand(brandId: string) {
      return api.delete(`/admin/subcategories/${brandId}`)
    },
  },
})
