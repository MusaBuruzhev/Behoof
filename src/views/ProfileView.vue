<template>
  <div class="profile-container">
    <div class="profile-wrapper">
      <div class="profile-header">
        <div class="profile-header-content">
          <div class="profile-avatar-large">{{ userInitials }}</div>
          <div class="profile-header-text">
            <h1>{{ user?.firstName }} {{ user?.lastName }}</h1>
            <p>{{ user?.email }}</p>
            <div class="member-badge">
              👤 Участник с {{ formatDate(user?.createdAt) }}
            </div>
          </div>
        </div>
        <button @click="goBack" class="back-button">← Назад</button>
      </div>

 <div class="quick-actions">
 <router-link v-if="isAdmin" to="/admin" class="quick-action-btn">
 <span class="action-icon"><img src="../../public/profIcon/l4.png" alt=""></span>
 <span class="action-text">Админ-панель</span>
 </router-link>
 <router-link to="/favorites" class="quick-action-btn">
          <span class="action-icon"><img src="../../public/profIcon/l1.png" alt=""></span>
          <span class="action-text">Избранное</span>
        </router-link>
        <button @click="openCompareModal" class="quick-action-btn">
          <span class="action-icon"><img src="../../public/profIcon/l2.png" alt=""></span>
          <span class="action-text">Сравнение</span>
        </button>
        <router-link to="/orders" class="quick-action-btn">
          <span class="action-icon"><img src="../../public/profIcon/l3.png" alt=""> </span>
          <span class="action-text">Заказы</span>
        </router-link>
        <router-link to="/notifications" class="quick-action-btn">
          <span class="action-icon"><img src="../../public/profIcon/l4.png" alt=""> </span>
          <span class="action-text">Уведомления</span>
        </router-link>
      </div>

      <div class="profile-content">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">0</div>
            <div class="stat-label">Активных заказов</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ favoritesCount }}</div>
            <div class="stat-label">Избранных товаров</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ comparisonCount }}</div>
            <div class="stat-label">Сравниваемых товаров</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">0</div>
            <div class="stat-label">Оставленных отзывов</div>
          </div>
        </div>

        <div class="profile-section">
          <div class="section-header">
            <h2>Основная информация</h2>
            <button v-if="!isEditing" @click="isEditing = true" class="edit-button">
              ✏️ Редактировать
            </button>
          </div>

          <div v-if="!isEditing" class="info-grid">
            <div class="info-card">
              <label>Имя</label>
              <p>{{ user?.firstName || 'Не указано' }}</p>
            </div>
            <div class="info-card">
              <label>Фамилия</label>
              <p>{{ user?.lastName || 'Не указано' }}</p>
            </div>
            <div class="info-card">
              <label>Email</label>
              <p>{{ user?.email }}</p>
            </div>
            <div class="info-card">
              <label>Номер телефона</label>
              <p>{{ user?.phoneNumber || 'Не указано' }}</p>
            </div>
          </div>

          <form v-else @submit.prevent="saveProfile" class="edit-form">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Имя</label>
                <input
                  id="firstName"
                  v-model="editForm.firstName"
                  type="text"
                  placeholder="Ваше имя"
                  :class="{ error: errors.firstName }"
                />
                <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
              </div>
              <div class="form-group">
                <label for="lastName">Фамилия</label>
                <input
                  id="lastName"
                  v-model="editForm.lastName"
                  type="text"
                  placeholder="Ваша фамилия"
                  :class="{ error: errors.lastName }"
                />
                <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  v-model="editForm.email"
                  type="email"
                  placeholder="your@email.com"
                  disabled
                />
                <small>Email невозможно изменить</small>
              </div>
              <div class="form-group">
                <label for="phoneNumber">Номер телефона</label>
                <input
                  id="phoneNumber"
                  v-model="editForm.phoneNumber"
                  type="tel"
                  placeholder="+7 (999) 999-99-99"
                  :class="{ error: errors.phoneNumber }"
                />
                <span v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</span>
              </div>
            </div>

            <div v-if="saveError" class="error-message">
              {{ saveError }}
            </div>

            <div class="form-actions">
              <button type="submit" class="save-button" :disabled="isSaving">
                {{ isSaving ? 'Сохранение...' : '💾 Сохранить' }}
              </button>
              <button type="button" class="cancel-button" @click="cancelEdit">
                ✕ Отменить
              </button>
            </div>
          </form>
        </div>

        <div class="profile-section">
          <div class="section-header">
            <h2>Безопасность и приватность</h2>
          </div>

          <div class="security-grid">
            <div class="security-card">
              <div class="security-icon">🔐</div>
              <h3>Пароль</h3>
              <p>Последнее изменение неизвестно</p>
              <button class="security-button">Изменить пароль</button>
            </div>
            <div class="security-card">
              <div class="security-icon">📧</div>
              <h3>Email</h3>
              <p>{{ user?.email }}</p>
              <button class="security-button" disabled>Привязан</button>
            </div>
            <div class="security-card">
              <div class="security-icon">📱</div>
              <h3>Двухфакторная аутентификация</h3>
              <p>Не включена</p>
              <button class="security-button">Включить 2FA</button>
            </div>
            <div class="security-card">
              <div class="security-icon">📊</div>
              <h3>Активные сессии</h3>
              <p>1 активная сессия</p>
              <button class="security-button">Управление</button>
            </div>
          </div>
        </div>

        <div class="profile-section danger-zone">
          <div class="section-header">
            <h2>Опасная зона</h2>
          </div>

          <div class="danger-content">
            <div>
              <h3>Удалить профиль</h3>
              <p>Эта операция необратима. Все ваши данные будут удалены.</p>
            </div>
            <button @click="openDeleteModal" class="delete-button">
              🗑️ Удалить профиль
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Подтверждение удаления</h2>
          <button @click="closeDeleteModal" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить свой профиль?</p>
          <p class="warning">Это действие невозможно отменить. Все ваши данные будут удалены безвозвратно.</p>
          <div class="confirmation-input">
            <label>Введите ваш email для подтверждения:</label>
            <input
              v-model="deleteConfirmEmail"
              type="email"
              placeholder="your@email.com"
              class="confirmation-email"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteModal" class="modal-cancel">Отменить</button>
          <button
            @click="confirmDelete"
            class="modal-delete"
            :disabled="deleteConfirmEmail !== user?.email || isDeleting"
          >
            {{ isDeleting ? 'Удаление...' : 'Удалить профиль' }}
          </button>
        </div>
      </div>
    </div>

    <CompareSelectModal
      :show="showCompareModal"
      :currentProduct="null"
      @close="closeCompareModal"
    />
  </div>
