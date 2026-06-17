// ==================== Категории ====================

export interface Category {
  id: string
  name: string
  subcategoryIds: string[]
  createdAt?: string
  updatedAt?: string
}

// ==================== Подкатегории ====================

export interface Subcategory {
  id: string
  name: string
  categoryId: string
  productIds: string[]
  isAllCategory: boolean
  createdAt?: string
  updatedAt?: string
}

// ==================== Товары ====================

export interface Review {
  id?: string
  userId: string
  userName: string
  userAvatar: string | null
  text: string
  traitRatings: Record<string, number>
  createdAt: string
}

export interface Product {
  id: string
  name: string
  price: number
  priceHistory: { date: string; price: number }[]
  description: string
  characteristics: { trait: string; value: string }[]
  brand: string
  categoryId: string
  subcategoryId: string
  modelId: string
  traitRatings: Record<string, number>
  images: string[]
  reviews: Review[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  limit: number
}

export interface CatalogResponse {
  categories: Category[]
  subcategories: Record<string, Subcategory>
  models: Record<string, any>
  products: Record<string, Product>
}

// ==================== Пользователи ====================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  phoneNumber?: string | null
  address?: {
    street?: string | null
    city?: string | null
    postalCode?: string | null
    country?: string | null
  }
  avatar?: string | null
  birthDate?: string | null
  favorites: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: User
}

// ==================== Заказы ====================

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'preorder' | 'ready_for_pickup' | 'delivering' | 'completed' | 'cancelled'

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  deliveryType: 'pickup' | 'delivery'
  deliveryAddress?: string
  pickupDate?: string
  preorderMessage?: string
  verificationCode?: string
  contactPhone: string
  contactName: string
  isDeleted: boolean
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

// ==================== Уведомления ====================

export type NotificationType = 'new_order' | 'order_status' | 'new_product' | 'promo'
export type NotificationRelatedType = 'order' | 'product' | null

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  isDeleted: boolean
  relatedId: string | null
  relatedType: NotificationRelatedType
  isNew?: boolean
  createdAt: string
  updatedAt: string
}

export interface NotificationsResponse {
  notifications: Notification[]
  total: number
  page: number
  limit: number
}

// ==================== Избранное ====================

export interface FavoritesResponse {
  favorites: string[]
}

// ==================== Корзина ====================

export interface CartItem {
  productId: string
  quantity: number
  product: Product | null
  subtotal: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  totalAmount: number
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface CartResponse extends Cart {
  message?: string
}

export interface AdminStats {
  totalUsers: number
  totalProducts: number
  totalOrders: number
  totalRevenue: number
}
