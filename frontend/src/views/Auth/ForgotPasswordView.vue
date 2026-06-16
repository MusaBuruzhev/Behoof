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
          <h1 class="auth-title">Забыли пароль?</h1>
          <p class="auth-subtitle">Введите email для восстановления доступа</p>
        </div>

        <div v-if="!isSubmitted" class="auth-form">
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

          <button
            type="submit"
            class="btn btn-primary btn-submit"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="!isSubmitting">Отправить инструкцию</span>
            <span v-else class="submit-loading">
              <span class="spinner"></span>
              Отправка...
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

          <div class="auth-footer">
            <p>Вспомнили пароль?</p>
            <router-link to="/auth/login" class="link-primary">
              Вернуться ко входу
            </router-link>
          </div>
        </div>

        <div v-else class="success-message">
          <div class="success-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
              />
            </svg>
          </div>
          <h2 class="success-title">Письмо отправлено</h2>
          <p class="success-text">
            Если аккаунт с email
            <strong>{{ formData.email }}</strong> существует, вы получите
            инструкцию по восстановлению пароля.
          </p>
          <div class="success-actions">
            <router-link to="/auth/login" class="btn btn-primary">
              Вернуться ко входу
            </router-link>
            <button class="btn btn-outline" @click="isSubmitted = false">
              Попробовать другой email
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

const formData = reactive({
  email: "",
});

const isSubmitting = ref(false);
const isSubmitted = ref(false);
const serverError = ref("");
const errors = reactive<Record<string, string>>({});

const validateEmail = (email: string): string | null => {
  if (!email) return "Email обязателен";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Некорректный формат email";
  return null;
};

const handleSubmit = async () => {
  serverError.value = "";
  errors.email = "";

  const emailError = validateEmail(formData.email);
  if (emailError) {
    errors.email = emailError;
    return;
  }

  isSubmitting.value = true;

  try {
    // TODO: Реализовать endpoint forgot password на backend
    // const response = await forgotPassword({ email: formData.email })

    // Имитация успешного ответа (backend может вернуть заглушку)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    isSubmitted.value = true;
  } catch (error: any) {
    console.error("Forgot password error:", error);

    if (error.response?.data?.error) {
      serverError.value = error.response.data.error;
    } else {
      serverError.value = "Ошибка подключения. Попробуйте позже.";
    }
  } finally {
    isSubmitting.value = false;
  }
};
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

.form-error {
  font-size: var(--font-size-small);
  color: var(--color-error);
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
  margin-top: var(--spacing-6);
  padding-top: var(--spacing-6);
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

/* Success Message */
.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-6) 0;
}

.success-icon {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: rgba(5, 150, 105, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-6);
}

.success-icon svg {
  width: 40px;
  height: 40px;
  color: #059669;
}

.success-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-3) 0;
}

.success-text {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-8) 0;
}

.success-text strong {
  color: var(--color-text-primary);
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  width: 100%;
}

/* Responsive */
@media (max-width: 480px) {
  .auth-card {
    padding: var(--spacing-6);
  }

  .auth-title {
    font-size: var(--font-size-h3);
  }

  .success-actions {
    flex-direction: column;
  }
}
</style>