</template>

<script>
import authAPI from '@/api/auth.js';
import favoritesAPI from '@/api/favorites.js';
import comparisonAPI from '@/api/comparison.js';
import CompareSelectModal from '@/components/CompareSelectModal.vue';

export default {
  name: 'ProfileView',
  components: {
    CompareSelectModal
  },

  data() {
    return {
      user: null,
      editForm: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: ''
      },
      isEditing: false,
      isSaving: false,
      isDeleting: false,
      saveError: '',
      errors: {},
      showDeleteModal: false,
      deleteConfirmEmail: '',
      loading: true,
      favoritesCount: 0,
      comparisonCount: 0,
      showCompareModal: false
    };
  },

 computed: {
 isAdmin() {
 return this.user?.role === 'admin';
 },
 userInitials() {
 if (this.user) {
 const first = this.user.firstName?.[0] || '';
 const last = this.user.lastName?.[0] || '';
 return (first + last).toUpperCase();
 }
 return '';
 }
 },

  async mounted() {
    await this.loadFavoritesCount();
    this.loadComparisonCount();
    await this.loadProfile();
  },

  methods: {
    async loadProfile() {
      try {
        this.loading = true;
        this.user = await authAPI.getProfile();
        this.initializeEditForm();
      } catch (error) {
        this.saveError = 'Ошибка загрузки профиля: ' + error.message;
      } finally {
        this.loading = false;
      }
    },

    async loadFavoritesCount() {
      try {
        const data = await favoritesAPI.getFavorites();
        this.favoritesCount = data.favorites.length;
      } catch (error) {
        console.error('Ошибка загрузки счётчика избранного:', error);
        this.favoritesCount = 0;
      }
    },

    loadComparisonCount() {
      this.comparisonCount = comparisonAPI.getComparison().length;
    },

    initializeEditForm() {
      this.editForm = {
        firstName: this.user?.firstName || '',
        lastName: this.user?.lastName || '',
        email: this.user?.email || '',
        phoneNumber: this.user?.phoneNumber || ''
      };
    },

    validateForm() {
      this.errors = {};

      if (!this.editForm.firstName?.trim()) {
        this.errors.firstName = 'Имя обязательно';
      }

      if (!this.editForm.lastName?.trim()) {
        this.errors.lastName = 'Фамилия обязательна';
      }

      if (this.editForm.phoneNumber && !/^[\d\s\-+()]*$/.test(this.editForm.phoneNumber)) {
        this.errors.phoneNumber = 'Некорректный формат номера';
      }

      return Object.keys(this.errors).length === 0;
    },

    async saveProfile() {
      if (!this.validateForm()) {
        return;
      }

      try {
        this.isSaving = true;
        this.saveError = '';

        const updateData = {
          firstName: this.editForm.firstName?.trim(),
          lastName: this.editForm.lastName?.trim(),
          phoneNumber: this.editForm.phoneNumber?.trim() || null
        };

        const response = await authAPI.updateProfile(updateData);
        this.user = response.user;
        this.isEditing = false;
        this.initializeEditForm();
      } catch (error) {
        this.saveError = 'Ошибка сохранения: ' + error.message;
      } finally {
        this.isSaving = false;
      }
    },

    cancelEdit() {
      this.isEditing = false;
      this.initializeEditForm();
      this.errors = {};
      this.saveError = '';
    },

    openDeleteModal() {
      this.showDeleteModal = true;
      this.deleteConfirmEmail = '';
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteConfirmEmail = '';
    },

    async confirmDelete() {
      try {
        this.isDeleting = true;
        await authAPI.deleteProfile();
        authAPI.logout();
        this.$router.push('/');
      } catch (error) {
        this.saveError = 'Ошибка удаления профиля: ' + error.message;
        this.closeDeleteModal();
      } finally {
        this.isDeleting = false;
      }
    },

    goBack() {
      this.$router.back();
    },

    formatDate(date) {
      if (!date) return 'Не указано';
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU');
    },

    openCompareModal() {
      this.showCompareModal = true;
    },

    closeCompareModal() {
      this.showCompareModal = false;
      this.loadComparisonCount();
    }
  }
};
</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.profile-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.profile-header {
  background: white;
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.profile-header-content {
  display: flex;
  align-items: center;
  gap: 24px;
}

.profile-avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff4d4d 0%, #ff6b6b 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(255, 77, 77, 0.3);
}

