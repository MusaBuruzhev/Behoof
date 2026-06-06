<template>
  <div class="security-view">
    <header class="page-header">
      <h1 class="page-title">Безопасность</h1>
      <p class="page-subtitle">Управление доступом к аккаунту</p>
    </header>
    
    <!-- Security Status -->
    <div class="security-status-card">
      <div class="status-icon status-secure">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      </div>
      <div class="status-info">
        <h3 class="status-title">Аккаунт защищён</h3>
        <p class="status-description">Ваш аккаунт находится в безопасности</p>
      </div>
    </div>
    
    <!-- Account Info -->
    <div class="info-section">
      <h2 class="section-title">Информация об аккаунте</h2>
      
      <div class="info-cards">
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Email</span>
            <span class="info-value">{{ user?.email || '-' }}</span>
          </div>
          <div class="info-badge verified">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Подтверждён</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Дата регистрации</span>
            <span class="info-value">{{ registrationDate }}</span>
          </div>
        </div>
        
        <div class="info-card">
          <div class="info-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Роль</span>
            <span class="info-value">{{ roleLabel }}</span>
          </div>
          <div v-if="user?.role === 'admin'" class="info-badge admin">
            <span>Администратор</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Session Info -->
    <div class="info-section">
      <h2 class="section-title">Текущая сессия</h2>
      
      <div class="session-card">
        <div class="session-header">
          <div class="session-info">
            <h4 class="session-title">Текущее устройство</h4>
            <p class="session-description">Последняя активность: {{ lastActivity }}</p>
          </div>
          <div class="session-badge active">
            <span>Активна</span>
          </div>
        </div>
        
        <div class="session-details">
          <div class="session-row">
            <span class="session-label">Браузер:</span>
            <span class="session-value">{{ browserInfo }}</span>
          </div>
          <div class="session-row">
            <span class="session-label">IP адрес:</span>
            <span class="session-value">{{ ipAddress }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="actions-section">
      <h2 class="section-title">Действия</h2>
      
      <div class="actions-grid">
        <button class="action-card" @click="handleLogout">
          <div class="action-icon logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
          <div class="action-content">
            <h4 class="action-title">Выйти из аккаунта</h4>
            <p class="action-description">Завершить текущую сессию</p>
          </div>
          <div class="action-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import type { User } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const user = computed(() => authStore.user as User)

const registrationDate = computed(() => {
  if (!user.value?.createdAt) return '-'
  const date = new Date(user.value.createdAt)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const roleLabel = computed(() => {
  if (!user.value) return '-'
  return user.value.role === 'admin' ? 'Администратор' : 'Пользователь'
})

const lastActivity = computed(() => {
  const now = new Date()
  return now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const browserInfo = computed(() => {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Google Chrome'
  if (userAgent.includes('Firefox')) return 'Mozilla Firefox'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Edge')) return 'Microsoft Edge'
  return 'Неизвестный браузер'
})

const ipAddress = computed(() => {
  // В реальном приложении можно получить через API
  return '192.168.1.1'
})

const handleLogout = () => {
  if (!confirm('Вы уверены, что хотите выйти из аккаунта?')) return
  
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.security-view {
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

/* Security Status */
.security-status-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-10);
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(5, 150, 105, 0.05));
  border: 1px solid rgba(5, 150, 105, 0.2);
  border-radius: var(--radius-xl);
}

.status-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.status-icon svg {
  width: 36px;
  height: 36px;
}

.status-icon.status-secure {
  background: #059669;
  color: white;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.status-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.status-description {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Info Section */
.info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.section-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.info-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.info-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.info-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: var(--color-background);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}

.info-icon svg {
  width: 28px;
  height: 28px;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.info-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.info-value {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.info-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.info-badge.verified {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.info-badge.verified svg {
  width: 14px;
  height: 14px;
}

.info-badge.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8B5CF6;
}

/* Session Card */
.session-card {
  padding: var(--spacing-8);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-5);
  padding-bottom: var(--spacing-5);
  border-bottom: 1px solid var(--color-border-light);
}

.session-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-1) 0;
}

.session-description {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0;
}

.session-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
}

.session-badge.active {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.session-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.session-row {
  display: flex;
  gap: var(--spacing-3);
}

.session-label {
  min-width: 120px;
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.session-value {
  font-size: var(--font-size-small);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

/* Actions Section */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.action-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.action-card:hover {
  border-color: var(--color-error);
  background: var(--color-error-light);
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon svg {
  width: 28px;
  height: 28px;
}

.action-icon.logout {
  background: var(--color-background);
  color: var(--color-text-secondary);
}

.action-card:hover .action-icon.logout {
  background: var(--color-error);
  color: var(--color-text-inverse);
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.action-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
}

.action-description {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  margin: 0;
}

.action-arrow {
  width: 24px;
  height: 24px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.action-arrow svg {
  width: 100%;
  height: 100%;
}

.action-card:hover .action-arrow {
  color: var(--color-error);
}

/* Responsive */
@media (max-width: 768px) {
  .security-status-card {
    flex-direction: column;
    text-align: center;
  }
  
  .info-card {
    flex-direction: column;
    text-align: center;
  }
  
  .info-badge {
    align-self: center;
  }
  
  .session-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-arrow {
    display: none;
  }
}
</style>
