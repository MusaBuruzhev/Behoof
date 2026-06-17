import { Category, Subcategory, Product, Model } from '../models/index.js'
import CharacteristicGroup from '../models/CharacteristicGroup.js'
import CharacteristicValue from '../models/CharacteristicValue.js'
import { getNextId } from '../utils/idGenerator.js'
import { CATEGORY_TRAITS } from '../config/categoryTraits.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createNotification } from './notificationsController.js'
import User from '../models/User.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'public', 'uploads');
    console.log('Multer destination path:', uploadPath)
    if (!fs.existsSync(uploadPath)) {
      console.log('Creating uploads directory...')
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Multer filename:', filename)
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
    console.log('addProduct - req.body:', req.body)
    console.log('addProduct - req.files:', req.files)
    let { name, price, brand, model, modelId, categoryId, description, characteristics } = req.body

    // Преобразуем price в число если это строка
    if (typeof price === 'string') {
      price = parseFloat(price);
    }

    let parsedCharacteristics;
    try {
      console.log('Raw characteristics:', characteristics)
      parsedCharacteristics = characteristics ? JSON.parse(characteristics) : [];
      console.log('Parsed characteristics:', parsedCharacteristics)
    } catch (err) {
      console.error('Failed to parse characteristics:', err)
      return res.status(400).json({ error: 'Неверный формат характеристик' });
    }

    if (!name || !price || !brand || !categoryId) {
      return res.status(400).json({
        error: 'Все поля обязательны: name, price, brand, categoryId',
      })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Необходимо загрузить хотя бы одно изображение',
      })
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        error: 'Максимум 10 изображений',
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

    // Находим или создаём бренд как подкатегорию (для обратной совместимости)
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

    // Если modelId передан - используем его, иначе ищем/создаём по названию модели
    let finalModelId = modelId
    let modelDoc

    if (modelId) {
      modelDoc = await Model.findOne({ id: modelId })
    }

    if (!modelDoc && model) {
      modelDoc = await Model.findOne({
        name: model,
        brandId: subcategory.id,
      })
    }

    if (!modelDoc && model) {
      const newModelId = await getNextId('mod')
      modelDoc = new Model({
        id: newModelId,
        name: model,
        brandId: subcategory.id,
        categoryId: categoryId,
        productIds: [],
      })
      await modelDoc.save()
    }

    if (modelDoc) {
      finalModelId = modelDoc.id
    }

    // Автоматически создаём отсутствующие значения характеристик в справочнике
    const newValuesCreated = []
    for (const char of parsedCharacteristics) {
      const trait = char.trait || char.name
      const value = char.value || char.val
      
      // Ищем группу характеристик для этой категории
      const groups = await CharacteristicGroup.find({
        $or: [{ categoryId }, { categoryId: null }],
      }).sort({ sortOrder: 1 })
      
      let foundGroup = null
      for (const group of groups) {
        if (group.traitNames.includes(trait)) {
          foundGroup = group
          break
        }
      }
      
      if (foundGroup) {
        // Проверяем, есть ли уже такое значение
        const existingValue = await CharacteristicValue.findOne({
          groupId: foundGroup.id,
          traitName: trait,
          value: { $regex: new RegExp('^' + value + '$', 'i') }
        })
        
        if (!existingValue) {
          // Создаём новое значение в справочнике
          const newValue = new CharacteristicValue({
            id: await getNextId('cv'),
            groupId: foundGroup.id,
            traitName: trait,
            value: value.trim(),
            normalizedValue: value.trim().toLowerCase(),
            unit: '',
            sortOrder: 999,
          })
          await newValue.save()
          
          // Добавляем trait в traitNames группы, если его там нет
          if (!foundGroup.traitNames.includes(trait)) {
            foundGroup.traitNames.push(trait)
            await foundGroup.save()
          }
          
          newValuesCreated.push(`${trait}: ${value}`)
        }
      } else {
        // Группы нет — создаём новую группу для категории
        const newGroup = new CharacteristicGroup({
          id: await getNextId('cg'),
          name: `${trait} (${category.name})`,
          slug: trait.toLowerCase().replace(/\s+/g, '-'),
          description: '',
          categoryId: categoryId,
          traitNames: [trait],
          sortOrder: 999,
          isActive: true,
        })
        await newGroup.save()
        
        const newValue = new CharacteristicValue({
          id: await getNextId('cv'),
          groupId: newGroup.id,
          traitName: trait,
          value: value.trim(),
          normalizedValue: value.trim().toLowerCase(),
          unit: '',
          sortOrder: 0,
        })
        await newValue.save()
        
        newValuesCreated.push(`[Группа] ${trait}: ${value}`)
      }
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
      modelId: finalModelId || subcategory.id,
      traitRatings,
      images: imagePaths,
      reviews: [],
    })

    await product.save()

    if (modelDoc) {
      modelDoc.productIds.push(productId)
      await modelDoc.save()
    }

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

    // Отправляем уведомление о новом товаре всем пользователям
    try {
      const users = await User.find({ role: 'user' }).select('_id');
      for (const user of users) {
        await createNotification(
          user._id,
          'new_product',
          'Новый товар',
          `Поступил в продажу: ${name} за ${price} руб.`,
          productId,
          'product'
        );
      }
    } catch (notifyError) {
      console.error('Ошибка отправки уведомлений о новом товаре:', notifyError);
    }

    res.status(201).json({
      message: 'Товар успешно добавлен' + (newValuesCreated.length > 0 ? `. Создано значений в справочнике: ${newValuesCreated.join(', ')}` : ''),
      product: mapProductResponse(product),
      subcategoryCreated: !subcategory.isNew,
      subcategoryId: subcategory.id,
      newCharacteristicValues: newValuesCreated,
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

    const category = await Category.findOne({ id: product.categoryId })

    // Парсим characteristics если пришли как JSON строка (FormData)
    if (updates.characteristics && typeof updates.characteristics === 'string') {
      try {
        updates.characteristics = JSON.parse(updates.characteristics)
      } catch {
        // Оставляем как есть
      }
    }

    // Специальная обработка для цены - добавляем в историю если цена изменилась
    if (updates.price !== undefined && Number(updates.price) !== product.price) {
      product.priceHistory.push({ date: new Date(), price: Number(updates.price) })
    }

    // Автоматически создаём отсутствующие значения характеристик при обновлении
    if (updates.characteristics && Array.isArray(updates.characteristics)) {
      const newValuesCreated = []
      for (const char of updates.characteristics) {
        const trait = char.trait || char.name
        const value = char.value || char.val
        
        const groups = await CharacteristicGroup.find({
          $or: [{ categoryId: product.categoryId }, { categoryId: null }],
        }).sort({ sortOrder: 1 })
        
        let foundGroup = null
        for (const group of groups) {
          if (group.traitNames.includes(trait)) {
            foundGroup = group
            break
          }
        }
        
        if (foundGroup) {
          const existingValue = await CharacteristicValue.findOne({
            groupId: foundGroup.id,
            traitName: trait,
            value: { $regex: new RegExp('^' + value + '$', 'i') }
          })
          
          if (!existingValue) {
            const newValue = new CharacteristicValue({
              id: await getNextId('cv'),
              groupId: foundGroup.id,
              traitName: trait,
              value: value.trim(),
              normalizedValue: value.trim().toLowerCase(),
              unit: '',
              sortOrder: 999,
            })
            await newValue.save()
            
            if (!foundGroup.traitNames.includes(trait)) {
              foundGroup.traitNames.push(trait)
              await foundGroup.save()
            }
            
            newValuesCreated.push(`${trait}: ${value}`)
          }
        } else {
          const newGroup = new CharacteristicGroup({
            id: await getNextId('cg'),
            name: `${trait} (${category?.name || product.categoryId})`,
            slug: trait.toLowerCase().replace(/\s+/g, '-'),
            description: '',
            categoryId: product.categoryId,
            traitNames: [trait],
            sortOrder: 999,
            isActive: true,
          })
          await newGroup.save()
          
          const newValue = new CharacteristicValue({
            id: await getNextId('cv'),
            groupId: newGroup.id,
            traitName: trait,
            value: value.trim(),
            normalizedValue: value.trim().toLowerCase(),
            unit: '',
            sortOrder: 0,
          })
          await newValue.save()
          
          newValuesCreated.push(`[Группа] ${trait}: ${value}`)
        }
      }
      
      if (newValuesCreated.length > 0) {
        console.log('Новые значения характеристик при обновлении:', newValuesCreated)
      }
    }

    // Обновляем разрешенные поля
    const allowedFields = ['name', 'description', 'characteristics', 'brand', 'traitRatings']
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'characteristics') {
          product[field] = Array.isArray(updates[field]) ? updates[field] : [updates[field]]
        } else {
          product[field] = updates[field]
        }
      }
    })

    // Обработка новых изображений
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map(file => `/uploads/${file.filename}`)
      // Заменяем изображения полностью или добавляем
      const existingImages = product.images || []
      const totalImages = existingImages.length + newImagePaths.length
      if (totalImages > 10) {
        return res.status(400).json({ error: 'Максимум 10 изображений' })
      }
      product.images = [...existingImages, ...newImagePaths]
    }

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

