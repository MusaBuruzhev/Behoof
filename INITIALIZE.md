# Скрипт инициализации Behoof

## 1. Очистить базу данных
```bash
mongosh --eval "use behoof; db.dropDatabase()"
```

## 2. Запустить backend
```bash
cd backend
node server.js
```

## 3. Создать админа через API

### Вариант A: Через curl
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@behoof.com\",\"password\":\"admin123\",\"firstName\":\"Admin\",\"lastName\":\"User\",\"role\":\"admin\"}"
```

### Вариант B: Через MongoDB
```bash
mongosh
use behoof
db.users.insertOne({
  email: "admin@behoof.com",
  password: "$2b$10$YourHashedPasswordHere",
  firstName: "Admin",
  lastName: "User",
  role: "admin",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 4. Инициализировать данные через API
```bash
curl -X POST http://localhost:5000/api/initialize ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## 5. Войти под админом
- Email: `admin@behoof.com`
- Password: `admin123`

## 6. Проверить админку
Открыть `http://localhost:5173/admin/dashboard`
