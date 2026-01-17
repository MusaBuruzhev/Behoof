import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Отдельный экземпляр для загрузки файлов без Content-Type
const apiUpload = axios.create({
  baseURL: API_URL,
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
    // Используем отдельный экземпляр для FormData
    const response = await apiUpload.post('/products', productData);
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

/**
 * Получить товар по ID
 */
export const getProduct = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    throw error;
  }
};

/**
 * Обновить товар
 */
export const updateProduct = async (productId, productData) => {
  try {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    throw error;
  }
};

/**
 * Удалить товар
 */
export const deleteProduct = async (productId) => {
  try {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    throw error;
  }
};

export default {
  fetchCatalog,
  addProduct,
  initializeData,
  getProduct,
  updateProduct,
  deleteProduct
};
