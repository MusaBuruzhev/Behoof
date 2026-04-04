import Joi from 'joi';

// Схемы для валидации

// Регистрация
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Введите корректный email',
      'any.required': 'Email обязателен',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Пароль должен быть минимум 6 символов',
      'any.required': 'Пароль обязателен',
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Имя должно быть минимум 2 символа',
      'string.max': 'Имя не должно превышать 50 символов',
      'any.required': 'Имя обязательно',
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Фамилия должна быть минимум 2 символа',
      'string.max': 'Фамилия не должна превышать 50 символов',
      'any.required': 'Фамилия обязательна',
    }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{10,15}$/)
    .allow(null, ''),
});

// Вход
export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Введите корректный email',
      'any.required': 'Email обязателен',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Пароль обязателен',
    }),
});

// Товар
export const productSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Название должно быть минимум 3 символа',
      'string.max': 'Название не должно превышать 200 символов',
      'any.required': 'Название товара обязательно',
    }),
  price: Joi.number()
    .min(1)
    .required()
    .messages({
      'number.min': 'Цена должна быть больше 0',
      'any.required': 'Цена обязательна',
    }),
  brand: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Бренд должен быть минимум 2 символа',
      'string.max': 'Бренд не должен превышать 50 символов',
      'any.required': 'Бренд обязателен',
    }),
  model: Joi.string()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.max': 'Модель не должна превышать 50 символов',
      'any.required': 'Модель обязательна',
    }),
  categoryId: Joi.string()
    .required()
    .messages({
      'any.required': 'Категория обязательна',
    }),
  description: Joi.string()
    .max(5000)
    .allow('', null),
  // characteristics убираем из валидации - они приходят как JSON строка из FormData
});

// Обновление товара
export const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(200),
  price: Joi.number()
    .min(1),
  description: Joi.string()
    .max(5000)
    .allow('', null),
  characteristics: Joi.array().items(
    Joi.object({
      trait: Joi.string().required(),
      value: Joi.string().allow(''),
    })
  ),
  brand: Joi.string()
    .min(2)
    .max(50),
  images: Joi.array()
    .items(Joi.string())
    .min(3)
    .max(10),
});

// Отзыв
export const reviewSchema = Joi.object({
  text: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Введите текст отзыва',
      'string.max': 'Отзыв не должен превышать 2000 символов',
      'any.required': 'Текст отзыва обязателен',
    }),
  traitRatings: Joi.object().pattern(
    Joi.string(),
    Joi.number().min(1).max(5)
  ),
});

// Заказ
export const orderSchema = Joi.object({
  productId: Joi.string()
    .required()
    .messages({
      'any.required': 'ID товара обязателен',
    }),
  pickupAt: Joi.string()
    .required()
    .messages({
      'any.required': 'Дата самовывоза обязательна',
    }),
  contactPhone: Joi.string()
  .allow('', null),
  comment: Joi.string()
    .max(500)
    .allow('', null),
});

// Пагинация и фильтры
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  q: Joi.string().max(100).allow('', null),
  categoryId: Joi.string().allow('', null),
  subcategoryId: Joi.string().allow('', null),
  modelId: Joi.string().allow('', null),
  brand: Joi.string().allow('', null),
  priceMin: Joi.number().min(0).allow(null),
  priceMax: Joi.number().min(0).allow(null),
  sortBy: Joi.string()
    .valid('price-asc', 'price-desc', 'name-asc', 'name-desc', 'date-desc')
    .allow('', null),
});

// Мидлвар для обработки ошибок валидации
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Ошибка валидации',
        details: errors,
      });
    }

    req.body = value;
    next();
  };
};

// Валидация query-параметров
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Ошибка валидации параметров',
        details: errors,
      });
    }

    // Просто продолжаем - validated values будут использованы в контроллере
    next();
  };
};