export const getProductsByIds = async (req, res) => {
  try {
    const { ids } = req.body
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Необходимо передать массив ID товаров' })
    }
    
    const products = await Product.find({ id: { $in: ids } })
    
    const formattedProducts = products.map(product => {
      const currentPrice = product.priceHistory?.length > 0
        ? product.priceHistory.reduce((max, curr) => new Date(curr.date) > new Date(max.date) ? curr : max).price
        : 0
      return {
        ...mapProductResponse(product),
        price: currentPrice,
      }
    })
    
    res.json({ products: formattedProducts })
  } catch (error) {
    console.error('Ошибка получения товаров по ID:', error)
    res.status(500).json({ error: 'Ошибка получения товаров' })
  }
}

export const initializeData = async (req, res) => {
  try {
    // Очищаем существующие данные
    await Category.deleteMany({});
    await Subcategory.deleteMany({});
    await Model.deleteMany({});
    await Product.deleteMany({});
    await CharacteristicGroup.deleteMany({});
    await CharacteristicValue.deleteMany({});

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

    // ===== ГРУППЫ ХАРАКТЕРИСТИК ДЛЯ СМАРТФОНОВ (cat1) =====
    const phoneDisplayGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Дисплей (Смартфоны)',
      slug: 'display-smartphones',
      description: 'Характеристики экрана',
      categoryId: 'cat1',
      traitNames: ['Диагональ', 'Тип матрицы', 'Разрешение', 'Частота обновления'],
      sortOrder: 1,
      isActive: true,
    })
    await phoneDisplayGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Диагональ', value: '6.1"', unit: 'inch', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Диагональ', value: '6.7"', unit: 'inch', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Тип матрицы', value: 'OLED', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Тип матрицы', value: 'AMOLED', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Тип матрицы', value: 'IPS', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Разрешение', value: '2532x1170', unit: 'px', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Разрешение', value: '2796x1290', unit: 'px', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Частота обновления', value: '60 Гц', unit: 'Hz', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneDisplayGroup.id, traitName: 'Частота обновления', value: '120 Гц', unit: 'Hz', sortOrder: 2 },
    ])

    const phoneProcessorGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Производительность (Смартфоны)',
      slug: 'performance-smartphones',
      description: 'Процессор и память',
      categoryId: 'cat1',
      traitNames: ['Процессор', 'Оперативная память', 'Встроенная память'],
      sortOrder: 2,
      isActive: true,
    })
    await phoneProcessorGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Процессор', value: 'Apple A16 Bionic', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Процессор', value: 'Apple A17 Pro', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Процессор', value: 'Snapdragon 8 Gen 3', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Оперативная память', value: '6 ГБ', unit: 'GB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Оперативная память', value: '8 ГБ', unit: 'GB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Оперативная память', value: '12 ГБ', unit: 'GB', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Встроенная память', value: '128 ГБ', unit: 'GB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Встроенная память', value: '256 ГБ', unit: 'GB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneProcessorGroup.id, traitName: 'Встроенная память', value: '512 ГБ', unit: 'GB', sortOrder: 3 },
    ])

    const phoneCameraGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Камера (Смартфоны)',
      slug: 'camera-smartphones',
      description: 'Фото и видео возможности',
      categoryId: 'cat1',
      traitNames: ['Основная камера', 'Фронтальная камера', 'Видео'],
      sortOrder: 3,
      isActive: true,
    })
    await phoneCameraGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: phoneCameraGroup.id, traitName: 'Видео', value: '4K @ 60fps', sortOrder: 2, metadata: { comparisonOrder: 2 } },
      { id: await getNextId('cv'), groupId: phoneCameraGroup.id, traitName: 'Видео', value: '8K @ 30fps', sortOrder: 3, metadata: { comparisonOrder: 3 } },
      { id: await getNextId('cv'), groupId: phoneCameraGroup.id, traitName: 'Видео', value: '1080p @ 30fps', sortOrder: 1, metadata: { comparisonOrder: 1 } },
      { id: await getNextId('cv'), groupId: phoneCameraGroup.id, traitName: 'Видео', value: '1080p @ 60fps', sortOrder: 1, metadata: { comparisonOrder: 1 } },
      { id: await getNextId('cv'), groupId: phoneCameraGroup.id, traitName: 'Видео', value: '1080p @ 120fps', sortOrder: 2, metadata: { comparisonOrder: 2 } },
    ])

    const phoneBatteryGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Автономность (Смартфоны)',
      slug: 'battery-smartphones',
      description: 'Батарея и зарядка',
      categoryId: 'cat1',
      traitNames: ['Ёмкость батареи', 'Быстрая зарядка', 'Беспроводная зарядка'],
      sortOrder: 4,
      isActive: true,
    })
    await phoneBatteryGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Ёмкость батареи', value: '3200 мАч', unit: 'mAh', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Ёмкость батареи', value: '4500 мАч', unit: 'mAh', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Ёмкость батареи', value: '5000 мАч', unit: 'mAh', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Быстрая зарядка', value: 'Да', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Быстрая зарядка', value: 'Нет', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Беспроводная зарядка', value: 'Да', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: phoneBatteryGroup.id, traitName: 'Беспроводная зарядка', value: 'Нет', sortOrder: 2 },
    ])

    // ===== ГРУППЫ ХАРАКТЕРИСТИК ДЛЯ НОУТБУКОВ (cat2) =====
    const laptopDisplayGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Дисплей (Ноутбуки)',
      slug: 'display-laptops',
      description: 'Характеристики экрана',
      categoryId: 'cat2',
      traitNames: ['Диагональ', 'Тип матрицы', 'Разрешение', 'Частота обновления'],
      sortOrder: 1,
      isActive: true,
    })
    await laptopDisplayGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Диагональ', value: '13.6"', unit: 'inch', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Диагональ', value: '14.2"', unit: 'inch', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Диагональ', value: '15.6"', unit: 'inch', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Диагональ', value: '16.2"', unit: 'inch', sortOrder: 4 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Тип матрицы', value: 'IPS', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Тип матрицы', value: 'OLED', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Тип матрицы', value: 'Mini-LED', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Разрешение', value: '1920x1080', unit: 'px', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Разрешение', value: '2560x1600', unit: 'px', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Разрешение', value: '3456x2234', unit: 'px', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Частота обновления', value: '60 Гц', unit: 'Hz', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Частота обновления', value: '120 Гц', unit: 'Hz', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopDisplayGroup.id, traitName: 'Частота обновления', value: '144 Гц', unit: 'Hz', sortOrder: 3 },
    ])

    const laptopProcessorGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Производительность (Ноутбуки)',
      slug: 'performance-laptops',
      description: 'Процессор, память и накопитель',
      categoryId: 'cat2',
      traitNames: ['Процессор', 'Оперативная память', 'Накопитель'],
      sortOrder: 2,
      isActive: true,
    })
    await laptopProcessorGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Процессор', value: 'Apple M2', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Процессор', value: 'Apple M3', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Процессор', value: 'Intel Core i5-1335U', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Процессор', value: 'Intel Core i7-13700H', sortOrder: 4 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Процессор', value: 'AMD Ryzen 7 7735HS', sortOrder: 5 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Оперативная память', value: '8 ГБ', unit: 'GB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Оперативная память', value: '16 ГБ', unit: 'GB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Оперативная память', value: '32 ГБ', unit: 'GB', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Накопитель', value: '256 ГБ SSD', unit: 'GB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Накопитель', value: '512 ГБ SSD', unit: 'GB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopProcessorGroup.id, traitName: 'Накопитель', value: '1 ТБ SSD', unit: 'TB', sortOrder: 3 },
    ])

    const laptopGraphicsGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Графика (Ноутбуки)',
      slug: 'graphics-laptops',
      description: 'Видеокарта',
      categoryId: 'cat2',
      traitNames: ['Видеокарта'],
      sortOrder: 3,
      isActive: true,
    })
    await laptopGraphicsGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: laptopGraphicsGroup.id, traitName: 'Видеокарта', value: 'Интегрированная', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopGraphicsGroup.id, traitName: 'Видеокарта', value: 'NVIDIA GeForce RTX 3050', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopGraphicsGroup.id, traitName: 'Видеокарта', value: 'NVIDIA GeForce RTX 4050', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopGraphicsGroup.id, traitName: 'Видеокарта', value: 'NVIDIA GeForce RTX 4060', sortOrder: 4 },
    ])

    const laptopBatteryGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Автономность (Ноутбуки)',
      slug: 'battery-laptops',
      description: 'Батарея',
      categoryId: 'cat2',
      traitNames: ['Ёмкость батареи', 'Время работы'],
      sortOrder: 4,
      isActive: true,
    })
    await laptopBatteryGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: laptopBatteryGroup.id, traitName: 'Ёмкость батареи', value: '50 Вт⋅ч', unit: 'Wh', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopBatteryGroup.id, traitName: 'Ёмкость батареи', value: '70 Вт⋅ч', unit: 'Wh', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopBatteryGroup.id, traitName: 'Ёмкость батареи', value: '100 Вт⋅ч', unit: 'Wh', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: laptopBatteryGroup.id, traitName: 'Время работы', value: 'До 10 часов', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: laptopBatteryGroup.id, traitName: 'Время работы', value: 'До 15 часов', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: laptopBatteryGroup.id, traitName: 'Время работы', value: 'До 20 часов', sortOrder: 3 },
    ])

    // ===== ГРУППЫ ХАРАКТЕРИСТИК ДЛЯ НАУШНИКОВ (cat4) =====
    const headphonesTypeGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Конструкция (Наушники)',
      slug: 'construction-headphones',
      description: 'Тип и конструкция',
      categoryId: 'cat4',
      traitNames: ['Тип наушников', 'Конструкция'],
      sortOrder: 1,
      isActive: true,
    })
    await headphonesTypeGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: headphonesTypeGroup.id, traitName: 'Тип наушников', value: 'Внутриканальные', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesTypeGroup.id, traitName: 'Тип наушников', value: 'Полноразмерные', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: headphonesTypeGroup.id, traitName: 'Тип наушников', value: 'Накладные', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: headphonesTypeGroup.id, traitName: 'Конструкция', value: 'Закрытые', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesTypeGroup.id, traitName: 'Конструкция', value: 'Открытые', sortOrder: 2 },
    ])

    const headphonesSoundGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Звук (Наушники)',
      slug: 'sound-headphones',
      description: 'Акустические характеристики',
      categoryId: 'cat4',
      traitNames: ['Чувствительность', 'Импеданс', 'Частотный диапазон'],
      sortOrder: 2,
      isActive: true,
    })
    await headphonesSoundGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: headphonesSoundGroup.id, traitName: 'Чувствительность', value: '98 дБ', unit: 'dB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesSoundGroup.id, traitName: 'Чувствительность', value: '105 дБ', unit: 'dB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: headphonesSoundGroup.id, traitName: 'Импеданс', value: '16 Ом', unit: 'Ω', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesSoundGroup.id, traitName: 'Импеданс', value: '32 Ом', unit: 'Ω', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: headphonesSoundGroup.id, traitName: 'Частотный диапазон', value: '20-20000 Гц', unit: 'Hz', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesSoundGroup.id, traitName: 'Частотный диапазон', value: '10-40000 Гц', unit: 'Hz', sortOrder: 2 },
    ])

    const headphonesConnectivityGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Подключение (Наушники)',
      slug: 'connectivity-headphones',
      description: 'Тип подключения',
      categoryId: 'cat4',
      traitNames: ['Тип подключения', 'Bluetooth', 'Время работы'],
      sortOrder: 3,
      isActive: true,
    })
    await headphonesConnectivityGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Тип подключения', value: 'Проводные', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Тип подключения', value: 'Беспроводные', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Bluetooth', value: '5.0', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Bluetooth', value: '5.2', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Bluetooth', value: '5.3', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Время работы', value: 'До 20 часов', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Время работы', value: 'До 30 часов', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: headphonesConnectivityGroup.id, traitName: 'Время работы', value: 'До 40 часов', sortOrder: 3 },
    ])

    // ===== ГРУППЫ ХАРАКТЕРИСТИК ДЛЯ УМНЫХ ЧАСОВ (cat5) =====
    const watchDisplayGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Дисплей (Часы)',
      slug: 'display-watches',
      description: 'Характеристики экрана',
      categoryId: 'cat5',
      traitNames: ['Диагональ', 'Тип дисплея', 'Разрешение'],
      sortOrder: 1,
      isActive: true,
    })
    await watchDisplayGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Диагональ', value: '1.3"', unit: 'inch', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Диагональ', value: '1.9"', unit: 'inch', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Тип дисплея', value: 'AMOLED', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Тип дисплея', value: 'OLED', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Тип дисплея', value: 'IPS', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Разрешение', value: '396x484', unit: 'px', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchDisplayGroup.id, traitName: 'Разрешение', value: '484x396', unit: 'px', sortOrder: 2 },
    ])

    const watchFeaturesGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Функции (Часы)',
      slug: 'features-watches',
      description: 'Возможности и датчики',
      categoryId: 'cat5',
      traitNames: ['Пульсометр', 'GPS', 'NFC', 'Водозащита'],
      sortOrder: 2,
      isActive: true,
    })
    await watchFeaturesGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'Пульсометр', value: 'Да', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'Пульсометр', value: 'Нет', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'GPS', value: 'Да', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'GPS', value: 'Нет', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'NFC', value: 'Да', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'NFC', value: 'Нет', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'Водозащита', value: '5 ATM', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchFeaturesGroup.id, traitName: 'Водозащита', value: '10 ATM', sortOrder: 2 },
    ])

    const watchBatteryGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Автономность (Часы)',
      slug: 'battery-watches',
      description: 'Батарея',
      categoryId: 'cat5',
      traitNames: ['Время работы'],
      sortOrder: 3,
      isActive: true,
    })
    await watchBatteryGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: watchBatteryGroup.id, traitName: 'Время работы', value: 'До 1 дня', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: watchBatteryGroup.id, traitName: 'Время работы', value: 'До 3 дней', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: watchBatteryGroup.id, traitName: 'Время работы', value: 'До 7 дней', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: watchBatteryGroup.id, traitName: 'Время работы', value: 'До 14 дней', sortOrder: 4 },
    ])

    // ===== ГРУППЫ ХАРАКТЕРИСТИК ДЛЯ ПЛАНШЕТОВ (cat3) =====
    const tabletDisplayGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Дисплей (Планшеты)',
      slug: 'display-tablets',
      description: 'Характеристики экрана',
      categoryId: 'cat3',
      traitNames: ['Диагональ', 'Тип матрицы', 'Разрешение'],
      sortOrder: 1,
      isActive: true,
    })
    await tabletDisplayGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Диагональ', value: '10.2"', unit: 'inch', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Диагональ', value: '11"', unit: 'inch', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Диагональ', value: '12.9"', unit: 'inch', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Тип матрицы', value: 'IPS', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Тип матрицы', value: 'OLED', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Тип матрицы', value: 'Mini-LED', sortOrder: 3 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Разрешение', value: '2160x1620', unit: 'px', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Разрешение', value: '2732x2048', unit: 'px', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: tabletDisplayGroup.id, traitName: 'Разрешение', value: '2868x2152', unit: 'px', sortOrder: 3 },
    ])

    const tabletPerformanceGroup = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: 'Производительность (Планшеты)',
      slug: 'performance-tablets',
      description: 'Процессор и память',
      categoryId: 'cat3',
      traitNames: ['Процессор', 'Оперативная память', 'Встроенная память'],
      sortOrder: 2,
      isActive: true,
    })
    await tabletPerformanceGroup.save()

    await CharacteristicValue.insertMany([
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Процессор', value: 'Apple M2', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Процессор', value: 'Snapdragon 8 Gen 1', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Оперативная память', value: '6 ГБ', unit: 'GB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Оперативная память', value: '8 ГБ', unit: 'GB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Встроенная память', value: '128 ГБ', unit: 'GB', sortOrder: 1 },
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Встроенная память', value: '256 ГБ', unit: 'GB', sortOrder: 2 },
      { id: await getNextId('cv'), groupId: tabletPerformanceGroup.id, traitName: 'Встроенная память', value: '512 ГБ', unit: 'GB', sortOrder: 3 },
    ])

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
          brandId: subcategory.id,
          categoryId: 'cat1',
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
          brandId: subcategory.id,
          categoryId: 'cat2',
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

    res.json({ 
      message: 'Начальные данные инициализированы',
      details: 'Созданы категории, бренды, модели, группы характеристик и значения'
    })
  } catch (error) {
    console.error('Ошибка инициализации данных:', error)
    res.status(500).json({ error: 'Ошибка инициализации данных' })
  }
}
