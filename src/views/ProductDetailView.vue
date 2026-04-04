<template>
  <div class="product-detail">
    <div v-if="loading" class="loading">Загрузка товара...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <div class="product-detail-cont" v-if="!loading && !error">
      <div class="product-images">
        <div class="main-image-container">
          <button
            @click="prevImage"
            class="nav-arrow left-arrow"
            :disabled="product.images.length <= 1"
          >
            ‹
          </button>
          <div class="main-image">
            <img :src="currentImage" :alt="product.name" />
          </div>
          <button
            @click="nextImage"
            class="nav-arrow right-arrow"
            :disabled="product.images.length <= 1"
          >
            ›
          </button>
        </div>

        <div class="thumbnail-images">
          <img
            v-for="(image, index) in product.images"
            :key="index"
            :src="image"
            :alt="`${product.name} ${index + 1}`"
            @click="currentImage = image"
            :class="{ active: currentImage === image }"
          />
        </div>
      </div>

      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="brand">Бренд: {{ product.brand }}</p>

        <div class="price-section">
          <span class="current-price">{{ currentPrice }} ₽</span>
        </div>

        <div v-if="product.priceHistory && product.priceHistory.length >= 5" class="price-history">
          <div class="chart-container">
            <PriceHistoryChart :priceHistory="product.priceHistory" />
          </div>
        </div>

        <div class="description">
          <h3>Описание</h3>
          <p>{{ product.description || 'Описание отсутствует' }}</p>
        </div>

        <div class="characteristics">
          <h3>Характеристики</h3>
          <div class="traits-list">
            <div v-for="char in product.characteristics" :key="char.trait" class="trait-item">
              <span class="trait-name">{{ char.trait }}</span>
              <span class="trait-value">{{ char.value }}</span>
            </div>
          </div>
        </div>

        <div class="ratings">
          <h3>Оценки характеристик</h3>
          <div class="rating-list">
            <div v-for="(rating, trait) in product.traitRatings" :key="trait" class="rating-item">
              <span class="trait-name">{{ trait }}</span>
              <div class="rating-segments">
                <span
                  v-for="i in 5"
                  :key="i"
                  :class="{ filled: i <= Math.round(rating || 0) }"
                  class="segment"
                ></span>
              </div>
              <span class="rating-value">{{ formatRating(rating) }}/5</span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button
            @click="toggleFavorite"
            class="favorite-btn"
            :class="{ active: isFavorite }"
            :disabled="isLoadingFavorite"
          >
            <img src="/iconHed/heart.svg" alt="Избранное" class="heart-icon" />
            <span>{{ isFavorite ? 'В избранном' : 'Добавить в избранное' }}</span>
          </button>
          <button class="cart-btn" @click="openOrderModal">Заказать</button>
        </div>
      </div>
    </div>

    <!-- ОТДЕЛЬНЫЙ БЛОК ОТЗЫВОВ -->
    <div class="reviews-page-section">
      <div class="container">
        <div class="reviews-block">
          <div class="reviews-block-header">
            <h2>Отзывы покупателей</h2>
            <span class="reviews-total">{{ reviewsCount }} отзывов</span>
          </div>

          <button
            class="write-review-btn"
            @click="toggleReviewForm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ ownReview ? 'Редактировать отзыв' : 'Написать отзыв' }}
          </button>

          <!-- Форма отзыва -->
          <div v-if="showReviewForm" class="review-form-new">
            <div class="review-form-header">
              <h3>{{ ownReview ? 'Редактировать отзыв' : 'Новый отзыв' }}</h3>
              <button class="close-form-btn" @click="showReviewForm = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="review-traits-section">
              <p class="traits-label">Оцените характеристики:</p>
              <div class="traits-grid">
                <div v-for="trait in categoryTraits" :key="trait" class="trait-rating">
                  <span class="trait-name">{{ trait }}</span>
                  <div class="stars">
                    <button
                      v-for="i in 5"
                      :key="`${trait}-${i}`"
                      type="button"
                      class="star"
                      :class="{ active: (reviewForm.traitRatings[trait] || 0) >= i }"
                      @click="setTraitRating(trait, i)"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <textarea
              v-model="reviewForm.text"
              class="review-textarea-new"
              maxlength="2000"
              placeholder="Поделитесь своими впечатлениями о товаре: качество, удобство использования, соотношение цена-качество и т.д."
            ></textarea>

            <div class="review-form-actions">
              <span class="char-count">{{ reviewForm.text.length }}/2000</span>
              <button
                class="submit-review-btn"
                @click="submitReview"
                :disabled="isSubmittingReview || !reviewForm.text.trim()"
              >
                {{ isSubmittingReview ? 'Отправка...' : (ownReview ? 'Сохранить' : 'Отправить отзыв') }}
              </button>
            </div>
          </div>

          <!-- Список отзывов -->
          <div v-if="sortedReviews.length === 0" class="no-reviews-new">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Пока никто не оставил отзыв</p>
            <span>Будьте первым, кто поделится впечатлениями!</span>
          </div>

          <div v-else class="reviews-grid">
            <article v-for="review in sortedReviews" :key="review.id" class="review-card-new">
              <div class="review-header">
                <div class="review-author-info">
                  <img
                    :src="getAvatarUrl(review.userAvatar, review.userName)"
                    alt="avatar"
                    class="review-avatar-new"
                  />
                  <div>
                    <p class="review-author-name">{{ review.userName || 'Покупатель' }}</p>
                    <p class="review-date-new">{{ formatReviewDate(review.createdAt) }}</p>
                  </div>
                </div>
                <button
                  v-if="canDeleteReview(review)"
                  class="delete-review-btn"
                  @click="removeReview(review.id)"
                  title="Удалить отзыв"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>

              <div v-if="review.traitRatings && Object.keys(review.traitRatings).length" class="review-ratings">
                <div v-for="(rating, trait) in review.traitRatings" :key="`${review.id}-${trait}`" class="review-rating-item">
                  <span class="rating-trait">{{ trait }}</span>
                  <div class="rating-stars">
                    <span v-for="i in 5" :key="i" :class="['star-filled', { active: i <= rating }]">★</span>
                  </div>
                </div>
              </div>

              <p class="review-content">{{ review.text }}</p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showOrderModal" class="order-modal" @click.self="closeOrderModal">
      <div class="order-modal-content">
        <h3>Оформление заказа</h3>
        <p>
          Товар: <strong>{{ product?.name }}</strong>
        </p>

        <div class="form-group">
          <label for="pickupAt">Время самовывоза</label>
          <input id="pickupAt" v-model="orderForm.pickupAt" type="datetime-local" />
        </div>

        <div class="form-group">
          <label for="contactPhone">Телефон</label>
          <input
            id="contactPhone"
            v-model="orderForm.contactPhone"
            type="text"
            placeholder="+7..."
          />
        </div>

        <div class="form-group">
          <label for="comment">Комментарий</label>
          <textarea
            id="comment"
            v-model="orderForm.comment"
            rows="3"
            placeholder="Комментарий к заказу"
          ></textarea>
        </div>

        <div class="order-actions">
          <button class="secondary-btn" @click="closeOrderModal">Отмена</button>
          <button class="cart-btn" @click="submitOrder" :disabled="isOrdering">
            {{ isOrdering ? 'Оформление...' : 'Подтвердить заказ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProduct, addProductReview, deleteProductReview } from '@/api/catalog.js'
import favoritesAPI from '@/api/favorites.js'
import ordersAPI from '@/api/orders.js'
import PriceHistoryChart from '@/components/PriceHistoryChart.vue'

export default {
  components: {
    PriceHistoryChart,
  },
  name: 'ProductDetailView',
  inject: ['showToast'],
  data() {
    return {
      product: null,
      currentImage: '',
      loading: true,
      error: null,
      isFavorite: false,
      isLoadingFavorite: false,
      showOrderModal: false,
      isOrdering: false,
      showReviewForm: false,
      isSubmittingReview: false,
      reviewForm: {
        text: '',
        traitRatings: {},
      },
      orderForm: {
        pickupAt: '',
        contactPhone: '',
        comment: '',
      },
    }
  },
  async mounted() {
    // Скролл наверх при загрузке страницы
    window.scrollTo(0, 0)

    const productId = this.$route.params.id
    try {
      this.product = await getProduct(productId)
      this.currentImage = this.product.images[0] || ''
      await this.loadFavoriteStatus()
    } catch (error) {
      console.error('Ошибка загрузки товара:', error)
      this.error = 'Товар не найден'
    } finally {
      this.loading = false
    }
  },
  computed: {
    sortedPrices() {
      return [...(this.product?.priceHistory || [])].sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      )
    },
    currentPrice() {
      const prices = this.sortedPrices
      return prices.length > 0 ? prices[0].price : 0
    },
    currentImageIndex() {
      return this.product?.images?.indexOf(this.currentImage) || 0
    },
    categoryTraits() {
      return this.product?.traitRatings ? Object.keys(this.product.traitRatings) : []
    },
    sortedReviews() {
      return [...(this.product?.reviews || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      )
    },
    reviewsCount() {
      return this.sortedReviews.length
    },
    currentUser() {
      try {
        const raw = localStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
      } catch {
        return null
      }
    },
    ownReview() {
      if (!this.currentUser?._id || !this.product?.reviews?.length) return null
      return this.product.reviews.find((review) => review.userId === this.currentUser._id) || null
    },
  },
  methods: {
    prevImage() {
      if (!this.product?.images?.length) return
      const currentIndex = this.currentImageIndex
      const newIndex = currentIndex > 0 ? currentIndex - 1 : this.product.images.length - 1
      this.currentImage = this.product.images[newIndex]
    },
    nextImage() {
      if (!this.product?.images?.length) return
      const currentIndex = this.currentImageIndex
      const newIndex = currentIndex < this.product.images.length - 1 ? currentIndex + 1 : 0
      this.currentImage = this.product.images[newIndex]
    },
    async loadFavoriteStatus() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.isFavorite = false
        return
      }

      try {
        const data = await favoritesAPI.getFavorites()
        this.isFavorite = data.favorites.includes(this.product.id)
      } catch (error) {
        console.error('Ошибка при загрузке избранного:', error)
        this.isFavorite = false
      }
    },
    async toggleFavorite() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.showToast('Войдите в аккаунт для добавления в избранное', 'warning')
        this.$router.push('/login')
        return
      }

      this.isLoadingFavorite = true
      try {
        if (this.isFavorite) {
          await favoritesAPI.removeFromFavorites(this.product.id)
          this.isFavorite = false
          this.showToast(`${this.product.name} удалён из избранного`, 'info')
        } else {
          await favoritesAPI.addToFavorites(this.product.id)
          this.isFavorite = true
          this.showToast(`${this.product.name} добавлен в избранное ❤️`, 'heart')
        }
      } catch (error) {
        console.error('Ошибка при изменении избранного:', error)
        this.showToast('Ошибка при сохранении', 'error')
      } finally {
        this.isLoadingFavorite = false
      }
    },
    openOrderModal() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.showToast('Войдите в аккаунт для оформления заказа', 'warning')
        this.$router.push('/login')
        return
      }

      const now = new Date()
      now.setHours(now.getHours() + 2)
      this.orderForm.pickupAt = now.toISOString().slice(0, 16)
      this.showOrderModal = true
    },
    closeOrderModal() {
      this.showOrderModal = false
    },
    async submitOrder() {
      if (!this.orderForm.pickupAt) {
        this.showToast('Укажите дату и время самовывоза', 'warning')
        return
      }

      this.isOrdering = true
      try {
        await ordersAPI.createOrder({
          productId: this.product.id,
          pickupAt: this.orderForm.pickupAt,
          contactPhone: this.orderForm.contactPhone,
          comment: this.orderForm.comment,
        })
        this.showToast('Заказ успешно оформлен! 🎉', 'success')
        this.closeOrderModal()
        this.$router.push('/orders')
      } catch (error) {
        console.error('Ошибка оформления заказа:', error)
        this.showToast(error.response?.data?.error || 'Не удалось оформить заказ', 'error')
      } finally {
        this.isOrdering = false
      }
    },
    formatRating(rating) {
      const normalized = Number(rating) || 0
      return Number.isInteger(normalized) ? String(normalized) : normalized.toFixed(1)
    },
    toggleReviewForm() {
      const token = localStorage.getItem('token')
      if (!token) {
        this.showToast('Войдите в аккаунт, чтобы оставить отзыв', 'warning')
        this.$router.push('/login')
        return
      }

      const nextValue = !this.showReviewForm
      this.showReviewForm = nextValue

      if (nextValue && this.ownReview) {
        this.reviewForm.text = this.ownReview.text || ''
        this.reviewForm.traitRatings = { ...(this.ownReview.traitRatings || {}) }
      }
    },
    setTraitRating(trait, rating) {
      this.reviewForm.traitRatings = {
        ...this.reviewForm.traitRatings,
        [trait]: rating,
      }
    },
    clearTraitRating(trait) {
      const nextRatings = { ...this.reviewForm.traitRatings }
      delete nextRatings[trait]
      this.reviewForm.traitRatings = nextRatings
    },
    async submitReview() {
      const text = this.reviewForm.text.trim()
      if (!text) {
        this.showToast('Введите текст отзыва', 'warning')
        return
      }

      this.isSubmittingReview = true
      try {
        const response = await addProductReview(this.product.id, {
          text,
          traitRatings: this.reviewForm.traitRatings,
        })

        if (response.review) {
          const existingIndex = (this.product.reviews || []).findIndex(
            (review) => review.userId === response.review.userId,
          )

          if (existingIndex >= 0) {
            this.product.reviews.splice(existingIndex, 1, response.review)
          } else {
            this.product.reviews = [response.review, ...(this.product.reviews || [])]
          }
        }

        this.product.traitRatings = response.traitRatings || this.product.traitRatings
        this.reviewForm.text = ''
        this.reviewForm.traitRatings = {}
        this.showReviewForm = false
        this.showToast(response.isUpdated ? 'Отзыв обновлён' : 'Спасибо! Отзыв добавлен', 'success')
      } catch (error) {
        console.error('Ошибка отправки отзыва:', error)
        this.showToast(error.response?.data?.error || 'Не удалось отправить отзыв', 'error')
      } finally {
        this.isSubmittingReview = false
      }
    },
    async removeReview(reviewId) {
      try {
        const response = await deleteProductReview(this.product.id, reviewId)
        this.product.reviews = (this.product.reviews || []).filter(
          (review) => review.id !== reviewId,
        )
        this.product.traitRatings = response.traitRatings || this.product.traitRatings
        this.showToast('Отзыв удалён', 'info')
      } catch (error) {
        console.error('Ошибка удаления отзыва:', error)
        this.showToast(error.response?.data?.error || 'Не удалось удалить отзыв', 'error')
      }
    },
    canDeleteReview(review) {
      if (!this.currentUser) return false
      if (this.currentUser.role === 'admin') return true
      return review.userId && this.currentUser._id && review.userId === this.currentUser._id
    },
    formatReviewDate(date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },
    getAvatarUrl(avatar, userName = 'User') {
      if (avatar) return avatar
      const seed = encodeURIComponent(userName || 'User')
      return `https://api.dicebear.com/9.x/initials/svg?seed=${seed}&backgroundColor=f2f5f9`
    },
  },
}
</script>

