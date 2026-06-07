<template>
  <div class="profile-view">
    <header class="page-header">
      <h1 class="page-title">Профиль</h1>
      <p class="page-subtitle">Управляйте своей личной информацией</p>
    </header>
    
    <div class="profile-card">
      <div class="card-header">
        <div class="avatar-section">
          <div v-if="user.avatar" class="avatar-large">
            <img :src="user.avatar" :alt="userName" />
          </div>
          <div v-else class="avatar-placeholder-large">
            {{ userInitials }}
          </div>
          <button class="avatar-change-btn" title="Изменить аватар">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
        </div>
        
        <div class="user-main-info">
          <div class="user-header-actions">
            <h2 class="user-display-name">{{ userName }}</h2>
            <p class="user-email-display">{{ user.email }}</p>
          </div>
          
          <!-- Кнопка админ-панели для админов -->
          <router-link v-if="user.role === 'admin'" to="/admin/products" class="admin-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Админ-панель</span>
          </router-link>
          
          <div class="account-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            <span>Верифицированный аккаунт</span>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="saveProfile" class="profile-form">
        <div class="form-grid">
          <div class="form-group">
            <label for="firstName" class="form-label">Имя</label>
            <input
              id="firstName"
              v-model="formData.firstName"
              type="text"
              class="form-input"
              placeholder="Ваше имя"
            />
          </div>
          
          <div class="form-group">
            <label for="lastName" class="form-label">Фамилия</label>
            <input
              id="lastName"
              v-model="formData.lastName"
              type="text"
              class="form-input"
              placeholder="Ваша фамилия"
            />
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              disabled
            />
            <span class="form-hint">Email нельзя изменить</span>
          </div>
          
          <div class="form-group">
            <label for="phoneNumber" class="form-label">Телефон</label>
            <input
              id="phoneNumber"
              v-model="formData.phoneNumber"
              type="tel"
              class="form-input"
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          
          <div class="form-group">
            <label for="birthDate" class="form-label">Дата рождения</label>
            <input
              id="birthDate"
              v-model="formData.birthDate"
              type="date"
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label for="role" class="form-label">Роль</label>
            <input
              id="role"
              :value="user.role === 'admin' ? 'Администратор' : 'Пользователь'"
              type="text"
              class="form-input"
              disabled
            />
          </div>
        </div>
        
        <div class="form-section">
          <h3 class="section-title">Адрес</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="street" class="form-label">Улица</label>
              <input
                id="street"
                v-model="formData.address.street"
                type="text"
                class="form-input"
                placeholder="Улица, дом, квартира"
              />
            </div>
            
            <div class="form-group">
              <label for="city" class="form-label">Город</label>
              <input
                id="city"
                v-model="formData.address.city"
                type="text"
                class="form-input"
                placeholder="Город"
              />
            </div>
            
            <div class="form-group">
              <label for="postalCode" class="form-label">Почтовый индекс</label>
              <input
                id="postalCode"
                v-model="formData.address.postalCode"
                type="text"
                class="form-input"
                placeholder="Индекс"
              />
            </div>
            
            <div class="form-group">
              <label for="country" class="form-label">Страна</label>
              <input
                id="country"
                v-model="formData.address.country"
                type="text"
                class="form-input"
                placeholder="Страна"
              />
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="resetForm">
            Сбросить
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSaving || !hasChanges">
            {{ isSaving ? 'Сохранение...' : 'Сохранить изменения' }}
          </button>
        </div>
      </form>
    </div>
    
    <!-- Account Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-orders">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ ordersCount }}</span>
          <span class="stat-label">Заказов</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-favorites">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ favoritesCount }}</span>
          <span class="stat-label">В избранном</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon stat-icon-member">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ memberSince }}</span>
          <span class="stat-label">Дата регистрации</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useAuthStore, useFavoritesStore } from '@/stores'
import { updateProfile } from '@/api'
import type { User } from '@/types'

const authStore = useAuthStore()
const favoritesStore = useFavoritesStore()

const user = computed(() => authStore.user as User)
const ordersCount = ref(0)
const favoritesCount = ref(0)

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  role: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
})

const isSaving = ref(false)
const hasChanges = ref(false)

const userName = computed(() => {
  if (!user.value) return ''
  return `${user.value.firstName} ${user.value.lastName}`.trim() || user.value.email
})

const userInitials = computed(() => {
  if (!user.value) return ''
  const parts = userName.value.split(' ')
  return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2)
})

