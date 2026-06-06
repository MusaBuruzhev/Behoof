<template>
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">Загрузка товара...</p>
  </div>
  
  <div v-else-if="!product" class="not-found">
    <svg class="not-found-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
    <h1>Товар не найден</h1>
    <p>К сожалению, товар не существует или был удалён</p>
    <router-link to="/catalog" class="btn btn-primary">
      Вернуться в каталог
    </router-link>
  </div>
  
  <div v-else class="product-detail">
    <!-- Sticky Buy Bar -->
    <transition name="sticky-bar">
      <div v-if="showStickyBar" class="sticky-buy-bar">
        <div class="container sticky-bar-container">
          <div class="sticky-bar-content">
            <img :src="allImages[0]" :alt="product.name" class="sticky-bar-image" />
            <div class="sticky-bar-info">
              <span class="sticky-bar-brand">{{ product.brand }}</span>
              <h3 class="sticky-bar-name">{{ product.name }}</h3>
            </div>
            <div class="sticky-bar-price">{{ formatPrice(product.price) }} ₽</div>
            <button class="btn btn-primary btn-buy" @click="openOrderModal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Купить
            </button>
          </div>
        </div>
      </div>
    </transition>
      
    <div class="container">
      <!-- HERO PRODUCT -->
      <section class="hero-product">
        <div class="hero-gallery">
          <div class="gallery-main-wrapper">
            <div class="gallery-main">
              <img
                :src="allImages[currentImageIndex]"
                :alt="product.name"
                class="main-image"
                @mouseenter="enableZoom"
                @mousemove="handleZoom"
                @mouseleave="disableZoom"
                ref="mainImageRef"
              />
              <div
                v-if="isZoomed"
                class="zoom-lens"
                :style="lensStyle"
              ></div>
            </div>
          </div>
          
          <div v-if="allImages.length > 1" class="gallery-thumbnails">
            <button
              v-for="(image, index) in allImages"
              :key="index"
              :class="['thumbnail', { active: currentImageIndex === index }]"
              @click="currentImageIndex = index"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" loading="lazy" />
            </button>
          </div>
        </div>
        
        <div class="hero-info">
          <div class="hero-brand">{{ product.brand }}</div>
          <h1 class="hero-title">{{ product.name }}</h1>
          
          <div v-if="hasRatings" class="hero-rating">
            <div class="rating-stars">
              <svg
                v-for="star in 5"
                :key="star"
                class="star-icon"
                viewBox="0 0 24 24"
                :fill="star <= averageRating ? 'currentColor' : 'none'"
                :stroke="star <= averageRating ? 'currentColor' : '#D1D5DB'"
                stroke-width="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span class="rating-value">{{ averageRating.toFixed(1) }}</span>
            <span class="rating-separator">•</span>
            <router-link to="#reviews" class="rating-link">{{ product.reviews.length }} отзывов</router-link>
          </div>
          
          <div class="hero-price-block">
            <div class="price-current">{{ formatPrice(product.price) }} ₽</div>
            <div v-if="hasPriceHistory" class="price-analytics">
              <span :class="['price-change', priceChangeClass]">
                {{ priceChangeLabel }}
              </span>
              <span class="price-period">за последний месяц</span>
            </div>
          </div>
          
          <p class="hero-description">{{ product.description }}</p>
          
          <!-- Quick Specs -->
          <div v-if="shortCharacteristics.length > 0" class="hero-quick-specs">
            <div
              v-for="spec in shortCharacteristics"
              :key="spec.trait"
              class="quick-spec-item"
            >
              <span class="quick-spec-trait">{{ spec.trait }}</span>
              <span class="quick-spec-value">{{ spec.value }}</span>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="hero-actions">
            <button
              class="btn btn-primary btn-buy-large"
              @click="openOrderModal"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Оформить заказ
            </button>
            
            <div class="action-buttons">
              <button
                class="btn btn-outline btn-icon"
                :class="{ active: isInCart }"
                @click="handleAddToCart"
                :disabled="isAddingToCart"
                title="Добавить в корзину"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <span>{{ isInCart ? 'В корзине' : 'В корзину' }}</span>
              </button>
              
              <button
                class="btn btn-outline btn-icon"
                :class="{ active: isFavorite }"
                @click="toggleFavorite"
                title="В избранное"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{{ isFavorite ? 'В избранном' : 'Избранное' }}</span>
              </button>
              
              <button
                class="btn btn-outline btn-icon"
                :class="{ active: isInCompare }"
                @click="toggleCompare"
                title="Сравнить"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
                </svg>
                <span>{{ isInCompare ? 'В сравнении' : 'Сравнить' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <!-- PRICE HISTORY -->
      <section v-if="hasPriceHistory" class="price-history-section">
        <div class="section-header">
          <div class="section-title-block">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <h2>Аналитика цены</h2>
          </div>
        </div>
        
        <div class="price-analytics-grid">
          <div class="analytics-card analytics-current">
            <span class="analytics-label">Текущая цена</span>
            <span class="analytics-value">{{ formatPrice(product.price) }} ₽</span>
          </div>
          
          <div class="analytics-card analytics-min">
            <span class="analytics-label">Минимальная</span>
            <span class="analytics-value">{{ formatPrice(minPrice) }} ₽</span>
          </div>
          
          <div class="analytics-card analytics-max">
            <span class="analytics-label">Максимальная</span>
            <span class="analytics-value">{{ formatPrice(maxPrice) }} ₽</span>
          </div>
          
          <div class="analytics-card analytics-change" :class="priceChangeClass">
            <span class="analytics-label">Изменение</span>
            <span class="analytics-value">{{ priceChangeLabel }}</span>
          </div>
        </div>
          
        <div class="price-chart-wrapper">
          <svg
            :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
            class="price-chart"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" :stop-color="priceChange >= 0 ? '#EF4444' : '#059669'" stop-opacity="0.3"/>
                <stop offset="100%" :stop-color="priceChange >= 0 ? '#EF4444' : '#059669'" stop-opacity="0"/>
              </linearGradient>
            </defs>
            
            <!-- Grid lines -->
            <line
              v-for="line in gridLines"
              :key="line.y"
              :x1="0"
              :y1="line.y"
              :x2="chartWidth"
              :y2="line.y"
              class="chart-grid"
            />
            
            <!-- Area fill -->
            <polyline
              :points="chartAreaPoints"
              class="chart-area"
              fill="url(#priceGradient)"
            />
            
            <!-- Line -->
            <polyline
              :points="chartPoints"
              class="chart-line"
              fill="none"
              :stroke="priceChange >= 0 ? '#EF4444' : '#059669'"
            />
            
            <!-- Points -->
            <circle
              v-for="(point, index) in chartDataPoints"
              :key="index"
              :cx="point.x"
              :cy="point.y"
              r="5"
              class="chart-point"
              :fill="priceChange >= 0 ? '#EF4444' : '#059669'"
            >
              <title>{{ formatDate(point.date.toISOString()) }}: {{ formatPrice(point.price) }} ₽</title>
            </circle>
          </svg>
          
          <div class="chart-dates">
            <span
              v-for="(date, index) in chartDates"
              :key="index"
              class="date-label"
            >
              {{ date }}
            </span>
          </div>
        </div>
      </section>
      
      <!-- CHARACTERISTICS -->
      <section v-if="product.characteristics.length > 0" class="characteristics-section">
        <div class="section-header">
          <div class="section-title-block">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <h2>Характеристики</h2>
          </div>
        </div>
        
        <div class="characteristics-grid">
          <div
            v-for="(spec, index) in product.characteristics"
            :key="index"
            class="characteristic-card"
          >
            <span class="characteristic-trait">{{ spec.trait }}</span>
            <span class="characteristic-value">{{ spec.value }}</span>
          </div>
        </div>
      </section>
      
      <!-- RATINGS -->
      <section v-if="hasTraitRatings" class="ratings-section">
        <div class="section-header">
          <div class="section-title-block">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <h2>Оценки характеристик</h2>
          </div>
        </div>
        
        <div class="trait-ratings-grid">
          <div
            v-for="(rating, trait) in product.traitRatings"
            :key="trait"
            class="trait-rating-card"
          >
            <div class="trait-header">
              <span class="trait-name">{{ trait }}</span>
              <span class="trait-value">{{ rating.toFixed(1) }}</span>
            </div>
            <div class="trait-progress">
              <div
                class="trait-progress-bar"
                :style="{ width: `${(rating / 5) * 100}%` }"
                :class="getRatingClass(rating)"
              ></div>
            </div>
          </div>
        </div>
      </section>
      
      <!-- PRODUCT DESCRIPTION -->
      <section v-if="product.description" class="description-section">
        <div class="section-header">
          <div class="section-title-block">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <h2>Описание</h2>
          </div>
        </div>
        
        <div class="description-content">
          <p>{{ product.description }}</p>
        </div>
      </section>
      
      <!-- REVIEWS -->
      <section id="reviews" class="reviews-section">
        <div class="reviews-header-block">
          <div class="section-title-block">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h2>Отзывы</h2>
          </div>
          <span class="reviews-badge">{{ product.reviews.length }}</span>
        </div>
        
        <!-- Review Form -->
        <div v-if="isAuthenticated" class="review-form-section">
          <form @submit.prevent="submitReview" class="review-form">
            <div class="form-group">
              <label for="review-text" class="form-label">Ваш отзыв</label>
              <textarea
                id="review-text"
                v-model="reviewText"
                class="form-textarea"
                placeholder="Расскажите о своём опыте использования товара..."
                rows="4"
                required
              ></textarea>
            </div>
            
            <div v-if="hasTraitRatings" class="trait-ratings-input">
              <div
                v-for="(_rating, trait) in product.traitRatings"
                :key="trait"
                class="trait-input"
              >
                <span class="trait-label">{{ trait }}</span>
                <div class="stars-input">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="star-btn"
                    :class="{ filled: star <= reviewRatings[trait] }"
                    @click="setRating(trait, star)"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? 'Отправка...' : 'Опубликовать отзыв' }}
            </button>
          </form>
        </div>
        
        <div v-else class="login-prompt">
          <p>Чтобы оставить отзыв, необходимо</p>
          <router-link to="/auth/login" class="link-primary">войти</router-link>
        </div>
        
        <!-- Reviews List -->
        <div class="reviews-list">
          <div
            v-for="review in product.reviews"
            :key="review.id"
            class="review-card"
          >
            <div class="review-card-header">
              <div class="reviewer-info">
                <div v-if="review.userAvatar" class="reviewer-avatar">
                  <img :src="review.userAvatar" :alt="review.userName" />
                </div>
                <div v-else class="reviewer-avatar-placeholder">
                  {{ getInitials(review.userName) }}
                </div>
                <div class="reviewer-details">
                  <span class="reviewer-name">{{ review.userName }}</span>
                  <span class="review-date">{{ formatDate(review.createdAt) }}</span>
                </div>
              </div>
              
              <button
                v-if="canDeleteReview(review)"
                class="delete-review-btn"
                @click="deleteReviewById(review.id!)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
            
            <div v-if="hasTraitRatingsInReview(review)" class="review-trait-ratings">
              <div
                v-for="(rating, trait) in review.traitRatings"
                :key="trait"
                class="review-trait"
              >
                <span class="trait-name">{{ trait }}</span>
                <div class="trait-stars">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    class="star-icon-small"
                    viewBox="0 0 24 24"
                    :fill="star <= rating ? 'currentColor' : 'none'"
                    :stroke="star <= rating ? 'currentColor' : '#D1D5DB'"
                    stroke-width="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <p class="review-text">{{ review.text }}</p>
          </div>
          
          <div v-if="product.reviews.length === 0" class="reviews-empty">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Пока нет отзывов</p>
            <p class="empty-subtitle">Будьте первым, кто оставит отзыв</p>
          </div>
        </div>
      </section>
      
      <!-- RELATED PRODUCTS -->
      <section v-if="relatedProducts.length > 0" class="related-section">
        <div class="section-header">
          <div class="section-title-block">
            <svg class="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <h2>Похожие товары</h2>
          </div>
        </div>
        
        <div class="related-grid">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct.id"
            :product="relatedProduct"
          />
        </div>
      </section>
    </div>
    
    <!-- Order Modal -->
    <div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Оформление заказа</h3>
          <button class="modal-close" @click="closeOrderModal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="submitOrder" class="order-form">
          <div class="order-product-info">
            <img :src="allImages[0]" :alt="product?.name" class="order-product-image" />
            <div class="order-product-details">
              <h4>{{ product?.name }}</h4>
              <span class="order-product-price">{{ formatPrice(product?.price) }} ₽</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="pickup-date" class="form-label">Дата получения *</label>
            <input
              id="pickup-date"
              v-model="orderForm.pickupAt"
              type="datetime-local"
              class="form-input"
              required
              :min="minPickupDate"
            />
          </div>
          
          <div class="form-group">
            <label for="contact-phone" class="form-label">Телефон</label>
            <input
              id="contact-phone"
              v-model="orderForm.contactPhone"
              type="tel"
              class="form-input"
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          
          <div class="form-group">
            <label for="order-comment" class="form-label">Комментарий</label>
            <textarea
              id="order-comment"
              v-model="orderForm.comment"
              class="form-textarea"
              placeholder="Дополнительная информация"
              rows="3"
            ></textarea>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeOrderModal">
              Отмена
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isOrderSubmitting">
              {{ isOrderSubmitting ? 'Оформление...' : 'Заказать' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProduct, addReview, deleteReview, createOrder, addToFavorites, removeFromFavorites } from '@/api'
import { useAuthStore, useFavoritesStore, useComparisonStore, useCartStore } from '@/stores'
import type { Product, Review } from '@/types'

import ProductCard from '@/components/catalog/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()
const comparisonStore = useComparisonStore()
const cartStore = useCartStore()

const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const isLoading = ref(true)
const currentImageIndex = ref(0)
const isFavorite = ref(false)
const showOrderModal = ref(false)
const isSubmitting = ref(false)
const isOrderSubmitting = ref(false)
const showStickyBar = ref(false)
const isAddingToCart = ref(false)

// Zoom
const mainImageRef = ref<HTMLImageElement | null>(null)
const isZoomed = ref(false)
const lensStyle = ref({ left: '0px', top: '0px' })

// Форма отзыва
const reviewText = ref('')
const reviewRatings = ref<Record<string, number>>({})

// Форма заказа
const orderForm = reactive({
  pickupAt: '',
  contactPhone: '',
  comment: '',
})

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isInCompare = computed(() => comparisonStore.isInCompare(product.value?.id || ''))
const isInCart = computed(() => cartStore.isInCart(product.value?.id || ''))

const allImages = computed(() => {
  if (!product.value) return []
  return product.value.images.map(img => `http://localhost:5000${img}`)
})

const hasRatings = computed(() => {
  return product.value?.traitRatings && Object.keys(product.value.traitRatings).length > 0
})

const averageRating = computed(() => {
  if (!hasRatings.value || !product.value) return 0
  const ratings = Object.values(product.value.traitRatings)
  const sum = ratings.reduce((acc, val) => acc + val, 0)
  return sum / ratings.length
})

const hasPriceHistory = computed(() => {
  return product.value?.priceHistory && product.value.priceHistory.length > 1
})

const priceChange = computed(() => {
  if (!hasPriceHistory.value || !product.value) return 0
  const history = product.value.priceHistory
  const current = history[history.length - 1].price
  const previous = history[history.length - 2].price
  return ((current - previous) / previous) * 100
})

const priceChangeLabel = computed(() => {
  const change = priceChange.value
  if (change > 0) return `+${Math.round(change)}%`
  if (change < 0) return `${Math.round(change)}%`
  return '0%'
})

const priceChangeClass = computed(() => {
  if (priceChange.value > 0) return 'price-increase'
  if (priceChange.value < 0) return 'price-decrease'
  return ''
})

const shortCharacteristics = computed(() => {
  if (!product.value) return []
  return product.value.characteristics.slice(0, 4)
})

const hasTraitRatings = computed(() => {
  return product.value?.traitRatings && Object.keys(product.value.traitRatings).length > 0
})

const minPickupDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

// Chart
const chartWidth = 800
const chartHeight = 200
const chartPadding = 40

const chartData = computed(() => {
  if (!hasPriceHistory.value || !product.value) return []
  return product.value.priceHistory.map(entry => ({
    date: new Date(entry.date),
    price: entry.price,
  }))
})

const minPrice = computed(() => {
  if (!chartData.value.length) return 0
  return Math.min(...chartData.value.map(d => d.price))
})

const maxPrice = computed(() => {
  if (!chartData.value.length) return 0
  return Math.max(...chartData.value.map(d => d.price))
})

const chartPoints = computed(() => {
  if (!chartData.value.length) return ''
  
  const dataPoints = chartData.value.map((entry, index) => {
    const x = chartPadding + (index / (chartData.value.length - 1)) * (chartWidth - 2 * chartPadding)
    const y = chartHeight - chartPadding - ((entry.price - minPrice.value) / (maxPrice.value - minPrice.value || 1)) * (chartHeight - 2 * chartPadding)
    return { x, y }
  })
  
  return dataPoints.map(p => `${p.x},${p.y}`).join(' ')
})

const chartAreaPoints = computed(() => {
  if (!chartData.value.length) return ''
  
  const dataPoints = chartData.value.map((entry, index) => {
    const x = chartPadding + (index / (chartData.value.length - 1)) * (chartWidth - 2 * chartPadding)
    const y = chartHeight - chartPadding - ((entry.price - minPrice.value) / (maxPrice.value - minPrice.value || 1)) * (chartHeight - 2 * chartPadding)
    return { x, y }
  })
  
  const linePoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ')
  return `${chartPadding},${chartHeight - chartPadding} ${linePoints} ${chartWidth - chartPadding},${chartHeight - chartPadding}`
})

const chartDataPoints = computed(() => {
  if (!chartData.value.length) return []
  
  return chartData.value.map((entry, index) => {
    const x = chartPadding + (index / (chartData.value.length - 1)) * (chartWidth - 2 * chartPadding)
    const y = chartHeight - chartPadding - ((entry.price - minPrice.value) / (maxPrice.value - minPrice.value || 1)) * (chartHeight - 2 * chartPadding)
    return { x, y, date: entry.date, price: entry.price }
  })
})

const gridLines = computed(() => {
  const lines = []
  const lineCount = 4
  for (let i = 0; i <= lineCount; i++) {
    const y = chartPadding + (i / lineCount) * (chartHeight - 2 * chartPadding)
    lines.push({ y })
  }
  return lines
})

const chartDates = computed(() => {
  if (!chartData.value.length) return []
  return chartData.value.map(entry => {
    const date = new Date(entry.date)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  })
})

const getRatingClass = (rating: number): string => {
  if (rating >= 4.5) return 'rating-excellent'
  if (rating >= 3.5) return 'rating-good'
  if (rating >= 2.5) return 'rating-average'
  return 'rating-poor'
}

// Zoom functions
const enableZoom = () => {
  isZoomed.value = true
}

const disableZoom = () => {
  isZoomed.value = false
}

const handleZoom = (e: MouseEvent) => {
  if (!mainImageRef.value) return
  
  const rect = mainImageRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * 100
  const y = ((e.clientY - rect.top) / rect.height) * 100
  
  lensStyle.value = {
    left: `${x}%`,
    top: `${y}%`,
  }
}

// Scroll handler for sticky bar
const handleScroll = () => {
  const heroSection = document.querySelector('.hero-product') as HTMLElement | null
  if (heroSection) {
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight
    showStickyBar.value = window.scrollY > heroBottom - 100
  }
}

const loadProduct = async () => {
  try {
    const response = await getProduct(route.params.id as string)
    product.value = response.data
    relatedProducts.value = []
    
    if (product.value) {
      isFavorite.value = favoritesStore.productIds.includes(product.value.id)
    }
  } catch (error) {
    console.error('Failed to load product:', error)
    product.value = null
  } finally {
    isLoading.value = false
  }
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU')
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const hasTraitRatingsInReview = (review: Review): boolean => {
  return review.traitRatings && Object.keys(review.traitRatings).length > 0
}

const canDeleteReview = (review: Review): boolean => {
  if (!authStore.user) return false
  return review.userId === authStore.user.id || authStore.user.role === 'admin'
}

const toggleFavorite = async () => {
  if (!product.value) return
  
  try {
    if (isFavorite.value) {
      await removeFromFavorites(product.value.id)
      favoritesStore.removeFavorite(product.value.id)
    } else {
      await addToFavorites(product.value.id)
      favoritesStore.addFavorite(product.value.id)
    }
    isFavorite.value = !isFavorite.value
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
  }
}

const toggleCompare = () => {
  if (!product.value) return
  
  if (isInCompare.value) {
    comparisonStore.removeFromCompare(product.value.id)
  } else {
    if (!comparisonStore.maxReached) {
      comparisonStore.addToCompare(product.value.id)
    } else {
      alert('Максимум 4 товара для сравнения')
    }
  }
}

const handleAddToCart = async () => {
  if (!product.value || isInCart.value) return
  
  isAddingToCart.value = true
  try {
    await cartStore.addToCart(product.value.id, 1)
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    isAddingToCart.value = false
  }
}

const setRating = (trait: string, rating: number) => {
  reviewRatings.value[trait] = rating
}

const submitReview = async () => {
  if (!product.value || !reviewText.value.trim()) return
  
  isSubmitting.value = true
  try {
    await addReview(product.value.id, {
      text: reviewText.value.trim(),
      traitRatings: Object.keys(reviewRatings.value).length > 0 ? reviewRatings.value : undefined,
    })
    
    await loadProduct()
    
    reviewText.value = ''
    reviewRatings.value = {}
  } catch (error) {
    console.error('Failed to submit review:', error)
  } finally {
    isSubmitting.value = false
  }
}

const deleteReviewById = async (reviewId: string) => {
  if (!product.value) return
  
  if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return
  
  try {
    await deleteReview(product.value.id, reviewId)
    await loadProduct()
  } catch (error) {
    console.error('Failed to delete review:', error)
  }
}

const openOrderModal = () => {
  if (!isAuthenticated.value) {
    router.push('/auth/login')
    return
  }
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  orderForm.pickupAt = ''
  orderForm.contactPhone = ''
  orderForm.comment = ''
}

const submitOrder = async () => {
  if (!product.value || !orderForm.pickupAt) return
  
  isOrderSubmitting.value = true
  try {
    await createOrder({
      productId: product.value.id,
      pickupAt: orderForm.pickupAt,
      contactPhone: orderForm.contactPhone || undefined,
      comment: orderForm.comment || undefined,
    })
    
    closeOrderModal()
    router.push('/orders')
  } catch (error) {
    console.error('Failed to create order:', error)
  } finally {
    isOrderSubmitting.value = false
  }
}

onMounted(() => {
  loadProduct()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Loading & Not Found */
.loading-container,
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--spacing-4);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.not-found-icon {
  width: 80px;
  height: 80px;
  color: var(--color-text-tertiary);
}

.not-found h1 {
  font-size: var(--font-size-h3);
  color: var(--color-text-primary);
}

.not-found p {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

/* Product Detail */
.product-detail {
  padding: var(--spacing-8) 0;
  min-height: 100vh;
}

/* Sticky Buy Bar */
.sticky-buy-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-sticky);
  padding: var(--spacing-4) 0;
}

.sticky-bar-container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

.sticky-bar-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.sticky-bar-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.sticky-bar-info {
  flex: 1;
  min-width: 0;
}

.sticky-bar-brand {
  display: block;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.sticky-bar-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sticky-bar-price {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.btn-buy {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  white-space: nowrap;
}

.btn-buy svg {
  width: 18px;
  height: 18px;
}

.sticky-bar-enter-active,
.sticky-bar-leave-active {
  transition: transform var(--transition-normal);
}

.sticky-bar-enter-from,
.sticky-bar-leave-to {
  transform: translateY(100%);
}

/* Hero Product */
.hero-product {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-12);
  margin-bottom: var(--spacing-16);
  padding: var(--spacing-10) 0;
}

.hero-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.gallery-main-wrapper {
  position: relative;
  background: var(--color-background);
  border-radius: var(--radius-card);
  overflow: hidden;
}

.gallery-main {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.zoom-lens {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-full);
  background: rgba(37, 99, 235, 0.1);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.gallery-thumbnails {
  display: flex;
  gap: var(--spacing-3);
}

.thumbnail {
  width: 80px;
  height: 80px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-background);
  padding: 0;
}

.thumbnail:hover {
  border-color: var(--color-primary);
}

.thumbnail.active {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.hero-brand {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.hero-title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.rating-stars {
  display: flex;
  gap: var(--spacing-1);
}

.star-icon {
  width: 20px;
  height: 20px;
  color: #FBBF24;
}

.star-icon[fill="none"] {
  color: transparent;
}

.rating-value {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.rating-separator {
  color: var(--color-text-tertiary);
}

.rating-link {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.rating-link:hover {
  color: var(--color-primary);
}

.hero-price-block {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.price-current {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.price-analytics {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.price-change {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-md);
}

.price-increase {
  color: var(--color-error);
  background: rgba(220, 38, 38, 0.1);
}

.price-decrease {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.price-period {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

.hero-description {
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.hero-quick-specs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: var(--color-background);
  border-radius: var(--radius-card);
}

.quick-spec-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.quick-spec-trait {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.quick-spec-value {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.btn-buy-large {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-3);
  padding: var(--spacing-5) var(--spacing-8);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.btn-buy-large svg {
  width: 22px;
  height: 22px;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  flex: 1;
}

.btn-icon svg {
  width: 20px;
  height: 20px;
}

.btn-icon.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-icon.active svg {
  stroke: var(--color-text-inverse);
}

/* Section Styles */
.section-header {
  margin-bottom: var(--spacing-8);
}

.section-title-block {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.section-icon {
  width: 24px;
  height: 24px;
  color: var(--color-primary);
}

.section-title-block h2 {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

/* Price History Section */
.price-history-section {
  margin-bottom: var(--spacing-16);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.price-analytics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.analytics-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-5);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.analytics-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.analytics-value {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.analytics-change.price-increase .analytics-value {
  color: var(--color-error);
}

.analytics-change.price-decrease .analytics-value {
  color: #059669;
}

.price-chart-wrapper {
  position: relative;
  padding: var(--spacing-4);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.price-chart {
  width: 100%;
  height: 200px;
}

.chart-grid {
  stroke: var(--color-border);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}

.chart-line {
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-area {
  opacity: 0.5;
}

.chart-point {
  cursor: pointer;
  transition: r var(--transition-fast);
}

.chart-point:hover {
  r: 8;
}

.chart-dates {
  display: flex;
  justify-content: space-between;
  margin-top: var(--spacing-4);
  padding: 0 var(--spacing-2);
}

.date-label {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

/* Characteristics Section */
.characteristics-section {
  margin-bottom: var(--spacing-16);
}

.characteristics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
}

.characteristic-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-5);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.characteristic-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.characteristic-trait {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.characteristic-value {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Ratings Section */
.ratings-section {
  margin-bottom: var(--spacing-16);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.trait-ratings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
}

.trait-rating-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.trait-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trait-name {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.trait-value {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-semibold);
}

.trait-progress {
  height: 8px;
  background: var(--color-background);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.trait-progress-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.trait-progress-bar.rating-excellent {
  background: #059669;
}

.trait-progress-bar.rating-good {
  background: var(--color-primary);
}

.trait-progress-bar.rating-average {
  background: #FBBF24;
}

.trait-progress-bar.rating-poor {
  background: var(--color-error);
}

/* Description Section */
.description-section {
  margin-bottom: var(--spacing-16);
}

.description-content {
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.description-content p {
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

/* Reviews Section */
.reviews-section {
  margin-bottom: var(--spacing-16);
}

.reviews-header-block {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.reviews-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 var(--spacing-3);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  background: var(--color-background);
  border-radius: var(--radius-full);
}

.review-form-section {
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.review-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.form-textarea {
  width: 100%;
  padding: var(--spacing-4);
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  resize: vertical;
  min-height: 120px;
  transition: all var(--transition-fast);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.trait-ratings-input {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.trait-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.trait-label {
  min-width: 120px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.stars-input {
  display: flex;
  gap: var(--spacing-1);
}

.star-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.star-btn svg {
  width: 24px;
  height: 24px;
  color: var(--color-border);
  transition: color var(--transition-fast);
}

.star-btn.filled svg {
  color: #FBBF24;
}

.star-btn:hover {
  background: var(--color-background);
}

.login-prompt {
  padding: var(--spacing-6);
  text-align: center;
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.login-prompt p {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-2);
}

.link-primary {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
}

.link-primary:hover {
  text-decoration: underline;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.review-card {
  padding: var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.review-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-4);
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.reviewer-avatar,
.reviewer-avatar-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.reviewer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reviewer-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.reviewer-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.reviewer-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.review-date {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
}

.delete-review-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
}

.delete-review-btn:hover {
  background: var(--color-error-light);
  color: var(--color-error);
}

.delete-review-btn svg {
  width: 18px;
  height: 18px;
}

.review-trait-ratings {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
}

.review-trait {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.trait-stars {
  display: flex;
  gap: var(--spacing-1);
}

.star-icon-small {
  width: 14px;
  height: 14px;
  color: #FBBF24;
}

.star-icon-small[fill="none"] {
  color: transparent;
}

.review-text {
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-primary);
}

.reviews-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}

.reviews-empty p {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
}

.empty-subtitle {
  font-size: var(--font-size-small) !important;
  color: var(--color-text-tertiary) !important;
}

/* Related Section */
.related-section {
  margin-bottom: var(--spacing-16);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-6);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--color-border-light);
}

.modal-header h3 {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-background);
  color: var(--color-text-primary);
}

.modal-close svg {
  width: 20px;
  height: 20px;
}

.order-form {
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.order-product-info {
  display: flex;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-background);
  border-radius: var(--radius-md);
}

.order-product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.order-product-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.order-product-details h4 {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.order-product-price {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-body);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.modal-footer {
  display: flex;
  gap: var(--spacing-3);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--color-border-light);
}

.modal-footer .btn {
  flex: 1;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-surface-secondary);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn-outline:hover {
  background: var(--color-background);
}

.btn-outline.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.btn-outline.active svg {
  stroke: var(--color-text-inverse);
}

/* Responsive */
@media (max-width: 1200px) {
  .hero-product {
    grid-template-columns: 1fr;
    gap: var(--spacing-8);
  }
  
  .related-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .price-analytics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .characteristics-grid {
    grid-template-columns: 1fr;
  }
  
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .product-detail {
    padding: var(--spacing-6) 0;
  }
  
  .container {
    padding: 0 var(--spacing-4);
  }
  
  .hero-title {
    font-size: var(--font-size-h2);
  }
  
  .hero-quick-specs {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .trait-ratings-grid {
    grid-template-columns: 1fr;
  }
  
  .reviews-header-block {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .gallery-thumbnails {
    overflow-x: auto;
  }
  
  .thumbnail {
    flex-shrink: 0;
  }
  
  .sticky-bar-content {
    flex-wrap: wrap;
    gap: var(--spacing-3);
  }
  
  .sticky-bar-image {
    width: 50px;
    height: 50px;
  }
  
  .sticky-bar-info {
    flex: 1;
  }
  
  .sticky-bar-price {
    order: 3;
    width: 100%;
  }
  
  .btn-buy {
    order: 4;
    width: 100%;
    justify-content: center;
  }
}
</style>