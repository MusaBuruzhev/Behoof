<template>
  <section class="cta-section section">
    <div class="container">
      <div class="cta-content">
        <h2 class="cta-title">Готовы сделать выбор?</h2>
        <p class="cta-description">
          Переходите в каталог и выбирайте технику своей мечты
        </p>
        <router-link to="/catalog" class="btn btn-primary btn-lg">
          Перейти в каталог
          <svg
            class="btn-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cta-section {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-dark) 100%
  );
  padding: var(--spacing-24) 0;
}

.cta-content {
  text-align: center;
  max-width: 640px;
  margin: 0 auto;
}

.cta-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-inverse);
  margin-bottom: var(--spacing-4);
}

.cta-description {
  font-size: var(--font-size-body-large);
  line-height: var(--line-height-relaxed);
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: var(--spacing-8);
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body-large);
  background-color: var(--color-surface);
  color: var(--color-primary);
}

.btn-lg:hover {
  background-color: var(--color-surface-secondary);
}

.btn-icon {
  width: 20px;
  height: 20px;
  margin-left: var(--spacing-2);
}

/* Адаптивность */
@media (max-width: 640px) {
  .cta-section {
    padding: var(--spacing-16) 0;
  }

  .cta-title {
    font-size: var(--font-size-h3);
  }

  .cta-description {
    font-size: var(--font-size-body);
  }
}
</style>
