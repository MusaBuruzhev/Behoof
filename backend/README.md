# Behoof Backend API

Серверная часть интернет-магазина Behoof, предоставляющая REST API для управления каталогом товаров, категориями и подкатегориями.

## 🚀 Технологии

- **Node.js** - JavaScript runtime
- **Express.js** - Веб-фреймворк для Node.js
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **Multer** - Middleware для загрузки файлов
- **CORS** - Поддержка кросс-доменных запросов
- **Dotenv** - Управление переменными окружения

## 📋 Требования

- Node.js >= 20.19.0 || >= 22.12.0
- MongoDB
- npm

## 🛠 Установка и запуск

### 1. Установка зависимостей
```bash
cd backend
npm install
```

### 2. Настройка переменных окружения
Создайте файл `.env` в корне папки `backend/`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/behoof
FRONTEND_URL=http://localhost:5173
```

### 3. Запуск MongoDB
Убедитесь, что MongoDB запущена локально.

### 4. Запуск сервера
```bash
# Режим разработки (с nodemon)
npm run dev

# Продакшн режим
npm start
```

Сервер будет доступен по адресу: `http://localhost:5000`

## 📚 API Документация

### Базовый URL
```
http://localhost:5000/api
```

### Эндпоинты

#### 🏪 Каталог товаров

##### Получить весь каталог
```http
GET /catalog
```

**Ответ:**
```json
{
  "categories": [
    {
      "id": "cat1",
      "name": "Смартфоны",
      "subcategoryIds": ["sub1", "sub2"]
    }
  ],
  "subcategories": {
    "sub1": {
      "id": "sub1",
      "name": "Apple",
      "categoryId": "cat1",
      "productIds": ["p1", "p2"],
      "isAllCategory": false
    }
  },
  "products": {
    "p1": {
      "id": "p1",
      "name": "iPhone 15 Pro",
      "price": 1399,
      "brand": "Apple",
      "categoryId": "cat1",
      "subcategoryId": "sub1",
      "traitRatings": {
        "дизайн": 5,
        "батарея": 4
      },
      "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"]
    }
  }
}
```

#### ➕ Добавление товара

##### Добавить новый товар
```http
POST /products
Content-Type: multipart/form-data
```

**Параметры формы:**
- `name` (string, required) - Название товара
- `price` (number, required) - Цена товара
- `brand` (string, required) - Бренд товара
- `categoryId` (string, required) - ID категории
- `images` (file[], required) - Изображения товара (3-10 файлов)

**Пример запроса (JavaScript):**
```javascript
const formData = new FormData();
formData.append('name', 'iPhone 15 Pro');
formData.append('price', '1399');
formData.append('brand', 'Apple');
formData.append('categoryId', 'cat1');
formData.append('images', file1);
formData.append('images', file2);

fetch('/api/products', {
  method: 'POST',
  body: formData
});
```

**Ответ при успехе:**
```json
{
  "message": "Товар успешно добавлен",
  "product": {
    "id": "p1",
    "name": "iPhone 15 Pro",
    "price": 1399,
    "brand": "Apple",
    "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
    "traitRatings": {
      "дизайн": 3,
      "батарея": 3
    }
  }
}
```

#### 📖 Получение товара

##### Получить товар по ID
```http
GET /products/:id
```

**Параметры:**
- `id` (string) - ID товара

**Ответ:**
```json
{
  "id": "p1",
  "name": "iPhone 15 Pro",
  "price": 1399,
  "brand": "Apple",
  "categoryId": "cat1",
  "subcategoryId": "sub1",
  "traitRatings": {
    "дизайн": 5,
    "батарея": 4
  },
  "images": ["/uploads/image1.jpg", "/uploads/image2.jpg"],
  "reviews": [
    {
      "id": "...",
      "userId": "...",
      "userName": "Иван Петров",
      "userAvatar": null,
      "text": "Отличный вариант за свои деньги",
      "traitRatings": {
        "дизайн": 5,
        "батарея": 4
      },
      "createdAt": "2026-01-15T12:34:56.000Z"
    }
  ]
}
```

#### 💬 Отзывы о товаре

##### Добавить отзыв
```http
POST /products/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "text": "Отличный смартфон, камера порадовала",
  "traitRatings": {
    "дизайн": 5,
    "камера": 4,
    "батарея": 4
  }
}
```

- `text` обязателен.
- `traitRatings` необязателен: можно передавать только часть характеристик или не передавать вовсе.
- После добавления отзыва `traitRatings` товара пересчитываются как среднее с базовой оценкой `3/5`.

##### Удалить отзыв
```http
DELETE /products/:id/reviews/:reviewId
Authorization: Bearer <token>
```

Удалять можно свой отзыв (или любой, если роль `admin`).

#### ✏️ Обновление товара

##### Обновить товар
```http
PUT /products/:id
Content-Type: application/json
```

