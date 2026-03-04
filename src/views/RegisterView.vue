<template>
  <div class="auth-container">
    <div class="auth-wrapper">
      <div class="auth-left">
        <div class="auth-branding">
          <div class="auth-logo-circle">
            <img src="../../public/logo.svg" alt="">
          </div>
          <h1>Behoof</h1>
          <p>Создайте аккаунт и получайте лучшие предложения</p>
        </div>

        <div class="auth-benefits">
          <div class="benefit">
            <div class="benefit-number">01</div>
            <h3>Быстрая регистрация</h3>
            <p>5 минут на создание аккаунта</p>
          </div>
          <div class="benefit">
            <div class="benefit-number">02</div>
            <h3>Инструменты сравнения</h3>
            <p>Сравнивайте цены в магаортах</p>
          </div>
          <div class="benefit">
            <div class="benefit-number">03</div>
            <h3>Избранное</h3>
            <p>Сохраняйте товары в одноклик</p>
          </div>
        </div>
      </div>

      <div class="auth-right">
        <div class="auth-form-container">
          <h2>Регистрация</h2>
          <p class="auth-subtitle">Пожалуйста, заполните форму ниже</p>

          <form @submit.prevent="handleRegister" class="auth-form">
            <div class="form-group">
              <label for="firstName">Имя</label>
              <input
                id="firstName"
                v-model="form.firstName"
                type="text"
                placeholder="Ваше имя"
                required
                :class="{ error: errors.firstName }"
              />
              <span v-if="errors.firstName" class="error-text">{{ errors.firstName }}</span>
            </div>

            <div class="form-group">
              <label for="lastName">Фамилия</label>
              <input
                id="lastName"
                v-model="form.lastName"
                type="text"
                placeholder="Ваша фамилия"
                required
                :class="{ error: errors.lastName }"
              />
              <span v-if="errors.lastName" class="error-text">{{ errors.lastName }}</span>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                placeholder="your@email.com"
                required
                :class="{ error: errors.email }"
              />
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="phoneNumber">Номер телефона</label>
              <input
                id="phoneNumber"
                v-model="form.phoneNumber"
                type="tel"
                placeholder="+7 (999) 999-99-99"
                :class="{ error: errors.phoneNumber }"
              />
              <span v-if="errors.phoneNumber" class="error-text">{{ errors.phoneNumber }}</span>
            </div>

            <div class="form-group">
              <label for="password">Пароль</label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Минимум 6 символов"
                  required
                  :class="{ error: errors.password }"
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
              <div class="password-strength" :style="{ width: passwordStrength + '%', opacity: passwordStrength / 100 }"></div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Подтвердите пароль</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Повторите пароль"
                required
                :class="{ error: errors.confirmPassword }"
              />
              <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
            </div>

            <div class="form-group checkbox">
              <input
                id="terms"
                v-model="form.terms"
                type="checkbox"
                required
              />
              <label for="terms">Я согласен с условиями использования</label>
            </div>

            <button
              type="submit"
              class="auth-button"
              :disabled="isLoading"
              :class="{ loading: isLoading }"
            >
              {{ isLoading ? 'Регистрация...' : 'Создать аккаунт' }}
            </button>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>
          </form>

          <p class="auth-footer">
            Уже есть аккаунт?
            <router-link to="/login" class="auth-link">Войти</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import authAPI from '@/api/auth.js';

export default {
  name: 'RegisterView',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        terms: false
      },
      errors: {},
      error: '',
      isLoading: false,
      showPassword: false
    };
  },
  computed: {
    passwordStrength() {
      const password = this.form.password;
      let strength = 0;

      if (password.length >= 6) strength += 20;
      if (password.length >= 12) strength += 20;
      if (/[a-z]/.test(password)) strength += 15;
      if (/[A-Z]/.test(password)) strength += 15;
      if (/[0-9]/.test(password)) strength += 15;
      if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

      return Math.min(strength, 100);
    }
  },
  methods: {
    async handleRegister() {
      this.errors = {};
      this.error = '';

      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;

      try {
        await authAPI.register({
          firstName: this.form.firstName,
          lastName: this.form.lastName,
          email: this.form.email,
          phoneNumber: this.form.phoneNumber,
          password: this.form.password
        });

        this.$router.push('/');
      } catch (err) {
        this.error = err.response?.data?.error || 'Ошибка регистрации. Попробуйте позже.';
      } finally {
        this.isLoading = false;
      }
    },

    validateForm() {
      let isValid = true;

      if (this.form.firstName.trim().length < 2) {
        this.errors.firstName = 'Имя должно быть минимум 2 символа';
        isValid = false;
      }

      if (this.form.lastName.trim().length < 2) {
        this.errors.lastName = 'Фамилия должна быть минимум 2 символа';
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Введите корректный email';
        isValid = false;
      }

      if (this.form.password.length < 6) {
        this.errors.password = 'Пароль должен быть минимум 6 символов';
        isValid = false;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.errors.confirmPassword = 'Пароли не совпадают';
        isValid = false;
      }

      if (!this.form.terms) {
        this.error = 'Необходимо согласиться с условиями';
        isValid = false;
      }

      return isValid;
    }
  },
  mounted() {
    if (authAPI.isAuthenticated()) {
      this.$router.push('/');
    }
  }
};
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  /* фон-изображение вместо сплошного градиента */
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
  background: rgba(255,255,255,0.15); /* слегка прозрачный фон для glass-эффекта */
  backdrop-filter: blur(12px);
  border-radius: 20px;
  overflow: hidden;
  max-width: 1400px; /* увеличенный размер */
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-left {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
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

.auth-benefits {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.benefit {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.benefit:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.benefit-number {
  font-size: 24px;
  font-weight: 700;
  opacity: 0.6;
  margin-bottom: 10px;
}

.benefit h3 {
  font-size: 15px;
  margin: 0 0 5px;
  font-weight: 600;
}

.benefit p {
  font-size: 12px;
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
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 15px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input {
  padding: 14px 15px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper input {
  flex: 1;
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

.password-strength {
  height: 3px;
  background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #84cc16);
  border-radius: 2px;
  transition: width 0.3s ease;
  margin-top: 4px;
}

.error-text {
  font-size: 14px;
  color: #ef4444;
  margin-top: -2px;
}

.form-group.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.form-group.checkbox input {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
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
  margin-top: 10px;
}

.auth-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 77, 77, 0.3);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-button.loading {
  position: relative;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #dc2626;
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 10px;
  text-align: center;
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

  .auth-benefits {
    gap: 15px;
  }

  .auth-right {
    min-height: 600px;
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

  .form-group {
    gap: 4px;
  }
}
</style>