const memberSince = computed(() => {
  if (!user.value?.createdAt) return '-'
  const date = new Date(user.value.createdAt)
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
})

// Initialize form with user data
const initForm = () => {
  if (!user.value) return
  
  formData.firstName = user.value.firstName || ''
  formData.lastName = user.value.lastName || ''
  formData.email = user.value.email || ''
  formData.phoneNumber = user.value.phoneNumber || ''
  formData.birthDate = user.value.birthDate ? user.value.birthDate.split('T')[0] : ''
  formData.role = user.value.role || ''
  
  if (user.value.address) {
    formData.address.street = user.value.address.street || ''
    formData.address.city = user.value.address.city || ''
    formData.address.postalCode = user.value.address.postalCode || ''
    formData.address.country = user.value.address.country || ''
  }
}

// Watch for changes
watch(formData, () => {
  hasChanges.value = true
}, { deep: true })

const saveProfile = async () => {
  if (!hasChanges.value) return
  
  isSaving.value = true
  try {
    const updateData: {
      firstName?: string
      lastName?: string
      phoneNumber?: string
      address?: {
        street?: string
        city?: string
        postalCode?: string
        country?: string
      }
    } = {
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      phoneNumber: formData.phoneNumber || undefined,
    }
    
    // Добавляем адрес если он заполнен
    if (formData.address.street || formData.address.city || formData.address.postalCode || formData.address.country) {
      updateData.address = {
        street: formData.address.street || undefined,
        city: formData.address.city || undefined,
        postalCode: formData.address.postalCode || undefined,
        country: formData.address.country || undefined,
      }
    }
    
    await updateProfile(updateData)
    
    // Обновляем данные в localStorage и store
    const updatedUser = {
      ...user.value,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
      address: updateData.address,
    }
    
    authStore.$patch({ user: updatedUser })
    localStorage.setItem('user', JSON.stringify(updatedUser))
    
    hasChanges.value = false
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  initForm()
  hasChanges.value = false
}

// Load stats
const loadStats = async () => {
  try {
    const ordersResponse = await fetch(`${import.meta.env.VITE_API_URL}/orders/my`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
    if (ordersResponse.ok) {
      const data = await ordersResponse.json()
      ordersCount.value = data.orders?.length || 0
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  }
  
  favoritesCount.value = favoritesStore.productIds.length
}

onMounted(() => {
  initForm()
  loadStats()
})
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-10);
}

.page-header {
  margin-bottom: var(--spacing-2);
}

.page-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.page-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Profile Card */
.profile-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.card-header {
  display: flex;
  gap: var(--spacing-10);
  padding: var(--spacing-10);
  border-bottom: 1px solid var(--color-border-light);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), transparent);
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.avatar-large,
.avatar-placeholder-large {
  width: 140px;
  height: 140px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-large {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
}

.avatar-change-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-text-secondary);
}

.avatar-change-btn:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.avatar-change-btn svg {
  width: 18px;
  height: 18px;
}

.user-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-3);
}

.user-header-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.admin-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(37, 99, 235, 0.1);
  border-radius: var(--radius-md);
  width: fit-content;
  margin-top: var(--spacing-2);
  text-decoration: none;
  color: var(--color-primary);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.admin-link:hover {
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-primary-hover);
}

.admin-link svg {
  width: 16px;
  height: 16px;
}

.user-display-name {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.user-email-display {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

.account-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: rgba(5, 150, 105, 0.1);
  border-radius: var(--radius-full);
  width: fit-content;
  margin-top: var(--spacing-2);
}

.account-badge svg {
  width: 16px;
  height: 16px;
  color: #059669;
}

.account-badge span {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-medium);
  color: #059669;
}

/* Form */
.profile-form {
  padding: var(--spacing-10);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-8);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.form-input {
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

.form-input:disabled {
  background: var(--color-background);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
}

.form-hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.form-section {
  margin-top: var(--spacing-10);
  padding-top: var(--spacing-10);
  border-top: 1px solid var(--color-border-light);
}

.section-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-8) 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-4);
  margin-top: var(--spacing-10);
  padding-top: var(--spacing-10);
  border-top: 1px solid var(--color-border-light);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-8);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.stat-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 36px;
  height: 36px;
}

.stat-icon-orders {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.stat-icon-favorites {
  background: rgba(236, 72, 153, 0.1);
  color: #EC4899;
}

.stat-icon-member {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.stat-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 1200px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
  
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .user-main-info {
    align-items: center;
  }
  
  .account-badge {
    margin-left: auto;
    margin-right: auto;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style>
