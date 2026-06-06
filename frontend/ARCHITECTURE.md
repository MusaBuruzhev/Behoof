# Архитектура Frontend проекта Behoof

## 📁 Структура проекта

```
frontend/
├── public/                  # Статические файлы
├── src/
│   ├── api/                 # API слой (axios + endpoints)
│   │   ├── axios.ts         # Настройка axios instance
│   │   └── index.ts         # API функции
│   ├── assets/              # Статические ресурсы (изображения, шрифты)
│   ├── components/          # Переиспользуемые компоненты
│   ├── composables/         # Vue 3 Composition API функции
│   ├── layouts/             # Layout компоненты
│   ├── router/              # Vue Router конфигурация
│   │   └── index.ts         # Маршруты
│   ├── stores/              # Pinia stores
│   │   └── index.ts         # Все stores
│   ├── types/               # TypeScript типы
│   │   └── index.ts         # Типы данных
│   ├── utils/               # Утилиты и хелперы
│   ├── views/               # Страницы приложения
│   │   ├── Admin/           # Админ-панель
│   │   ├── Auth/            # Авторизация
│   │   ├── Catalog/         # Каталог товаров
│   │   ├── Favorites/       # Избранное
│   │   ├── Order/           # Заказы
│   │   ├── Product/         # Страница товара
│   │   └── Profile/         # Профиль пользователя
│   ├── App.vue              # Корневой компонент
│   └── main.ts              # Точка входа
├── .env.example             # Переменные окружения
├── index.html               # HTML шаблон
├── package.json             # Зависимости
├── tsconfig.json            # TypeScript конфигурация
└── vite.config.ts           # Vite конфигурация
```

## 🌐 Backend API

### Базовый URL
```
http://localhost:5000/api
```

### Доступные эндпоинты

#### Каталог товаров
| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/catalog` | Получить весь каталог | Нет |
| GET | `/products` | Список товаров (пагинация, фильтры) | Нет |
| GET | `/products/:id` | Товар по ID | Нет |
| POST | `/products` | Добавить товар | Админ |
| PUT | `/products/:id` | Обновить товар | Админ |
| DELETE | `/products/:id` | Удалить товар | Админ |
| POST | `/products/:id/reviews` | Добавить отзыв | Да |
| DELETE | `/products/:id/reviews/:reviewId` | Удалить отзыв | Да |
| POST | `/initialize` | Инициализация данных | Админ |

#### Авторизация
| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| POST | `/auth/register` | Регистрация | Нет |
| POST | `/auth/login` | Вход | Нет |
| GET | `/auth/profile` | Профиль | Да |
| PUT | `/auth/profile` | Обновить профиль | Да |
| DELETE | `/auth/profile` | Удалить профиль | Да |
| GET | `/auth/verify` | Верификация токена | Да |

#### Избранное
| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/favorites` | Получить избранное | Да |
| POST | `/favorites/add` | Добавить в избранное | Да |
| POST | `/favorites/remove` | Удалить из избранного | Да |

#### Заказы
| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| POST | `/orders` | Создать заказ | Да |
| GET | `/orders/my` | Мои заказы | Да |
| PUT | `/orders/my/:id/cancel` | Отменить заказ | Да |
| DELETE | `/orders/my/:id` | Удалить заказ (в историю) | Да |