.profile-header-text h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1f2937;
  font-weight: 700;
}

.profile-header-text p {
  margin: 0;
  color: #6b7280;
  font-size: 15px;
}

.back-button {
  background: #f3f4f6;
  color: #1f2937;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #e5e7eb;
}

.member-badge {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 4px;
  font-weight: 500;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.quick-action-btn {
  background: white;
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  cursor: pointer;
}

.quick-action-btn:hover {
  border-color: #000000;
  background: #f0f4ff;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
}

.action-icon img {
  width: 27px;
  height: 27px;

}

.action-text {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 30px;
}

.stat-card {
  background: linear-gradient(135deg, #000000 0%, #2c2c2c 100%);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}



.stat-number {
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
}

.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.security-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.security-card:hover {
  border-color: #000000;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.security-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.security-card h3 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
}

.security-card p {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #6b7280;
}

.security-button {
  padding: 8px 12px;
  background: #000000;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.security-button:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.security-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #d1d5db;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-section {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.profile-section.danger-zone {
  border: 2px solid #fee2e2;
  background: #fffbfb;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
  font-weight: 700;
}

.edit-button {
  background: #000000;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-card {
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-card:hover {
  border-color: #000000;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.info-card label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.info-card p {
  margin: 0;
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-group input:focus {
  outline: none;
  border-color: #000000;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-group input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.form-group small {
  font-size: 12px;
  color: #9ca3af;
}

.error-text {
  font-size: 13px;
  color: #ef4444;
  margin-top: -2px;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.save-button {
  flex: 1;
  padding: 13px 20px;
  background: rgba(102, 126, 234, 0.85);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.save-button:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-button {
  flex: 1;
  padding: 13px 20px;
  background: #f3f4f6;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cancel-button:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

.danger-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.danger-content h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #dc2626;
  font-weight: 700;
}

.danger-content p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.delete-button {
  padding: 12px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.delete-button:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #1f2937;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.3s;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1f2937;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 12px 0;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.6;
}

.modal-body p.warning {
  color: #dc2626;
  font-weight: 600;
  background: #fee2e2;
  padding: 12px;
  border-radius: 8px;
}

.confirmation-input {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.confirmation-input label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.confirmation-email {
  padding: 12px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s ease;
}

.confirmation-email:focus {
  outline: none;
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
}

.modal-cancel {
  flex: 1;
  padding: 12px 20px;
  background: #f3f4f6;
  color: #1f2937;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-cancel:hover {
  background: #e5e7eb;
}

.modal-delete {
  flex: 1;
  padding: 12px 20px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-delete:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.modal-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 20px 16px;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }

  .profile-header-content {
    flex-direction: column;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .security-grid {
    grid-template-columns: 1fr;
  }

  .profile-section {
    padding: 24px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .danger-content {
    flex-direction: column;
    align-items: stretch;
  }

  .delete-button {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
  }
}
</style>
