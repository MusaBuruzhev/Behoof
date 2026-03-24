# KODA.md

## Назначение проекта

**Behoof** — веб-платформа для сравнения цен и характеристик электроники.

Проект состоит из двух частей:
- **Frontend**: SPA-приложение на Vue3 (Vite, Vue Router, ApexCharts).
- **Backend**: REST API на Node.js/Express с MongoDB (Mongoose), включая маршруты каталога и аутентификации.

Основной пользовательский сценарий: просмотр каталога, переход на карточку товара, работа с характеристиками и историей цен.

---

## Тип проекта

Это **проект с кодом** (fullstack JavaScript):
- Корневой `package.json` для frontend.
- `backend/package.json` для backend.
- `src/` с Vue-компонентами и роутингом.
- `backend/src/` с маршрутами, контроллерами и моделями.

---

## Ключевые технологии

### Frontend
- Vue3
- Vue Router4
- Vite7
- Axios
- ApexCharts + vue3-apexcharts

### Backend
- Node.js (ESM)
- Express5
- MongoDB + Mongoose
- Multer (загрузка файлов)
- JWT + bcrypt (по зависимостям backend)
- CORS, dotenv

---

## Обзор структуры репозитория

```text
.
├─ src/ # Frontend-код (Vue)
│ ├─ api/ # API-клиенты
│ ├─ components/ # UI-компоненты
│ ├─ views/ # Страницы
│ ├─ router/ # Маршрутизация
│ └─ main.js # Точка входа фронтенда
├─ backend/
│ ├─ src/
│ │ ├─ routes/ # API-маршруты
│ │ ├─ controllers/ # Контроллеры
│ │ ├─ models/ # Mongoose-модели
│ │ ├─ config/ # Конфигурации предметной области
│ │ └─ utils/ # Вспомогательные утилиты
│ ├─ server.js # Точка входа backend
│ └─ package.json
├─ public/ # Публичные ресурсы фронтенда
├─ fonts/ # Шрифты
├─ README.md
└─ package.json
```

---

## Архитектурные заметки

### Frontend
- Инициализация в `src/main.js`: подключение роутера и `vue3-apexcharts`.
- Маршруты описаны в `src/router/index.js`.
- Имеются как полноценные view-страницы, так и временные маршруты-заглушки (например, разделы «в разработке»).

### Backend
- Сервер поднимается в `backend/server.js`.
- Подключение MongoDB через `process.env.MONGODB_URI`.
- CORS ограничен доменом `FRONTEND_URL` (по умолчанию `http://localhost:5173`).
- API-маршруты подключаются через `/api`:
 - `catalogRoutes`
 - `authRoutes`
- Есть обработчик404 для неизвестных маршрутов.

### API (по README и маршрутам)
- `GET /api/catalog`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `POST /api/initialize`

В `POST /api/products` используется загрузка файлов через Multer (`uploadImages`) до передачи запроса в контроллер.

---

## Сборка, запуск и проверка

## Требования
- Node.js `^20.19.0 || >=22.12.0` (по корневому `package.json`)
- MongoDB
- npm

### Установка зависимостей

```sh
npm install
cd backend && npm install
```

### Переменные окружения backend

Создать файл `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/behoof
FRONTEND_URL=http://localhost:5173
```

### Запуск в режиме разработки

Frontend (из корня):
```sh
npm run dev
```

Backend (из `backend/`):
```sh
npm run dev
```

### Production-запуск

Frontend build (из корня):
```sh
npm run build
```

Frontend preview (из корня):
```sh
npm run preview
```

Backend start (из `backend/`):
```sh
npm start
```

### Линтинг и форматирование

Frontend (из корня):
```sh
npm run lint
npm run format
```

### Тесты

- Frontend: отдельной тестовой команды не обнаружено.
- Backend: `npm test` в текущем виде возвращает заглушку (`Error: no test specified`).

**TODO:** добавить реальные автоматические тесты (unit/integration/e2e) и стандартизировать команду проверки в CI.

---

## Правила разработки и стиль

Наблюдаемые правила в репозитории:

- Используется **ES modules** (`"type": "module"`).
- Базовый стиль форматирования (по `.editorconfig`):
 - отступ2 пробела;
 - UTF-8;
 - LF;
 - удаление хвостовых пробелов;
 - финальная новая строка;
 - целевая длина строки до100 символов.
- ESLint настроен через flat-config (`eslint.config.js`):
 - `@eslint/js` recommended;
 - `eslint-plugin-vue` (essential);
 - интеграция с Prettier (`@vue/eslint-config-prettier`).
- Для frontend принят алиас `@` → `./src` (см. `vite.config.js`).

Практические рекомендации для будущих изменений:

1. Сохранять текущую модульную структуру (views/components/api/router на frontend; routes/controllers/models на backend).
2. Для новых API-эндпоинтов придерживаться существующего подхода: маршрут → контроллер → модель.
3. Не смешивать бизнес-логику и транспортный слой: в маршрутах оставлять только композицию middleware/handlers.
4. Поддерживать единый стиль кодирования через `npm run lint` и `npm run format`.

---

## Важные файлы для быстрого входа

1. `README.md` — общий обзор, функциональность и базовые команды.
2. `package.json` (корень) — frontend-скрипты, версии и tooling.
3. `backend/package.json` — backend-скрипты и runtime-зависимости.
4. `backend/server.js` — запуск сервера, CORS, подключение маршрутов, MongoDB.
5. `backend/src/routes/catalogRoutes.js` — ключевые маршруты каталога и загрузка изображений.
6. `src/main.js` — инициализация frontend-приложения.
7. `src/router/index.js` — карта клиентских маршрутов.
8. `eslint.config.js` и `.editorconfig` — соглашения по качеству и форматированию кода.

---

## Операционные заметки

- Backend ожидает доступную MongoDB до полноценной работы API.
- CORS завязан на `FRONTEND_URL`; при смене порта/домена фронтенда необходимо обновлять переменную окружения.
- В проекте присутствуют разделы интерфейса в статусе «в разработке» (роуты-заглушки), что стоит учитывать при планировании задач.

---

## Рекомендации по развитию (кратко)

1. Добавить полноценные тесты для backend API и критических frontend-сценариев.
2. Зафиксировать workflow запуска обоих сервисов одной командой (например, через `concurrently` или Makefile).
3. Вынести и формализовать правила контрибуции в отдельный `CONTRIBUTING.md`.
4. Добавить базовый CI-пайплайн: lint + build + tests.
