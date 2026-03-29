import { Category, Subcategory, Product, Model } from '../models/index.js'
import { getNextId } from '../utils/idGenerator.js'
import { CATEGORY_TRAITS } from '../config/categoryTraits.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения JPEG, PNG, WebP'));
    }
  }
});

export const uploadImages = upload.array('images', 10);

const DEFAULT_TRAIT_RATING = 3;

const getTraitValue = (traitRatings, trait) => {
  if (!traitRatings) return undefined;
  if (typeof traitRatings.get === 'function') {
    return traitRatings.get(trait);
  }
  return traitRatings[trait];
};

const recalculateTraitRatings = (product) => {
  const categoryTraits = CATEGORY_TRAITS[product.categoryId] || [];
  const recalculatedRatings = {};

  categoryTraits.forEach((trait) => {
    let sum = 0;
    let count = 0;

    (product.reviews || []).forEach((review) => {
      const rawValue = getTraitValue(review.traitRatings, trait);
      const value = Number(rawValue);

      if (Number.isFinite(value) && value >= 1 && value <= 5) {
        sum += value;
        count += 1;
      }
    });

    const average = count > 0
      ? (DEFAULT_TRAIT_RATING + sum) / (count + 1)
      : DEFAULT_TRAIT_RATING;

    recalculatedRatings[trait] = Math.round(average * 10) / 10;
  });

  product.traitRatings = recalculatedRatings;
};

const mapReview = (review) => ({
  id: review._id,
  userId: review.userId,
  userName: review.userName,
  userAvatar: review.userAvatar,
  text: review.text,
  traitRatings: review.traitRatings || {},
  createdAt: review.createdAt,
});

const buildDisplayName = (user) => {
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
  return fullName || user.email || 'Пользователь';
};

const isReviewOwner = (review, user) => String(review.userId) === String(user._id);

const normalizeReviewTraitRatings = (rawTraitRatings, categoryTraits) => {
  if (!rawTraitRatings || typeof rawTraitRatings !== 'object') {
    return {};
  }

  const normalized = {};

  for (const [trait, rawValue] of Object.entries(rawTraitRatings)) {
    if (!categoryTraits.includes(trait)) {
      const error = new Error(`Характеристика "${trait}" недоступна для категории`);
      error.statusCode = 400;
      throw error;
    }

    const value = Number(rawValue);
    const roundedValue = Math.round(value);

    if (!Number.isFinite(value) || roundedValue < 1 || roundedValue > 5) {
      const error = new Error(`Оценка для "${trait}" должна быть от 1 до 5`);
      error.statusCode = 400;
      throw error;
    }

    normalized[trait] = roundedValue;
  }

  return normalized;
};

const mapProductResponse = (product) => ({
  id: product.id,
  name: product.name,
  price: product.price,
  description: product.description,
  characteristics: product.characteristics,
  priceHistory: product.priceHistory,
  brand: product.brand,
  categoryId: product.categoryId,
  subcategoryId: product.subcategoryId,
  modelId: product.modelId,
  traitRatings: product.traitRatings,
  images: product.images,
  reviews: (product.reviews || []).map(mapReview),
});

const handleControllerError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message || fallbackMessage });
};

export const getCatalog = async (req, res) => {
  try {
    const categoriesArray = await Category.find({}).sort({ id: 1 })

    const categories = categoriesArray.map(cat => ({
      ...cat.toObject(),
      categoryTraits: CATEGORY_TRAITS[cat.id] || []
    }));

    const subcategoriesArray = await Subcategory.find({}).sort({ id: 1 })

    const subcategories = {}
    subcategoriesArray.forEach((sub) => {
      subcategories[sub.id] = {
        id: sub.id,
        name: sub.name,
        categoryId: sub.categoryId,
        productIds: sub.productIds || [],
      }
    })

    const modelsArray = await Model.find({}).sort({ id: 1 })

    const models = {}
    modelsArray.forEach((model) => {
      models[model.id] = {
        id: model.id,
        name: model.name,
        subcategoryId: model.subcategoryId,
        productIds: model.productIds || [],
      }
    })

    const productsArray = await Product.find({}).sort({ id: 1 })

    const products = {}
    productsArray.forEach((product) => {
      products[product.id] = mapProductResponse(product)
    })

    res.json({
      categories,
      subcategories,
      models,
      products,
    })
  } catch (error) {
    console.error('Ошибка получения каталога:', error)
    res.status(500).json({ error: 'Ошибка получения каталога' })
  }
}

