<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="auth-branding">
          <div class="auth-logo-circle">
            <img src="../../public/logo.svg" alt="">
          </div>
          <h1>Behoof</h1>
          <p>Вернулись? Добро пожаловать обратно!</p>
        </div>

        <div class="auth-features">
          <div class="feature-card">
            <div class="feature-number">01</div>
            <h3>Быстрый вход</h3>
            <p>Войдите всего в несколько кликов</p>
          </div>
          <div class="feature-card">
            <div class="feature-number">02</div>
            <h3>Безопасность</h3>
            <p>Защита данных с использованием токенов</p>
          </div>
          <div class="feature-card">
            <div class="feature-number">03</div>
            <h3>Персональный опыт</h3>
            <p>Получите рекомендации на основе истории</p>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <h2>Вход</h2>
          <p class="auth-subtitle">Войдите в свой аккаунт</p>

          <form @submit.prevent="handleLogin" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  :class="{ error: errors.email }"
                  autocomplete="email"
                />
              </div>
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <div class="password-label-row">
                <label for="password">Пароль</label>
                <router-link to="/forgot-password" class="forgot-link">Забыли пароль?</router-link>
              </div>
              <div class="input-wrapper password-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Ваш пароль"
                  required
                  :class="{ error: errors.password }"
                  autocomplete="current-password"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :title="showPassword ? 'Скрыть' : 'Показать'"
                >
                  {{ showPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
            </div>

            <div class="form-group checkbox">
              <input
                id="remember"
                v-model="form.remember"
                type="checkbox"
              />
              <label for="remember">Запомнить меня</label>
            </div>

            <button
              type="submit"
              class="auth-button"
              :disabled="isLoading"
              :class="{ loading: isLoading }"
            >
              {{ isLoading ? 'Вход...' : 'Войти в аккаунт' }}
            </button>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>
          </form>

          <div class="divider">
            <span>или</span>
          </div>

          <button class="social-button google">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Войти с Google
          </button>

          <p class="auth-footer">
            Нет аккаунта?
            <router-link to="/register" class="auth-link">Зарегистрироваться</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authAPI from '@/api/auth.js';

export default {
  name: 'LoginView',
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: {},
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    async handleLogin() {
      this.errors = {};
      this.error = '';

      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        await authAPI.login(this.form.email, this.form.password);

        if (this.form.remember) {
          localStorage.setItem('rememberEmail', this.form.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }

        this.$router.push('/');
      } catch (err) {
        this.error = err.response?.data?.error || 'Ошибка входа. Попробуйте позже.';
      } finally {
        this.isLoading = false;
      }
    },

    validateForm() {
      let isValid = true;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Введите корректный email';
        isValid = false;
      }

      if (this.form.password.length < 6) {
        this.errors.password = 'Пароль неверный';
        isValid = false;
      }

      return isValid;
    }
  },
  mounted() {
    if (authAPI.isAuthenticated()) {
      this.$router.push('/');
    }

    const rememberEmail = localStorage.getItem('rememberEmail');
    if (rememberEmail) {
      this.form.email = rememberEmail;
      this.form.remember = true;
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-image: url('../../public/fon/authFon.jpg');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.auth-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  overflow: hidden;
  max-width: 1400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-left {

  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  backdrop-filter: blur(4px);
}

.auth-branding {
  text-align: center;
  margin-bottom: 40px;
}

.auth-logo-circle {
  width: 100px;
  height: 100px;
  margin: 0 auto 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.auth-logo-circle svg {
  width: 60%;
  height: 60%;
}

.auth-logo-circle img {
  width: 60%;
  height: 60%;
}

.auth-branding h1 {
  font-size: 32px;
  margin: 0 0 10px;
  font-weight: 700;
}

.auth-branding p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.auth-features {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.feature-number {
  font-size: 24px;
  font-weight: 700;
  opacity: 0.6;
  margin-bottom: 10px;
}

.feature-card h3 {
  font-size: 15px;
  margin: 0 0 5px;
  font-weight: 600;
}

.feature-card p {
  font-size: 14px;
  opacity: 0.7;
  margin: 0;
}

.auth-right {
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-form-container h2 {
  font-size: 28px;
  margin: 0 0 10px;
  color: #1f2937;
  font-weight: 700;
}

.auth-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 30px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.password-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.password-label-row label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.forgot-link {
  font-size: 14px;
  color: #ff4d4d;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #cc3b3b;
}

.forgot-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.input-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  fill: #9ca3af;
  pointer-events: none;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 15px 14px 42px;
  font-size: 16px;
  background: transparent;
}

.input-wrapper input.error {
  background: rgba(239, 68, 68, 0.05);
}

.password-wrapper {
  padding-right: 12px;
}

.password-wrapper input {
  padding-right: 40px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.password-toggle:hover {
  opacity: 1;
}

.error-text {
  font-size: 14px;
  color: #ef4444;
  margin-top: -4px;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.form-group.checkbox input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
}

.form-group.checkbox label {
  text-transform: none;
  font-weight: 400;
  font-size: 15px;
  margin: 0;
  cursor: pointer;
}

.auth-button {
  padding: 14px 20px;
  background: rgba(255, 77, 77, 0.85);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 77, 77, 0.3);
}

.auth-button:active:not(:disabled) {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
}

.divider {
  text-align: center;
  margin: 20px 0;
  color: #d1d5db;
  font-size: 14px;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: #e5e7eb;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.social-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #374151;
}

.social-button:hover {
  border-color: #d1d5db;
  background: #f9fafb;
  transform: translateY(-2px);
}

.social-button svg {
  width: 20px;
  height: 20px;
}

.auth-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 15px;
  color: #6b7280;
}

.auth-link {
  color: #ff4d4d;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.auth-link:hover {
  color: #cc3b3b;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .auth-wrapper {
    grid-template-columns: 1fr;
  }

  .auth-left {
    padding: 40px 30px;
    order: 2;
  }

  .auth-right {
    padding: 40px 30px;
    order: 1;
  }

  .auth-features {
    gap: 15px;
  }
}

@media (max-width: 480px) {
  .auth-wrapper {
    border-radius: 12px;
  }

  .auth-left {
    padding: 30px 20px;
  }

  .auth-right {
    padding: 30px 20px;
  }

  .auth-branding h1 {
    font-size: 24px;
  }

  .auth-form-container h2 {
    font-size: 22px;
  }

  .password-label-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
