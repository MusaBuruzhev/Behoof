import CharacteristicGroup from '../models/CharacteristicGroup.js'
import CharacteristicValue from '../models/CharacteristicValue.js'
import { getNextId } from '../utils/idGenerator.js'

// ===== ГРУППЫ ХАРАКТЕРИСТИК =====

export const getGroups = async (req, res) => {
  try {
    const { categoryId } = req.query
    const filter = { isActive: true }
    if (categoryId) {
      filter.$or = [{ categoryId }, { categoryId: null }]
    }
    const groups = await CharacteristicGroup.find(filter).sort({ sortOrder: 1, name: 1 })
    res.json({ groups })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения групп характеристик' })
  }
}

export const createGroup = async (req, res) => {
  try {
    const { name, slug, description, traitNames, categoryId } = req.body

    if (!name || !traitNames || !Array.isArray(traitNames) || traitNames.length === 0) {
      return res.status(400).json({ error: 'Название и список характеристик обязательны' })
    }

    const existing = await CharacteristicGroup.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
    if (existing) {
      return res.status(409).json({ error: 'Группа с таким названием уже существует' })
    }

    const group = new CharacteristicGroup({
      id: await getNextId('cg'),
      name: name.trim(),
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: description || '',
      traitNames,
      categoryId: categoryId || null,
      sortOrder: req.body.sortOrder || 0,
    })

    await group.save()
    res.status(201).json({ message: 'Группа создана', group })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка создания группы' })
  }
}

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params
    const group = await CharacteristicGroup.findOne({ id })
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' })
    }

    const allowedFields = ['name', 'description', 'traitNames', 'categoryId', 'sortOrder', 'isActive']
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        group[field] = req.body[field]
      }
    })

    await group.save()
    res.json({ message: 'Группа обновлена', group })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка обновления группы' })
  }
}

export const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params
    const group = await CharacteristicGroup.findOne({ id })
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' })
    }

    const valuesCount = await CharacteristicValue.countDocuments({ groupId: id })
    if (valuesCount > 0) {
      return res.status(400).json({ error: `Нельзя удалить группу: с ней связано ${valuesCount} значений` })
    }

    await CharacteristicGroup.deleteOne({ id })
    res.json({ message: 'Группа удалена' })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка удаления группы' })
  }
}

// ===== ЗНАЧЕНИЯ ХАРАКТЕРИСТИК =====

export const getValues = async (req, res) => {
  try {
    const { groupId } = req.params
    const values = await CharacteristicValue.find({ groupId }).sort({ sortOrder: 1, value: 1 })
    res.json({ values })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения значений' })
  }
}

export const createValue = async (req, res) => {
  try {
    const { groupId } = req.params
    const { traitName, value, unit, metadata } = req.body

    if (!traitName || !value) {
      return res.status(400).json({ error: 'Название характеристики и значение обязательны' })
    }

    const group = await CharacteristicGroup.findOne({ id: groupId })
    if (!group) {
      return res.status(404).json({ error: 'Группа характеристик не найдена' })
    }

    if (!group.traitNames.includes(traitName)) {
      return res.status(400).json({ error: `Характеристика "${traitName}" не найдена в группе "${group.name}"` })
    }

    const existing = await CharacteristicValue.findOne({ groupId, traitName, value: { $regex: new RegExp('^' + value + '$', 'i') } })
    if (existing) {
      return res.status(409).json({ error: 'Такое значение уже существует' })
    }

    const val = new CharacteristicValue({
      id: await getNextId('cv'),
      groupId,
      traitName,
      value: value.trim(),
      normalizedValue: req.body.normalizedValue || value.trim().toLowerCase(),
      unit: unit || '',
      metadata: metadata || {},
      sortOrder: req.body.sortOrder || 0,
    })

    await val.save()
    res.status(201).json({ message: 'Значение создано', value: val })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка создания значения' })
  }
}

export const updateValue = async (req, res) => {
  try {
    const { id } = req.params
    const val = await CharacteristicValue.findOne({ id })
    if (!val) {
      return res.status(404).json({ error: 'Значение не найдено' })
    }

    const allowedFields = ['value', 'normalizedValue', 'unit', 'metadata', 'sortOrder']
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        val[field] = req.body[field]
      }
    })

    await val.save()
    res.json({ message: 'Значение обновлено', value: val })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка обновления значения' })
  }
}

export const deleteValue = async (req, res) => {
  try {
    const { id } = req.params
    const val = await CharacteristicValue.findOne({ id })
    if (!val) {
      return res.status(404).json({ error: 'Значение не найдено' })
    }

    await CharacteristicValue.deleteOne({ id })
    res.json({ message: 'Значение удалено' })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка удаления значения' })
  }
}

// ===== ХАРАКТЕРИСТИКИ ДЛЯ КАТЕГОРИИ =====

export const getCategoryCharacteristics = async (req, res) => {
  try {
    const { categoryId } = req.params

    const groups = await CharacteristicGroup.find({
      isActive: true,
      $or: [{ categoryId }, { categoryId: null }],
    }).sort({ sortOrder: 1, name: 1 })

    const result = []
    for (const group of groups) {
      const values = await CharacteristicValue.find({ groupId: group.id }).sort({ sortOrder: 1, value: 1 })
      result.push({
        group: group.toObject(),
        values: values.map((v) => v.toObject()),
      })
    }

    res.json({ characteristics: result })
  } catch (err) {
    res.status(500).json({ error: err.message || 'Ошибка получения характеристик' })
  }
}