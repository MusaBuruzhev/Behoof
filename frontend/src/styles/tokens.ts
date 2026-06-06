/**
 * ============================================
 * BEHOOF DESIGN SYSTEM — TOKENS
 * ============================================
 * 
 * TypeScript токены для использования в компонентах.
 * Синхронизированы с CSS переменными.
 */

// ==========================================
// ЦВЕТА
// ==========================================

export const colors = {
  // Основные
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',

  // Фоны
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  surfaceElevated: '#FFFFFF',

  // Текст
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  textLink: '#2563EB',
  textLinkHover: '#1D4ED8',

  // Семантические
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#059669',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#2563EB',

  // Границы
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  borderFocus: '#2563EB',
} as const

// ==========================================
// ТИПОГРАФИКА
// ==========================================

export const typography = {
  // Размеры
  fontSize: {
    h1: '56px',
    h2: '40px',
    h3: '32px',
    h4: '24px',
    h5: '20px',
    h6: '18px',
    bodyLarge: '18px',
    body: '16px',
    small: '14px',
    caption: '12px',
  },

  // Межстрочные интервалы
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Межбуквенные интервалы
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.02em',
    wider: '0.04em',
  },

  // Начертания
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Шрифты
  fontFamily: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
} as const

// ==========================================
// ОТСТУПЫ (SPACING)
// ==========================================

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px',
} as const

// ==========================================
// КОНТЕЙНЕРЫ
// ==========================================

export const containers = {
  max: '1800px',
  xl: '1500px',
  lg: '1360px',
  md: '1140px',
  sm: '960px',
  xs: '720px',
  paddingX: '24px',
  paddingY: '0',
} as const

// ==========================================
// РАДИУСЫ
// ==========================================

export const radius = {
  none: '0',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',

  // Компоненты
  card: '20px',
  button: '14px',
  input: '14px',
  modal: '24px',
} as const

// ==========================================
// ТЕНИ
// ==========================================

export const shadows = {
  // Базовые
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.08)',

  // Компоненты
  card: '0 2px 8px 0 rgba(0, 0, 0, 0.04)',
  cardHover: '0 8px 24px 0 rgba(0, 0, 0, 0.08)',
  dropdown: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
  modal: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  popover: '0 4px 20px 0 rgba(0, 0, 0, 0.08)',

  // Цветные
  primary: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
  success: '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
  error: '0 4px 14px 0 rgba(239, 68, 68, 0.25)',
} as const

// ==========================================
// АНИМАЦИИ
// ==========================================

export const animations = {
  // Длительности
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '200ms',
    slow: '250ms',
    slower: '300ms',
    slowest: '500ms',
  },

  // Функции плавности
  ease: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    outBack: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    outBounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const

// ==========================================
// Z-INDEX
// ==========================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modalBackdrop: 300,
  modal: 400,
  popover: 500,
  tooltip: 600,
  toast: 700,
} as const

// ==========================================
// БРЕЙКПОИНТЫ
// ==========================================

export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// ==========================================
// ЭКСПОРТ ДЛЯ CSS-IN-JS
// ==========================================

export const tokens = {
  colors,
  typography,
  spacing,
  containers,
  radius,
  shadows,
  animations,
  zIndex,
  breakpoints,
} as const

export type Tokens = typeof tokens