**Параметры:**
- `id` (string) - ID товара в URL

**Тело запроса:**
```json
{
  "name": "Обновленное название",
  "price": 1299,
  "traitRatings": {
    "дизайн": 4,
    "батарея": 5
  },
  "images": ["/uploads/new-image.jpg"]
}
```

#### 🗑️ Удаление товара

##### Удалить товар
```http
DELETE /products/:id
```

**Параметры:**
- `id` (string) - ID товара

**Ответ:**
```json
{
  "message": "Товар успешно удален"
}
```

#### 🔄 Инициализация данных

##### Создать начальные категории
```http
POST /initialize
```

Создает 8 основных категорий товаров и подкатегории "Все [Категория]".

**Ответ:**
```json
{
  "message": "Начальные данные инициализированы"
}
```

## 🏗 Архитектура

### Структура папок
```
backend/
├── src/
│   ├── config/          # Конфигурационные файлы
│   │   └── categoryTraits.js  # Характеристики товаров по категориям
│   ├── controllers/     # Контроллеры API
│   │   └── catalogController.js
│   ├── models/          # Модели данных MongoDB
│   │   ├── Category.js
│   │   ├── Subcategory.js
│   │   ├── Product.js
│   │   ├── Counter.js
│   │   └── index.js
│   ├── routes/          # Маршруты API
│   │   └── catalogRoutes.js
│   └── utils/           # Утилиты
│       └── idGenerator.js
├── .env                 # Переменные окружения
├── server.js            # Точка входа приложения
├── package.json
└── README.md
```

### Модели данных

#### Category (Категория)
```javascript
{
  id: String,           // Уникальный ID (cat1, cat2, ...)
  name: String,         // Название категории
  subcategoryIds: [String] // Массив ID подкатегорий
}
```

#### Subcategory (Подкатегория)
```javascript
{
  id: String,           // Уникальный ID (sub1, sub2, ...)
  name: String,         // Название подкатегории
  categoryId: String,   // ID родительской категории
  productIds: [String], // Массив ID товаров
  isAllCategory: Boolean // Флаг "Все товары категории"
}
```

#### Product (Товар)
```javascript
{
  id: String,           // Уникальный ID (p1, p2, ...)
  name: String,         // Название товара
  price: Number,        // Цена
  brand: String,        // Бренд
  categoryId: String,   // ID категории
  subcategoryId: String,// ID подкатегории
  traitRatings: Object, // Агрегированные рейтинги характеристик
  images: [String],     // Пути к изображениям
  reviews: [{           // Отзывы пользователей
    userId: String,
    userName: String,
    userAvatar: String | null,
    text: String,
    traitRatings: Object,
    createdAt: Date
  }]
}
```

#### Counter (Счетчик)
```javascript
{
  name: String,         // Название счетчика (p, sub, cat)
  value: Number         // Текущее значение
}
```

### Характеристики товаров

Каждая категория имеет уникальный набор характеристик:

```javascript
const CATEGORY_TRAITS = {
  cat1: ['дизайн', 'батарея', 'дисплей', 'камера', 'отзыв', 'портативность'], // Смартфоны
  cat2: ['производительность', 'экран', 'автономность', 'вес', 'клавиатура', 'охлаждение'], // Ноутбуки
  // ... остальные категории
}
```

## 🔧 Разработка

### Скрипты
```bash
npm run dev    # Запуск с nodemon (автоперезагрузка)
npm start      # Продакшн запуск
```

### Переменные окружения
- `PORT` - Порт сервера (по умолчанию 5000)
- `MONGODB_URI` - URI подключения к MongoDB
- `FRONTEND_URL` - URL фронтенда для CORS

### Загрузка файлов
- **Папка:** `public/uploads/`
- **Форматы:** JPEG, PNG, WebP
- **Размер:** до 5MB на файл
- **Количество:** 3-10 изображений на товар
- **Имена:** `timestamp-random.ext`

### Обработка ошибок
API возвращает структурированные ошибки:
```json
{
  "error": "Описание ошибки"
}
```

### Логирование
Сервер логирует:
- Подключение к MongoDB
- Загрузку файлов
- Создание/обновление товаров
- Ошибки выполнения

## 🧪 Тестирование API

### 1. Инициализация
```bash
POST http://localhost:5000/api/initialize
```

### 2. Добавление товара
```bash
POST http://localhost:5000/api/products
Content-Type: multipart/form-data

# В теле формы: name, price, brand, categoryId, images[]
```

### 3. Получение каталога
```bash
GET http://localhost:5000/api/catalog
```

## 🔒 Безопасность

- **Валидация файлов:** тип, размер, количество
- **CORS:** ограничение доменов
- **MongoDB:** санитизация запросов через Mongoose
- **Переменные окружения:** чувствительные данные не в коде

## 📝 Лицензия

ISC
