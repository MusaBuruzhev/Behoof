import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Behoof API',
      version: '1.0.0',
      description: 'API для платформы сравнения цен и характеристик электроники',
      contact: {
        name: 'API Support',
        email: 'support@behoof.local',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Локальный сервер разработки',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin'] },
            phoneNumber: { type: 'string' },
            avatar: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            price: { type: 'number' },
            description: { type: 'string' },
            brand: { type: 'string' },
            categoryId: { type: 'string' },
            subcategoryId: { type: 'string' },
            modelId: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            characteristics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  trait: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
            priceHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string', format: 'date-time' },
                  price: { type: 'number' },
                },
              },
            },
            traitRatings: { type: 'object' },
            reviews: {
              type: 'array',
              items: { $ref: '#/components/schemas/Review' },
            },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            userName: { type: 'string' },
            userAvatar: { type: 'string' },
            text: { type: 'string' },
            traitRatings: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            productId: { type: 'string' },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled'],
            },
            pickupAt: { type: 'string', format: 'date-time' },
            contactPhone: { type: 'string' },
            comment: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            subcategoryIds: { type: 'array', items: { type: 'string' } },
            categoryTraits: { type: 'array', items: { type: 'string' } },
          },
        },
        Catalog: {
          type: 'object',
          properties: {
            categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
            subcategories: { type: 'object' },
            models: { type: 'object' },
            products: { type: 'object' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Эндпоинты аутентификации' },
      { name: 'Catalog', description: 'Каталог и товары' },
      { name: 'Products', description: 'Управление товарами' },
      { name: 'Orders', description: 'Заказы' },
      { name: 'Favorites', description: 'Избранное' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
