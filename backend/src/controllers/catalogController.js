import { Category, Subcategory, Product } from '../models/index.js'
import { getNextId } from '../utils/idGenerator.js'
import { CATEGORY_TRAITS } from '../config/categoryTraits.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', '..', 'public', 'uploads');
    console.log('Upload destination:', uploadPath);

    // Создаем папку, если она не существует
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    console.log('File validation:', { extname, mimetype, type: file.mimetype });

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Разрешены только изображения JPEG, PNG, WebP'));
    }
  }
});

export const uploadImages = upload.array('images', 10);

export const getCatalog = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ id: 1 })

    const subcategoriesArray = await Subcategory.find({}).sort({ id: 1 })

    const subcategories = {}
    subcategoriesArray.forEach((sub) => {
      subcategories[sub.id] = {
        id: sub.id,
        name: sub.name,
        productIds: sub.productIds || [],
      }
    })

    const productsArray = await Product.find({}).sort({ id: 1 })

    const products = {}
    productsArray.forEach((product) => {
      products[product.id] = {
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        traitRatings: product.traitRatings,
        images: product.images || [],
      }
    })

    res.json({
      categories,
      subcategories,
      products,
    })
  } catch (error) {
    console.error('Ошибка получения каталога:', error)
    res.status(500).json({ error: 'Ошибка получения каталога' })
  }
}

export const addProduct = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);

    const { name, price, brand, categoryId } = req.body

    if (!name || !price || !brand || !categoryId) {
      return res.status(400).json({
        error: 'Все поля обязательны: name, price, brand, categoryId',
      })
    }

    // Проверяем количество загруженных файлов
    if (!req.files || req.files.length < 3 || req.files.length > 10) {
      console.log('Files validation failed:', { files: req.files, length: req.files?.length });
      return res.status(400).json({
        error: 'Необходимо загрузить от 3 до 10 изображений',
      })
    }

    const category = await Category.findOne({ id: categoryId })
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' })
    }

    const traits = CATEGORY_TRAITS[categoryId] || []
    const traitRatings = {}
    traits.forEach((trait) => {
      traitRatings[trait] = 3
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

    const product = new Product({
      id: productId,
      name,
      price: Number(price),
      brand,
      categoryId,
      subcategoryId: subcategory.id,
      traitRatings,
      images: imagePaths,
    })

    await product.save()

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
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        images: product.images,
        traitRatings: product.traitRatings,
      },
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

    res.json({
      id: product.id,
      name: product.name,
      price: product.price,
      brand: product.brand,
      categoryId: product.categoryId,
      subcategoryId: product.subcategoryId,
      traitRatings: product.traitRatings,
      images: product.images,
    })
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

    // Обновляем только разрешенные поля
    const allowedFields = ['name', 'price', 'brand', 'traitRatings', 'images']
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        product[field] = updates[field]
      }
    })

    await product.save()

    res.json({
      message: 'Товар успешно обновлен',
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        brand: product.brand,
        traitRatings: product.traitRatings,
        images: product.images,
      }
    })
  } catch (error) {
    console.error('Ошибка обновления товара:', error)
    res.status(500).json({ error: 'Ошибка обновления товара' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const product = await Product.findOne({ id })
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' })
    }

    // Удаляем товар из подкатегорий
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
    const existingCategories = await Category.countDocuments()

    if (existingCategories === 0) {
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

      for (const cat of initialCategories) {
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
    } else {
      res.json({ message: 'Данные уже существуют' })
    }
  } catch (error) {
    console.error('Ошибка инициализации данных:', error)
    res.status(500).json({ error: 'Ошибка инициализации данных' })
  }
}
