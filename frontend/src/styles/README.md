# Behoof Design System

Дизайн-система интернет-магазина электроники Behoof.

## 📁 Структура

```
styles/
├── variables.css    # CSS переменные (цвета, типографика, spacing, и т.д.)
├── base.css         # Базовые стили (сброс, типографика, утилиты)
├── tokens.ts        # TypeScript токены для использования в компонентах
└── index.ts         # Экспорты
```

## 🎨 Цвета

### Основные

| Переменная | Значение | Использование |
|------------|----------|---------------|
| `--color-primary` | `#2563EB` | Кнопки, ссылки, акценты |
| `--color-primary-hover` | `#1D4ED8` | Hover состояние |

### Фоны

| Переменная | Значение | Использование |
|------------|----------|---------------|
| `--color-background` | `#F5F7FA` | Основной фон страницы |
| `--color-surface` | `#FFFFFF` | Карточки, поверхности |
| `--color-surface-secondary` | `#F9FAFB` | Вторичные поверхности |

### Текст

| Переменная | Значение | Использование |
|------------|----------|---------------|
| `--color-text-primary` | `#111827` | Заголовки, основной текст |
| `--color-text-secondary` | `#6B7280` | Вторичный текст |
| `--color-text-tertiary` | `#9CA3AF` | Третичный текст, placeholder |

### Семантические

| Переменная | Значение | Использование |
|------------|----------|---------------|
| `--color-success` | `#10B981` | Успешные действия |
| `--color-error` | `#EF4444` | Ошибки |
| `--color-warning` | `#F59E0B` | Предупреждения |
| `--color-info` | `#3B82F6` | Информация |

## 📝 Типографика

### Размеры шрифтов

| Переменная | Значение |
|------------|----------|
| `--font-size-h1` | `56px` |
| `--font-size-h2` | `40px` |
| `--font-size-h3` | `32px` |
| `--font-size-h4` | `24px` |
| `--font-size-body-large` | `18px` |
| `--font-size-body` | `16px` |
| `--font-size-small` | `14px` |
| `--font-size-caption` | `12px` |

### Шрифт

- **Основной:** Inter
- **Начертания:** 300, 400, 500, 600, 700

## 📐 Отступы (Spacing)

| Переменная | Значение |
|------------|----------|
| `--spacing-1` | `4px` |
| `--spacing-2` | `8px` |
| `--spacing-3` | `12px` |
| `--spacing-4` | `16px` |
| `--spacing-6` | `24px` |
| `--spacing-8` | `32px` |
| `--spacing-12` | `48px` |
| `--spacing-16` | `64px` |

## 📦 Контейнеры

| Брейкпоинт | Ширина |
|------------|--------|
| 1920+ | `1800px` |
| 1600 | `1500px` |
| 1440 | `1360px` |
| 1200 | `1140px` |

## 🔵 Радиусы

| Переменная | Значение | Использование |
|------------|----------|---------------|
| `--radius-card` | `20px` | Карточки товаров |
| `--radius-button` | `14px` | Кнопки |
| `--radius-input` | `14px` | Поля ввода |
| `--radius-modal` | `24px` | Модальные окна |

## 🌑 Тени

Все тени мягкие, без тяжёлых чёрных оттенков.

```css
--shadow-card: 0 2px 8px 0 rgba(0, 0, 0, 0.04);
--shadow-card-hover: 0 8px 24px 0 rgba(0, 0, 0, 0.08);
--shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
```

## ⚡ Анимации

| Длительность | Значение |
|--------------|----------|
| Fast | `150ms` |
| Normal | `200ms` |
| Slow | `250ms` |

### Функции плавности

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## 📦 Использование в компонентах

### CSS

```vue
<style scoped>
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: var(--spacing-6);
}
</style>
```

### TypeScript

```typescript
import { tokens } from '@/styles'

const cardStyle = {
  borderRadius: tokens.radius.card,
  boxShadow: tokens.shadows.card,
  padding: tokens.spacing[6],
}
```

## 🛠 Утилиты

В `base.css` доступны CSS классы-утилиты:

### Текст
- `.text-primary`, `.text-secondary`, `.text-tertiary`
- `.text-center`, `.text-left`, `.text-right`
- `.font-light`, `.font-normal`, `.font-medium`, `.font-semibold`, `.font-bold`

### Display
- `.block`, `.inline-block`, `.flex`, `.inline-flex`, `.grid`, `.hidden`

### Flex
- `.flex-row`, `.flex-col`, `.flex-wrap`
- `.items-center`, `.justify-center`, `.justify-between`
- `.gap-2`, `.gap-4`, `.gap-6`, `.gap-8`

### Отступы
- `.m-4`, `.mt-4`, `.mb-4`
- `.p-4`, `.p-6`, `.p-8`

### Границы
- `.border`, `.border-0`
- `.rounded`, `.rounded-lg`, `.rounded-xl`, `.rounded-2xl`

### Тени
- `.shadow-sm`, `.shadow`, `.shadow-lg`, `.shadow-xl`

### Эффекты
- `.hover-lift` — подъём при наведении
- `.transition`, `.transition-fast`

## 🌓 Тёмная тема

Дизайн-система включает подготовку к тёмной теме через `prefers-color-scheme`.

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0F0F0F;
    --color-surface: #1A1A1A;
    /* ... */
  }
}
```
