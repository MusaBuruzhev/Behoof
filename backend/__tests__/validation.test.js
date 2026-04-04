import {
  registerSchema,
  loginSchema,
  productSchema,
  reviewSchema,
  orderSchema,
  paginationSchema,
} from '../src/utils/validation.js';

describe('Валидация - registerSchema', () => {
  test('валидные данные - успех', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Иван',
      lastName: 'Петров',
    };
    const { error } = registerSchema.validate(data);
    expect(error).toBeUndefined();
  });

  test('невалидный email - ошибка', () => {
    const data = {
      email: 'not-an-email',
      password: 'password123',
      firstName: 'Иван',
      lastName: 'Петров',
    };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('короткий пароль - ошибка', () => {
    const data = {
      email: 'test@example.com',
      password: '123',
      firstName: 'Иван',
      lastName: 'Петров',
    };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('отсутствует обязательное поле - ошибка', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    };
    const { error } = registerSchema.validate(data);
    expect(error).toBeDefined();
  });

  test('валидация телефона - допустим null', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Иван',
      lastName: 'Петров',
      phoneNumber: null,
    };
    const { error } = registerSchema.validate(data);
    expect(error).toBeUndefined();
  });
});

describe('Валидация - loginSchema', () => {
  test('валидные данные - успех', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    };
    const error = loginSchema.validate(data).error;
    expect(error).toBeUndefined();
  });

  test('невалидный email - ошибка', () => {
    const data = {
      email: 'invalid',
      password: 'password123',
    };
    const error = loginSchema.validate(data).error;
    expect(error).toBeDefined();
  });
});

describe('Валидация - productSchema', () => {
  test('валидные данные товара - успех', () => {
    const data = {
      name: 'iPhone 15 Pro',
      price: 99999,
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      categoryId: 'cat1',
    };
    const error = productSchema.validate(data).error;
    expect(error).toBeUndefined();
  });

  test('слишком короткое название - ошибка', () => {
    const data = {
      name: 'AB',
      price: 99999,
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      categoryId: 'cat1',
    };
    const error = productSchema.validate(data).error;
    expect(error).toBeDefined();
  });

  test('отрицательная цена - ошибка', () => {
    const data = {
      name: 'iPhone 15 Pro',
      price: -100,
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      categoryId: 'cat1',
    };
    const error = productSchema.validate(data).error;
    expect(error).toBeDefined();
  });

  test('характеристики - успех', () => {
    const data = {
      name: 'iPhone 15 Pro',
      price: 99999,
      brand: 'Apple',
      model: 'iPhone 15 Pro',
      categoryId: 'cat1',
      characteristics: [
        { trait: 'Экран', value: '6.1 дюйма' },
        { trait: 'Память', value: '256GB' },
      ],
    };
    const error = productSchema.validate(data).error;
    expect(error).toBeUndefined();
  });
});

describe('Валидация - reviewSchema', () => {
  test('валидный отзыв - успех', () => {
    const data = {
      text: 'Отличный товар! Рекомендую всем.',
      traitRatings: {
        'Качество экрана': 5,
        'Камера': 4,
      },
    };
    const error = reviewSchema.validate(data).error;
    expect(error).toBeUndefined();
  });

  test('слишком короткий отзыв - ошибка', () => {
    const data = {
      text: 'Хорошо',
    };
    const error = reviewSchema.validate(data).error;
    expect(error).toBeDefined();
  });

  test('слишком длинный отзыв - ошибка', () => {
    const data = {
      text: 'A'.repeat(2001),
    };
    const error = reviewSchema.validate(data).error;
    expect(error).toBeDefined();
  });
});

describe('Валидация - orderSchema', () => {
  test('валидный заказ - успех', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);

    const data = {
      productId: 'p1',
      pickupAt: futureDate.toISOString(),
      contactPhone: '+79001234567',
      comment: 'Хочу самовывоз',
    };
    const error = orderSchema.validate(data).error;
    expect(error).toBeUndefined();
  });

  test('прошедшая дата - ошибка', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    const data = {
      productId: 'p1',
      pickupAt: pastDate.toISOString(),
    };
    const error = orderSchema.validate(data).error;
    expect(error).toBeDefined();
  });
});

describe('Валидация - paginationSchema', () => {
  test('дефолтные значения', () => {
    const data = {};
    const { value } = paginationSchema.validate(data);
    expect(value.page).toBe(1);
    expect(value.limit).toBe(20);
  });

  test('кастомные значения', () => {
    const data = { page: 3, limit: 50 };
    const { value } = paginationSchema.validate(data);
    expect(value.page).toBe(3);
    expect(value.limit).toBe(50);
  });

  test('невалидная страница - ошибка', () => {
    const data = { page: -1 };
    const error = paginationSchema.validate(data).error;
    expect(error).toBeDefined();
  });

  test('фильтры - успех', () => {
    const data = {
      q: 'iphone',
      categoryId: 'cat1',
      brand: 'Apple',
      priceMin: 10000,
      priceMax: 100000,
      sortBy: 'price-asc',
    };
    const error = paginationSchema.validate(data).error;
    expect(error).toBeUndefined();
  });
});

