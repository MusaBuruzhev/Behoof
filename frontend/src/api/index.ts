import api from './axios'

// ==================== Каталог ====================

/** Получить полный каталог (категории, подкатегории, товары) */
export const getCatalog = () => api.get('/catalog')

/** Получить список товаров с фильтрацией и пагинацией */
export const getProducts = (params?: {
  page?: number
  limit?: number
  q?: string
  categoryId?: string
  subcategoryId?: string
  brand?: string
  priceMin?: number
  priceMax?: number
  sortBy?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'date-desc'
}) => api.get('/products', { params })

/** Получить товар по ID */
export const getProduct = (id: string) => api.get(`/products/${id}`)

/** Получить товары по списку ID */
export const getProductsByIds = (ids: string[]) =>
  api.post('/products/by-ids', { ids })

/** Добавить товар (только админ) */
export const addProduct = (formData: FormData) =>
  api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

/** Обновить товар (только админ) */
export const updateProduct = (id: string, data: any) =>
  api.put(`/products/${id}`, data)

/** Удалить товар (только админ) */
export const deleteProduct = (id: string) => api.delete(`/products/${id}`)

/** Добавить отзыв к товару */
export const addReview = (productId: string, data: { text: string; traitRatings?: Record<string, number> }) =>
  api.post(`/products/${productId}/reviews`, data)

/** Удалить отзыв */
export const deleteReview = (productId: string, reviewId: string) =>
  api.delete(`/products/${productId}/reviews/${reviewId}`)

/** Инициализировать начальные данные (только админ) */
export const initializeData = () => api.post('/initialize')

// ==================== Авторизация ====================

/** Регистрация пользователя */
export const register = (data: {
  email: string
  password: string
  firstName: string
  lastName: string
  phoneNumber?: string
}) => api.post('/auth/register', data)

/** Вход пользователя */
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data)

/** Получить профиль пользователя */
export const getProfile = () => api.get('/auth/profile')

/** Обновить профиль пользователя */
export const updateProfile = (data: {
  firstName?: string
  lastName?: string
  phoneNumber?: string
}) => api.put('/auth/profile', data)

/** Удалить профиль пользователя */
export const deleteProfile = () => api.delete('/auth/profile')

/** Верификация токена */
export const verifyToken = () => api.get('/auth/verify')

/** Выход пользователя */
export const logout = () => api.post('/auth/logout')

// ==================== Избранное ====================

/** Добавить в избранное */
export const addToFavorites = (productId: string) =>
  api.post('/favorites/add', { productId })

/** Удалить из избранного */
export const removeFromFavorites = (productId: string) =>
  api.post('/favorites/remove', { productId })

/** Получить избранное */
export const getFavorites = () => api.get('/favorites')

// ==================== Заказы ====================

/** Создать заказ */
export const createOrder = (data: {
  productId: string
  pickupAt: string
  contactPhone?: string
  comment?: string
}) => api.post('/orders', data)

/** Получить мои заказы */
export const getMyOrders = () => api.get('/orders/my')

/** Отменить мой заказ */
export const cancelMyOrder = (orderId: string) =>
  api.put(`/orders/my/${orderId}/cancel`)

/** Удалить мой заказ (в историю) */
export const deleteMyOrder = (orderId: string) =>
  api.delete(`/orders/my/${orderId}`)

// ==================== Уведомления ====================

/** Получить уведомления пользователя */
export const getNotifications = (params?: {
  page?: number
  limit?: number
  isRead?: boolean
}) => api.get('/notifications', { params })

/** Получить количество непрочитанных уведомлений */
export const getUnreadCount = () => api.get('/notifications/unread-count')

/** Отметить уведомление как прочитанное */
export const markAsRead = (notificationId: string) =>
  api.put(`/notifications/${notificationId}/read`)

/** Отметить все уведомления как прочитанные */
export const markAllAsRead = () => api.put('/notifications/read-all')

/** Удалить уведомление */
export const deleteNotification = (notificationId: string) =>
  api.delete(`/notifications/${notificationId}`)

/** Удалить все прочитанные уведомления */
export const clearReadNotifications = () =>
  api.delete('/notifications/clear-read')

// ==================== Админ ====================

/** Получить всех пользователей (только админ) */
export const getAdminUsers = () => api.get('/admin/users')

/** Получить статистику (только админ) */
export const getAdminStats = () => api.get('/admin/stats')

/** Обновить роль пользователя (только админ) */
export const updateUserRole = (userId: string, role: 'user' | 'admin') =>
  api.put(`/admin/users/${userId}/role`, { role })

/** Удалить пользователя (только админ) */
export const deleteUserByAdmin = (userId: string) =>
  api.delete(`/admin/users/${userId}`)

/** Получить все заказы (только админ) */
export const getAllOrdersAdmin = () => api.get('/admin/orders')

/** Обновить статус заказа (только админ) */
export const updateOrderStatusAdmin = (orderId: string, status: string) =>
  api.put(`/admin/orders/${orderId}/status`, { status })

/** Удалить заказ (только админ) */
export const deleteOrderAdmin = (orderId: string) =>
  api.delete(`/admin/orders/${orderId}`)

/** Получить все уведомления (только админ) */
export const getAllNotificationsAdmin = () =>
  api.get('/admin/notifications')

/** Получить пользователей для уведомлений (только админ) */
export const getUsersForNotifications = () =>
  api.get('/admin/users-list')

/** Отправить уведомление пользователю (только админ) */
export const sendAdminNotification = (data: {
  userId?: string;
  type: string;
  title: string;
  message: string;
}) => api.post('/admin/notifications', data)

/** Получить все субкатегории (только админ) */
export const getSubcategories = () => api.get('/admin/subcategories')

/** Создать субкатегорию/бренд (только админ) */
export const createSubcategory = (data: { name: string; categoryId: string }) =>
  api.post('/admin/subcategories', data)

/** Обновить субкатегорию/бренд (только админ) */
export const updateSubcategory = (id: string, data: { name?: string }) =>
  api.put(`/admin/subcategories/${id}`, data)

/** Удалить субкатегорию/бренд (только админ) */
export const deleteSubcategory = (id: string) => api.delete(`/admin/subcategories/${id}`)

/** Получить все категории (только админ) */
export const getCategories = () => api.get('/admin/categories')

/** Создать категорию (только админ) */
export const createCategory = (data: { name: string; description?: string }) =>
  api.post('/admin/categories', data)

/** Обновить категорию (только админ) */
export const updateCategory = (id: string, data: { name?: string; description?: string }) =>
  api.put(`/admin/categories/${id}`, data)

/** Удалить категорию (только админ) */
export const deleteCategory = (id: string) => api.delete(`/admin/categories/${id}`)

// ==================== Корзина ====================

/** Получить корзину пользователя */
export const getCart = () => api.get('/cart')

/** Добавить товар в корзину */
export const addToCart = (data: { productId: string; quantity?: number }) =>
  api.post('/cart/items', data)

/** Обновить количество товара в корзине */
export const updateCartItem = (productId: string, quantity: number) =>
  api.put(`/cart/items/${productId}`, { quantity })

/** Удалить товар из корзины */
export const removeFromCart = (productId: string) =>
  api.delete(`/cart/items/${productId}`)

/** Очистить корзину */
export const clearCart = () => api.delete('/cart')