export const getProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, parseInt(req.query.limit) || 20)
    const q = req.query.q ? String(req.query.q).trim() : null
    const { categoryId, subcategoryId, modelId, sortBy, priceMin, priceMax, brand } = req.query

    // Сначала получаем все товары без фильтрации по цене
    let baseFilter = {}
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      baseFilter.$or = [
        { name: re },
        { brand: re },
        { description: re },
      ]
    }
    if (categoryId) baseFilter.categoryId = categoryId
    if (subcategoryId) baseFilter.subcategoryId = subcategoryId
    if (modelId) baseFilter.modelId = modelId

    // Фильтр по бренду
    if (brand) {
      const brands = brand.split(',').map(b => b.trim())
      baseFilter.brand = { $in: brands }
    }

    console.log('Base filter:', baseFilter)

    // Получаем товары с базовым фильтром
    let productsArray = await Product.find(baseFilter).lean()

    // Фильтрация по цене (так как price - виртуальное поле)
    if (priceMin !== undefined && priceMin !== null && priceMin !== '') {
      const minPrice = parseFloat(priceMin)
      productsArray = productsArray.filter(p => {
        const currentPrice = p.priceHistory?.length > 0
          ? p.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price
          : 0
        return currentPrice >= minPrice
      })
    }
    if (priceMax !== undefined && priceMax !== null && priceMax !== '') {
      const maxPrice = parseFloat(priceMax)
      productsArray = productsArray.filter(p => {
        const currentPrice = p.priceHistory?.length > 0
          ? p.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price
          : 0
        return currentPrice <= maxPrice
      })
    }

    // Сортировка
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          productsArray.sort((a, b) => {
            const priceA = a.priceHistory?.length > 0 ? a.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price : 0
            const priceB = b.priceHistory?.length > 0 ? b.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price : 0
            return priceA - priceB
          })
          break
        case 'price-desc':
          productsArray.sort((a, b) => {
            const priceA = a.priceHistory?.length > 0 ? a.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price : 0
            const priceB = b.priceHistory?.length > 0 ? b.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price : 0
            return priceB - priceA
          })
          break
        case 'name-asc':
          productsArray.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'name-desc':
          productsArray.sort((a, b) => b.name.localeCompare(a.name))
          break
        case 'date-desc':
          productsArray.sort((a, b) => b.id.localeCompare(a.id))
          break
      }
    } else {
      productsArray.sort((a, b) => a.id.localeCompare(b.id))
    }

    const total = productsArray.length
    const skip = (page - 1) * limit
    const paginatedProducts = productsArray.slice(skip, skip + limit)

    const products = paginatedProducts.map((product) => {
      const currentPrice = product.priceHistory?.length > 0
        ? product.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price
        : 0
      return {
        ...mapProductResponse(product),
        price: currentPrice,
      }
    })

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    })
  } catch (error) {
    console.error('Ошибка получения списка товаров:', error)
    res.status(500).json({ error: 'Ошибка получения списка товаров' })
  }
}

