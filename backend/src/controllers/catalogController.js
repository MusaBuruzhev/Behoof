import { Category, Subcategory, Product } from '../models/index.js'
import { getNextId } from '../utils/idGenerator.js'
import { CATEGORY_TRAITS } from '../config/categoryTraits.js'

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
    const { name, price, brand, categoryId } = req.body

    if (!name || !price || !brand || !categoryId) {
      return res.status(400).json({
        error: 'Все поля обязательны: name, price, brand, categoryId',
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
      },
      subcategoryCreated: !subcategory.isNew,
      subcategoryId: subcategory.id,
      traitRatings: product.traitRatings,
    })
  } catch (error) {
    console.error('Ошибка добавления товара:', error)
    res.status(500).json({ error: 'Ошибка добавления товара' })
  }
}

export const initializeData = async (req, res) => {
  try {
    const existingCategories = await Category.countDocuments()

    if (existingCategories === 0) {
      const initialCategories = [
        { id: 'cat1', name: 'Смартфоны', subcategoryIds: [] },
        { id: 'cat2', name: 'Ноутбуки', subcategoryIds: [] },
        { id: 'cat3', name: 'Телевизоры', subcategoryIds: [] },
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
