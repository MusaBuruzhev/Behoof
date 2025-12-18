import { Counter } from '../models/index.js';

/**
 * Генерирует следующий ID в формате prefix1, prefix2 и т.д.
 * @param {string} prefix - префикс ID (например: 'p', 'sub', 'cat')
 * @returns {string} сгенерированный ID
 */
export const getNextId = async (prefix) => {
  try {
    // Находим или создаем счетчик для этого префикса
    const counter = await Counter.findOneAndUpdate(
      { name: prefix },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    return `${prefix}${counter.value}`;
  } catch (error) {
    console.error('Ошибка генерации ID:', error);
    throw error;
  }
};

/**
 * Получает текущее значение счетчика
 * @param {string} prefix - префикс
 * @returns {number} текущее значение
 */
export const getCurrentCounterValue = async (prefix) => {
  const counter = await Counter.findOne({ name: prefix });
  return counter ? counter.value : 0;
};
