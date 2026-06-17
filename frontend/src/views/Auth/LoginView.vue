<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <router-link to="/" class="auth-logo">
            <svg
              class="logo-icon"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="8" fill="currentColor" />
              <path d="M20 10L30 20L20 30L10 20L20 10Z" fill="white" />
            </svg>
            <span class="logo-text">Behoof</span>
          </router-link>
          <h1 class="auth-title">Вход в аккаунт</h1>
          <p class="auth-subtitle">Введите свои данные для продолжения</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="you@example.com"
              autocomplete="email"
              :disabled="isSubmitting"
            />
            <span v-if="errors.email" class="form-error">{{
              errors.email
            }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Пароль</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="isSubmitting"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                tabindex="-1"
              >
                <svg
                  v-if="!showPassword"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                  />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="form-error">{{
              errors.password
            }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-wrapper">
              <input
                v-model="formData.rememberMe"
                type="checkbox"
                :disabled="isSubmitting"
              />
              <span class="checkbox-label">Запомнить меня</span>
            </label>
            <router-link to="/auth/forgot-password" class="forgot-link">
              Забыли пароль?
            </router-link>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-submit"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Войти</span>
            <span v-else class="submit-loading">
              <span class="spinner"></span>
              Вход...
            </span>
          </button>

          <div v-if="serverError" class="server-error">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ serverError }}
          </div>
        </form>

        <div class="auth-footer">
          <p>Нет аккаунта?</p>
          <router-link to="/auth/register" class="link-primary">
            Создать аккаунт
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores";
import { login } from "@/api";
import type { User } from "@/types";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const formData = reactive({
  email: "",
  password: "",
  rememberMe: false,
});

const showPassword = ref(false);
const isSubmitting = ref(false);
const serverError = ref("");
const errors = reactive<Record<string, string>>({});

interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

const validateEmail = (email: string): string | null => {
  if (!email) return "Email обязателен";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Некорректный формат email";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Пароль обязателен";
  if (password.length < 6) return "Пароль должен содержать минимум 6 символов";
  return null;
};

const validateForm = (): boolean => {
  errors.email = "";
  errors.password = "";

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  return !errors.email && !errors.password;
};

const handleSubmit = async () => {
  serverError.value = "";

  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    const response = await login({
      email: formData.email,
      password: formData.password,
    });

    const { user, token } = response.data as LoginResponse;
    authStore.setAuth(user, token);

    const redirect = (route.query.redirect as string) || "/profile";
    router.push(redirect);
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.response?.status === 401) {
      serverError.value = "Неверный email или пароль";
    } else if (error.response?.status === 403) {
      serverError.value = "Аккаунт заблокирован";
    } else if (error.response?.data?.error) {
      serverError.value = error.response.data.error;
    } else {
      serverError.value = "Ошибка подключения. Попробуйте позже.";
    }
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    const redirect = (route.query.redirect as string) || "/profile";
    router.push(redirect);
  }
});
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
  background: var(--color-background);
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-10);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.auth-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
  color: var(--color-text-primary);
  text-decoration: none;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-h4);
}

.logo-icon {
  width: 40px;
  height: 40px;
  color: var(--color-primary);
}

.auth-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2) 0;
}

.auth-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Form */
.auth-form {
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
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.form-input {
  width: 100%;
  padding: var(--spacing-4);
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

.form-input.error {
  border-color: var(--color-error);
}

.form-input:disabled {
  background: var(--color-background);
  cursor: not-allowed;
  opacity: 0.6;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: var(--spacing-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: var(--spacing-2);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-text-primary);
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

.form-error {
  font-size: var(--font-size-small);
  color: var(--color-error);
}

/* Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  cursor: pointer;
}

.checkbox-wrapper input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
  user-select: none;
}

.forgot-link {
  font-size: var(--font-size-small);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--color-primary-hover);
}

/* Button */
.btn-submit {
  width: 100%;
  padding: var(--spacing-4);
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-loading {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: var(--radius-full);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Server Error */
.server-error {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  background: rgba(220, 38, 38, 0.1);
  border-radius: var(--radius-md);
  font-size: var(--font-size-small);
  color: var(--color-error);
}

.server-error svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Footer */
.auth-footer {
  text-align: center;
  margin-top: var(--spacing-8);
  padding-top: var(--spacing-8);
  border-top: 1px solid var(--color-border-light);
}

.auth-footer p {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2) 0;
}

.link-primary {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.link-primary:hover {
  color: var(--color-primary-hover);
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: var(--spacing-6);
  }

  .auth-title {
    font-size: var(--font-size-h3);
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
}
</style>