export const addProduct = async (req, res) => {
  try {
    const { name, price, brand, model, categoryId, description, characteristics } = req.body

    let parsedCharacteristics;
    try {
      parsedCharacteristics = characteristics ? JSON.parse(characteristics) : [];
    } catch {
      return res.status(400).json({ error: 'Неверный формат характеристик' });
    }

    if (!name || !price || !brand || !model || !categoryId) {
      return res.status(400).json({
        error: 'Все поля обязательны: name, price, brand, model, categoryId',
      })
    }

    if (!req.files || req.files.length < 3 || req.files.length > 10) {
      return res.status(400).json({
        error: 'Необходимо загрузить от 3 до 10 изображений',
      })
    }

    const category = await Category.findOne({ id: categoryId })
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' })
    }

    const categoryTraits = CATEGORY_TRAITS[categoryId] || []
    const traitRatings = {}
    categoryTraits.forEach((trait) => {
      traitRatings[trait] = DEFAULT_TRAIT_RATING
    })

    const productId = await getNextId('p')

    // Сохраняем пути к загруженным файлам
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`)

    let subcategory = await Subcategory.findOne({
      name: brand,
      categoryId: categoryId,
    })

    if (!subcategory) {
      const subcategoryId = await getNextId('sub')

      subcategory = new Subcategory({
        id: subcategoryId,
        name: brand,
        categoryId: categoryId,
        productIds: [],
      })

      await subcategory.save()

      category.subcategoryIds.push(subcategoryId)
      await category.save()
    }

    let modelDoc = await Model.findOne({
      name: model,
      subcategoryId: subcategory.id,
    })

    if (!modelDoc) {
      const modelId = await getNextId('mod')

      modelDoc = new Model({
        id: modelId,
        name: model,
        subcategoryId: subcategory.id,
        productIds: [],
      })

      await modelDoc.save()
    }

    const product = new Product({
      id: productId,
      name,
      priceHistory: [{ date: new Date(), price: Number(price) }],
      description: description || '',
      characteristics: parsedCharacteristics,
      brand,
      categoryId,
      subcategoryId: subcategory.id,
      modelId: modelDoc.id,
      traitRatings,
      images: imagePaths,
      reviews: [],
    })

    await product.save()

    modelDoc.productIds.push(productId)
    await modelDoc.save()

    subcategory.productIds.push(productId)
    await subcategory.save()

    const allSubcategoryName = `Все ${category.name}`
    let allSubcategory = await Subcategory.findOne({
      name: allSubcategoryName,
      categoryId: categoryId,
      isAllCategory: true,
    })

    if (allSubcategory) {
      allSubcategory.productIds.push(productId)
      await allSubcategory.save()
    }

    res.status(201).json({
      message: 'Товар успешно добавлен',
      product: mapProductResponse(product),
      subcategoryCreated: !subcategory.isNew,
      subcategoryId: subcategory.id,
    })
  } catch (error) {
    console.error('Ошибка добавления товара:', error)
    res.status(500).json({ error: 'Ошибка добавления товара' })
  }
}

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findOne({ id })

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    res.json(mapProductResponse(product))
  } catch (error) {
    console.error('Ошибка получения товара:', error)
    res.status(500).json({ error: 'Ошибка получения товара' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    const product = await Product.findOne({ id })
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    // Специальная обработка для цены - добавляем в историю если цена изменилась
    if (updates.price !== undefined && Number(updates.price) !== product.price) {
      product.priceHistory.push({ date: new Date(), price: Number(updates.price) })
    }

    // Обновляем разрешенные поля
    const allowedFields = ['name', 'description', 'characteristics', 'brand', 'traitRatings', 'images']
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'characteristics') {
          product[field] = Array.isArray(updates[field]) ? updates[field] : [updates[field]]
        } else {
          product[field] = updates[field]
        }
      }
    })

    await product.save()

    res.json({
      message: 'Товар успешно обновлен',
      product: mapProductResponse(product),
    })
  } catch (error) {
    console.error('Ошибка обновления товара:', error)
    res.status(500).json({ error: 'Ошибка обновления товара' })
  }
}

export const addReview = async (req, res) => {
  try {
    const { id } = req.params
    const { text, traitRatings } = req.body

    const normalizedText = typeof text === 'string' ? text.trim() : ''
    if (!normalizedText) {
      return res.status(400).json({ error: 'Текст отзыва обязателен' })
    }

    if (normalizedText.length > 2000) {
      return res.status(400).json({ error: 'Текст отзыва слишком длинный (максимум 2000 символов)' })
    }

    const product = await Product.findOne({ id })
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    const categoryTraits = CATEGORY_TRAITS[product.categoryId] || []
    const normalizedTraitRatings = normalizeReviewTraitRatings(traitRatings, categoryTraits)

    const existingReview = (product.reviews || []).find((review) => isReviewOwner(review, req.user))

    if (existingReview) {
      existingReview.userName = buildDisplayName(req.user)
      existingReview.userAvatar = req.user.avatar || null
      existingReview.text = normalizedText
      existingReview.traitRatings = normalizedTraitRatings
      existingReview.createdAt = new Date()
    } else {
      product.reviews.push({
        userId: String(req.user._id),
        userName: buildDisplayName(req.user),
        userAvatar: req.user.avatar || null,
        text: normalizedText,
        traitRatings: normalizedTraitRatings,
        createdAt: new Date(),
      })
    }

    recalculateTraitRatings(product)
    await product.save()

    const actualReview = (product.reviews || []).find((review) => isReviewOwner(review, req.user))

    res.status(existingReview ? 200 : 201).json({
      message: existingReview ? 'Отзыв успешно обновлён' : 'Отзыв успешно добавлен',
      review: actualReview ? mapReview(actualReview) : null,
      traitRatings: product.traitRatings,
      reviewsCount: product.reviews.length,
      isUpdated: Boolean(existingReview),
    })
  } catch (error) {
    handleControllerError(res, error, 'Ошибка добавления отзыва')
  }
}

export const deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params

    const product = await Product.findOne({ id })
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    const review = product.reviews.id(reviewId)
    if (!review) {
      return res.status(404).json({ error: 'Отзыв не найден' })
    }

    const isOwner = String(review.userId) === String(req.user._id)
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Можно удалять только свои отзывы' })
    }

    review.deleteOne()
    recalculateTraitRatings(product)
    await product.save()

    res.json({
      message: 'Отзыв удалён',
      traitRatings: product.traitRatings,
      reviewsCount: product.reviews.length,
    })
  } catch (error) {
    handleControllerError(res, error, 'Ошибка удаления отзыва')
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findOne({ id })
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    // Удаляем товар из моделей и подкатегорий
    await Model.updateMany(
      { productIds: id },
      { $pull: { productIds: id } }
    )

    await Subcategory.updateMany(
      { productIds: id },
      { $pull: { productIds: id } }
    )

    // Удаляем товар
    await Product.deleteOne({ id })

    res.json({ message: 'Товар успешно удален' })
  } catch (error) {
    console.error('Ошибка удаления товара:', error)
    res.status(500).json({ error: 'Ошибка удаления товара' })
  }
}

export const initializeData = async (req, res) => {
  try {
    // Очищаем существующие данные
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await Model.deleteMany({});
    await Product.deleteMany({});

    console.log('Initializing data...');
    const initialCategories = [
      { id: 'cat1', name: 'Смартфоны', subcategoryIds: [] },
      { id: 'cat2', name: 'Ноутбуки', subcategoryIds: [] },
      { id: 'cat3', name: 'Планшеты', subcategoryIds: [] },
      { id: 'cat4', name: 'Наушники', subcategoryIds: [] },
      { id: 'cat5', name: 'Умные часы', subcategoryIds: [] },
      { id: 'cat6', name: 'Игровые приставки', subcategoryIds: [] },
      { id: 'cat7', name: 'Портативные колонки', subcategoryIds: [] },
      { id: 'cat8', name: 'Аксессуары', subcategoryIds: [] },
    ]

    await Category.insertMany(initialCategories)

    // Инициализация брендов и моделей для смартфонов
    const phoneBrands = [
      { name: 'Apple', models: ['iPhone 13', 'iPhone 14', 'iPhone 15', 'iPhone 16'] },
      { name: 'Samsung', models: ['Galaxy S23', 'Galaxy S24', 'Galaxy A54', 'Galaxy A55'] },
      { name: 'Xiaomi', models: ['Redmi Note 12', 'Redmi Note 13', 'Poco X5', 'Poco X6'] },
      { name: 'Google', models: ['Pixel 7', 'Pixel 8', 'Pixel 9'] },
    ]

    for (const brandData of phoneBrands) {
      const subcategory = new Subcategory({
        id: await getNextId('sub'),
        name: brandData.name,
        categoryId: 'cat1',
        productIds: [],
      })
      await subcategory.save()

      for (const modelName of brandData.models) {
        const model = new Model({
          id: await getNextId('mod'),
          name: modelName,
          subcategoryId: subcategory.id,
          productIds: [],
        })
        await model.save()
      }

      await Category.findOneAndUpdate(
        { id: 'cat1' },
        { $push: { subcategoryIds: subcategory.id } },
      )
    }

    // Инициализация брендов и моделей для ноутбуков
    const laptopBrands = [
      { name: 'Apple', models: ['MacBook Air M2', 'MacBook Pro M3', 'MacBook Air M3'] },
      { name: 'Dell', models: ['XPS 13', 'XPS 15', 'Inspiron 15'] },
      { name: 'HP', models: ['Pavilion 15', 'Envy 13', 'Spectre x360'] },
      { name: 'Lenovo', models: ['ThinkPad X1', 'Yoga 9', 'IdeaPad 5'] },
    ]

    for (const brandData of laptopBrands) {
      const subcategory = new Subcategory({
        id: await getNextId('sub'),
        name: brandData.name,
        categoryId: 'cat2',
        productIds: [],
      })
      await subcategory.save()

      for (const modelName of brandData.models) {
        const model = new Model({
          id: await getNextId('mod'),
          name: modelName,
          subcategoryId: subcategory.id,
          productIds: [],
        })
        await model.save()
      }

      await Category.findOneAndUpdate(
        { id: 'cat2' },
        { $push: { subcategoryIds: subcategory.id } },
      )
    }

    // Аналогично для других категорий, но для краткости добавим только "Все" подкатегории
    for (const cat of initialCategories.slice(2)) {
      const allSubcategory = new Subcategory({
        id: await getNextId('sub'),
        name: `Все ${cat.name}`,
        categoryId: cat.id,
        productIds: [],
        isAllCategory: true,
      })

      await allSubcategory.save()

      await Category.findOneAndUpdate(
        { id: cat.id },
        { $push: { subcategoryIds: allSubcategory.id } },
      )
    }

    res.json({ message: 'Начальные данные инициализированы' })
  } catch (error) {
    console.error('Ошибка инициализации данных:', error)
    res.status(500).json({ error: 'Ошибка инициализации данных' })
  }
}
