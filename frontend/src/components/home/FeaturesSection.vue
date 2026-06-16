<template>
  <section class="features-section section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title h2">Возможности Behoof</h2>
        <p class="section-description">
          Всё необходимое для удобного выбора электроники
        </p>
      </div>
      
      <div class="features-grid">
        <div
          v-for="feature in features"
          :key="feature.id"
          class="feature-card"
        >
          <div class="feature-icon-wrapper">
            <component :is="feature.icon" class="feature-icon" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { h } from 'vue'

// Иконки для функций системы
const CompareIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6' })
  ])
}

const HistoryIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 8v4l3 3M3 12a9 9 0 1 0 18 0A9 9 0 0 0 3 12z' })
  ])
}

const ReviewsIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
  ])
}

const FavoritesIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })
  ])
}

const NotificationsIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0' })
  ])
}

const SecureIcon = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
  ])
}

const features = [
  {
    id: 'compare',
    title: 'Сравнение товаров',
    description: 'Сравнивайте характеристики разных моделей для правильного выбора',
    icon: CompareIcon,
  },
  {
    id: 'history',
    title: 'История цен',
    description: 'Отслеживайте изменение цен на интересующие товары',
    icon: HistoryIcon,
  },
  {
    id: 'reviews',
    title: 'Отзывы покупателей',
    description: 'Читайте реальные отзывы от других покупателей',
    icon: ReviewsIcon,
  },
  {
    id: 'favorites',
    title: 'Избранное',
    description: 'Сохраняйте понравившиеся товары для быстрого доступа',
    icon: FavoritesIcon,
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    description: 'Получайте уведомления о статусе заказов и новинках',
    icon: NotificationsIcon,
  },
  {
    id: 'secure',
    title: 'Безопасные покупки',
    description: 'Гарантия безопасности данных и защиты покупок',
    icon: SecureIcon,
  },
]
</script>

<style scoped>
.features-section {
  background-color: var(--color-background);
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-16);
}

.section-title {
  margin-bottom: var(--spacing-4);
}

.section-description {
  font-size: var(--font-size-body-large);
  color: var(--color-text-secondary);
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-8);
}

.feature-card {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  padding: var(--spacing-8);
  text-align: center;
  box-shadow: var(--shadow-card);
  transition: all var(--transition-normal);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.feature-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--color-primary-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-6);
}

.feature-icon {
  width: 32px;
  height: 32px;
  color: #ffffff;
}

.feature-title {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.feature-description {
  font-size: var(--font-size-body);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