#### Уведомления
| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/notifications` | Уведомления пользователя | Да |
| GET | `/notifications/unread-count` | Количество непрочитанных | Да |
| PUT | `/notifications/:id/read` | Отметить прочитанным | Да |
| PUT | `/notifications/read-all` | Отметить все прочитанными | Да |
| DELETE | `/notifications/:id` | Удалить уведомление | Да |
| DELETE | `/notifications/clear-read` | Удалить прочитанные | Да |

#### Админ
| Метод | Эндпоинт | Описание | Auth |
|-------|----------|----------|------|
| GET | `/admin/users` | Все пользователи | Админ |
| GET | `/admin/stats` | Статистика | Админ |
| GET | `/admin/orders` | Все заказы | Админ |
| GET | `/admin/notifications` | Все уведомления | Админ |
| PUT | `/admin/users/:id/role` | Изменить роль | Админ |
| DELETE | `/admin/users/:id` | Удалить пользователя | Админ |
| PUT | `/admin/orders/:id/status` | Статус заказа | Админ |
| DELETE | `/admin/orders/:id` | Удалить заказ | Админ |

## 📊 Структура данных

### Category (Категория)
```typescript
interface Category {
  id: string           // "cat1", "cat2", ...
  name: string         // "Смартфоны", "Ноутбуки", ...
  subcategoryIds: string[]
}
```

### Subcategory (Подкатегория)
```typescript
interface Subcategory {
  id: string           // "sub1", "sub2", ...
  name: string         // "Apple", "Samsung", ...
  categoryId: string   // Ссылка на категорию
  productIds: string[]
  isAllCategory: boolean
}
```

### Product (Товар)
```typescript
interface Product {
  id: string
  name: string
  price: number        // Виртуальное поле из priceHistory
  priceHistory: { date: string; price: number }[]
  description: string
  characteristics: { trait: string; value: string }[]
  brand: string
  categoryId: string
  subcategoryId: string
  modelId: string
  traitRatings: Record<string, number>  // {"дизайн": 5, "батарея": 4, ...}
  images: string[]     // ["/uploads/...", ...]
  reviews: Review[]
}
```

### Review (Отзыв)
```typescript
interface Review {
  userId: string
  userName: string
  userAvatar: string | null
  text: string
  traitRatings: Record<string, number>
  createdAt: string
}
```

### User (Пользователь)
```typescript
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'admin'
  phoneNumber?: string | null
  address?: { street?: string; city?: string; postalCode?: string; country?: string }
  avatar?: string | null
  birthDate?: string | null
  favorites: string[]  // Массив ID товаров
}
```

### Order (Заказ)
```typescript
interface Order {
  id: string
  userId: string
  productId: string
  status: 'pending' | 'confirmed' | 'ready' | 'completed' | 'cancelled'
  pickupAt: string
  contactPhone: string
  comment: string
  isDeleted: boolean
  isActive?: boolean   // Виртуальное поле
}
```

### Notification (Уведомление)
```typescript
interface Notification {
  id: string
  userId: string
  type: 'new_order' | 'order_status' | 'new_product' | 'promo'
  title: string
  message: string
  isRead: boolean
  isDeleted: boolean
  relatedId: string | null
  relatedType: 'order' | 'product' | null
  isNew?: boolean      // Виртуальное поле (< 24 часов)
}
```

## 📄 Страницы приложения

### Публичные страницы
| Страница | Путь | Описание |
|----------|------|----------|
| Главная | `/` | Главная страница |
| Каталог | `/catalog` | Все категории |
| Категория | `/catalog/:categoryId` | Товары категории |
| Подкатегория | `/catalog/:categoryId/:subcategoryId` | Товары подкатегории |
| Товар | `/product/:id` | Детальная страница товара |
| Вход | `/auth/login` | Форма входа |
| Регистрация | `/auth/register` | Форма регистрации |

### Защищённые страницы (требуют авторизации)
| Страница | Путь | Описание |
|----------|------|----------|
| Профиль | `/profile` | Личный кабинет |
| Избранное | `/favorites` | Избранные товары |
| Заказы | `/orders` | История заказов |
| Детали заказа | `/orders/:id` | Детали конкретного заказа |
| Уведомления | `/notifications` | Уведомления |

### Админ-панель (требует роль admin)
| Страница | Путь | Описание |
|----------|------|----------|
| Дашборд | `/admin` | Общая статистика |
| Управление товарами | `/admin/products` | CRUD товаров |
| Управление заказами | `/admin/orders` | Все заказы |
| Управление пользователями | `/admin/users` | Все пользователи |

## 🗂️ Pinia Stores

### useAuthStore
- **state**: user, token, isLoading
- **getters**: isAuthenticated, isAdmin, userName
- **actions**: setAuth, logout

### useCatalogStore
- **state**: categories, subcategories, products, isLoading
- **getters**: getCategoryById, getSubcategoryById, getProductById
- **actions**: setCatalog

### useFavoritesStore
- **state**: productIds, isLoading
- **getters**: isFavorite, favoritesCount
- **actions**: setFavorites, addFavorite, removeFavorite

### useOrdersStore
- **state**: orders, isLoading
- **actions**: setOrders, addOrder, updateOrderStatus

### useNotificationsStore
- **state**: notifications, unreadCount, isLoading
- **getters**: unreadNotifications
- **actions**: setNotifications, setUnreadCount, markAsRead, markAllAsRead

## 🔌 API слой

API организован в `src/api/index.ts` с использованием axios instance из `src/api/axios.ts`.

### Особенности:
- Автоматическое добавление Bearer токена в заголовки
- Обработка 401 ошибок (перенаправление на login)
- Группировка по доменам: Catalog, Auth, Favorites, Orders, Notifications, Admin

## 🎨 Layouts (планируется)

- **DefaultLayout** - основной layout для публичных страниц (Header + Footer)
- **AuthLayout** - layout для страниц авторизации (минималистичный)
- **AdminLayout** - layout для админ-панели (sidebar + header)

## 🧩 Основные компоненты (планируется)

### Общие
- Header (навигация, поиск, корзина, профиль)
- Footer (контакты, ссылки)
- ProductCard (карточка товара)
- CategoryCard (карточка категории)

### Каталог
- CatalogFilters (фильтры: цена, бренд, характеристики)
- Pagination (пагинация)
- SortDropdown (сортировка)

### Товар
- ProductGallery (галерея изображений)
- ProductInfo (информация о товаре)
- ProductCharacteristics (характеристики)
- ReviewsList (список отзывов)
- ReviewForm (форма отзыва)

### Авторизация
- LoginForm
- RegisterForm

### Профиль
- ProfileForm
- OrdersList
- NotificationsList

### Админ
- AdminSidebar
- ProductsTable
- OrdersTable
- UsersTable

## 🚀 Следующие шаги

1. Создание базовых layout компонентов
2. Реализация Header с навигацией
3. Создание страницы каталога с фильтрами
4. Создание карточки товара
5. Реализация страницы товара
6. Авторизация и профиль пользователя
7. Избранное и заказы
8. Админ-панель
