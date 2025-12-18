import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Получить весь каталог
 */
export const fetchCatalog = async () => {
  try {
    const response = await api.get('/catalog');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения каталога:', error);
    throw error;
  }
};

/**
 * Добавить новый товар
 */
export const addProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления товара:', error);
    throw error;
  }
};

/**
 * Инициализировать начальные данные
 */
export const initializeData = async () => {
  try {
    const response = await api.post('/initialize');
    return response.data;
  } catch (error) {
    console.error('Ошибка инициализации данных:', error);
    throw error;
  }
};

export default {
  fetchCatalog,
  addProduct,
  initializeData
};