<style scoped>
.product-detail {
  width: 100%;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px0;
}

.product-detail-cont {
  width: 85%;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.product-images {
  flex: 1.1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image {
  width: 80%;
  height: 140vh;
  max-height: 750px;
  min-height: 300px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 77, 77, 0.8);
  color: white;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  z-index: 10;
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(255, 77, 77, 1);
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.left-arrow {
  left: 10px;
}

.right-arrow {
  right: 10px;
}

.main-image img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

.thumbnail-images {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumbnail-images img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color0.3s;
}

.thumbnail-images img.active,
.thumbnail-images img:hover {
  border-color: #ff4d4d;
}

.product-info {
  flex: 0.9;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 02px10px rgba(0, 0, 0, 0.1);
}

.product-info h1 {
  font-size: 32px;
  margin-bottom: 10px;
}

.brand {
  color: #666;
  font-size: 18px;
  margin-bottom: 20px;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
}

.current-price {
  font-size: 28px;
  font-weight: bold;
  color: #ff4d4d;
}

.description,
.characteristics,
.ratings,
.price-history {
  margin-bottom: 30px;
}

.description h3,
.characteristics h3,
.ratings h3,
.price-history h3 {
  font-size: 24px;
  margin-bottom: 15px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.traits-list,
.rating-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trait-item,
.rating-item {
  display: flex;
  align-items: center;
  padding: 10px0;
  border-bottom: 1px solid #eee;
}

.trait-name {
  width: 140px;
  flex-shrink: 0;
  text-transform: capitalize;
}

.rating-segments {
  display: flex;
  gap: 4px;
  flex: 1;
  margin: 010px;
}

.segment {
  flex: 1;
  height: 7px;
  background: #e0e0e0;
  border-radius: 3px;
}

.segment.filled {
  background: #ff4d4d;
}

.rating-value {
  width: 42px;
  text-align: right;
  color: #666;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 20px;
  margin-top: 40px;
}

.favorite-btn,
.cart-btn {
  padding: 15px30px;
  border: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.favorite-btn {
  background-color: #f2f5f9;
  color: #666;
  border: 2px solid #e0e0e0;
}

.favorite-btn:hover:not(:disabled),
.favorite-btn.active {
  background-color: #ff4d4d;
  color: white;
  border-color: #ff4d4d;
}

.heart-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.favorite-btn:hover {
  background-color: #e9ecef;
}

.cart-btn {
  background-color: #ff4d4d;
  color: white;
}

.cart-btn:hover {
  background-color: #e63939;
  transform: translateY(-2px);
}

.loading,
.error {
  text-align: center;
  padding: 50px;
  font-size: 20px;
}

.error {
  color: red;
}

.reviews-section {
  margin-bottom: 30px;
}

/* Табы для разделов */
.detail-tabs {
  display: flex;
  gap: 8px;
  margin: 30px 0 20px;
  padding: 6px;
  background: #f5f7fa;
  border-radius: 12px;
}

.tab-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab-btn:hover {
  background: #fff;
  color: #263141;
}

.tab-btn.active {
  background: #fff;
  color: #ff4d4d;
  box-shadow: 0 2px 8px rgba(255, 77, 77, 0.15);
}

.reviews-badge {
  background: #ff4d4d;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
}

/* Стили для кнопок */
.review-btn {
  border: none;
  border-radius: 8px;
  background: #ff4d4d;
  color: #fff;
  padding: 12px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.review-btn:hover {
  background: #e63939;
  transform: translateY(-2px);
}

.review-btn.large-btn {
  padding: 14px 28px;
  font-size: 15px;
  border-radius: 10px;
}

.review-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.reviews-count {
  color: #666;
  margin-bottom: 14px;
}

.review-form {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
}

.review-traits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin: 10px016px;
}

.review-trait-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.star-picker {
  display: flex;
  align-items: center;
  gap: 4px;
}

.star-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  color: #cfcfcf;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}

.star-btn.active {
  color: #ffb300;
}

.clear-rating-btn {
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  margin-left: 6px;
}

.review-textarea {
  width: 100%;
  min-height: 120px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px;
  resize: vertical;
}

.review-form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  color: #666;
}

.review-btn {
  border: none;
  border-radius: 10px;
  background: #ff4d4d;
  color: #fff;
  padding: 10px16px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.review-btn.large-btn {
  padding: 16px32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 12px;
}

.review-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.no-reviews {
  color: #666;
  padding: 10px0;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;

  /* Красивый скролл */
  scrollbar-width: thin;
  scrollbar-color: #ff4d4d #f0f0f0;
}

.reviews-list::-webkit-scrollbar {
  width: 6px;
}

.reviews-list::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 3px;
}

.reviews-list::-webkit-scrollbar-thumb {
  background: #ff4d4d;
  border-radius: 3px;
}

.reviews-list::-webkit-scrollbar-thumb:hover {
  background: #e63939;
}

.review-card {
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 14px;
  background: #fff;
}

.review-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.review-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  background: #f2f5f9;
}

.review-author {
  font-weight: 600;
  margin: 0;
}

.review-date {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.review-traits {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.review-trait-row {
  display: flex;
  align-items: center;
}

.review-text {
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.delete-review-btn {
  margin-left: auto;
  border: 1px solid #ffd3d3;
  color: #b90000;
  background: #fff5f5;
  border-radius: 8px;
  padding: 6px10px;
  cursor: pointer;
}

.order-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.order-modal-content {
  width: min(600px, 92vw);
  background: #fff;
  border-radius: 20px;
  padding: 32px;
}

.order-modal-content h3 {
  font-size: 28px;
  font-weight: 700;
  color: #263141;
  margin: 0 0 20px 0;
  text-align: center;
}

.order-modal-content p {
  font-size: 18px;
  margin-bottom: 24px;
  text-align: center;
  color: #666;
}

.order-modal-content p strong {
  color: #263141;
  font-size: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.form-group label {
  font-size: 16px;
  font-weight: 600;
  color: #263141;
}

.form-group input,
.form-group textarea {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff4d4d;
}

.form-group input[type="datetime-local"] {
  font-family: inherit;
}

.order-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
}

.secondary-btn {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: #fff;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.secondary-btn:hover {
  border-color: #ff4d4d;
  color: #ff4d4d;
}

/* ============ НОВЫЙ БЛОК ОТЗЫВОВ ============ */
.reviews-page-section {
  width: 100%;
  background: #fff;
  padding: 40px 0 60px;
  margin-top: 40px;
}

.reviews-page-section .container {
  width: 85%;
  margin: 0 auto;
}

.reviews-block {
  margin: 0 auto;
}

.reviews-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.reviews-block-header h2 {
  font-size: 28px;
  color: #263141;
  margin: 0;
}

.reviews-total {
  background: #f5f7fa;
  color: #666;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.write-review-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 24px;
}

.write-review-btn:hover {
  background: #e63939;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
}

/* Форма отзыва */
.review-form-new {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.review-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.review-form-header h3 {
  margin: 0;
  font-size: 20px;
  color: #263141;
}

.close-form-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-form-btn:hover {
  background: #eee;
  color: #333;
}

.review-traits-section {
  margin-bottom: 20px;
}

.traits-label {
  color: #666;
  margin-bottom: 16px;
  font-size: 14px;
}

.traits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.trait-rating {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: white;
  border-radius: 10px;
  border: 1px solid #eee;
}

.trait-rating .trait-name {
  font-weight: 500;
  color: #333;
  text-transform: capitalize;
}

.trait-rating .stars {
  display: flex;
  gap: 2px;
}

.trait-rating .star {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
}

.trait-rating .star.active {
  color: #ffb300;
}

.trait-rating .star:hover {
  transform: scale(1.1);
}

.review-textarea-new {
  width: 100%;
  min-height: 140px;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px;
  font-size: 15px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 16px;
}

.review-textarea-new:focus {
  outline: none;
  border-color: #ff4d4d;
  box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.1);
}

.review-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  color: #999;
  font-size: 14px;
}

.submit-review-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-review-btn:hover:not(:disabled) {
  background: #e63939;
  transform: translateY(-2px);
}

.submit-review-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Нет отзывов */
.no-reviews-new {
  text-align: center;
  padding: 60px 20px;
  background: #fafafa;
  border-radius: 16px;
}

.no-reviews-new svg {
  margin-bottom: 16px;
}

.no-reviews-new p {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px;
}

.no-reviews-new span {
  color: #999;
}

/* Список отзывов */
.reviews-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-card-new {
  background: white;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 20px;
  transition: box-shadow 0.3s;
}

.review-card-new:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.review-author-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-avatar-new {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  background: #f5f7fa;
}

.review-author-name {
  font-weight: 600;
  color: #263141;
  margin: 0 0 4px;
}

.review-date-new {
  color: #999;
  font-size: 13px;
  margin: 0;
}

.review-card-new .delete-review-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.review-card-new .delete-review-btn:hover {
  background: #fff0f0;
  color: #ff4d4d;
}

/* Рейтинги характеристик в отзыве */
.review-ratings {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}

.review-rating-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f5f7fa;
  padding: 6px 12px;
  border-radius: 8px;
}

.rating-trait {
  font-size: 13px;
  color: #666;
  text-transform: capitalize;
}

.rating-stars {
  display: flex;
}

.star-filled {
  color: #ddd;
  font-size: 14px;
}

.star-filled.active {
  color: #ffb300;
}

.review-content {
  color: #333;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}
</style>
