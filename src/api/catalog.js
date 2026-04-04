import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const authHeader = () => {
 const token = localStorage.getItem('token');
 return token ? { Authorization: `Bearer ${token}` } : {};
};

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
 * Получить продуктовый список с пагинацией и фильтрацией
 */
export const fetchProducts = async ({ page = 1, limit = 20, q, categoryId, subcategoryId, modelId, sortBy, priceMin, priceMax, brand } = {}) => {
  try {
    const params = { page, limit }
    if (q) params.q = q
    if (categoryId) params.categoryId = categoryId
    if (subcategoryId) params.subcategoryId = subcategoryId
    if (modelId) params.modelId = modelId
    if (sortBy) params.sortBy = sortBy
    if (priceMin !== null && priceMin !== undefined && priceMin !== '') params.priceMin = priceMin
    if (priceMax !== null && priceMax !== undefined && priceMax !== '') params.priceMax = priceMax
    if (brand) params.brand = brand

    const response = await api.get('/products', { params })
    return response.data
  } catch (error) {
    console.error('Ошибка получения списка товаров:', error)
    throw error
  }
}

/**
 * Добавить новый товар
 */
export const addProduct = async (productData) => {
 try {
 // Используем отдельный экземпляр для FormData
 const response = await apiUpload.post('/products', productData, {
 headers: authHeader(),
 });
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
 const response = await api.post('/initialize', {}, { headers: authHeader() });
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
 * Добавить отзыв о товаре
 */
export const addProductReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    throw error;
  }
};

/**
 * Удалить отзыв о товаре
 */
export const deleteProductReview = async (productId, reviewId) => {
  try {
    const response = await api.delete(`/products/${productId}/reviews/${reviewId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error);
    throw error;
  }
};

/**
 * Обновить товар
 */
export const updateProduct = async (productId, productData) => {
 try {
 const response = await api.put(`/products/${productId}`, productData, {
 headers: authHeader(),
 });
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
 const response = await api.delete(`/products/${productId}`, {
 headers: authHeader(),
 });
 return response.data;
 } catch (error) {
 console.error('Ошибка удаления товара:', error);
 throw error;
 }
};

/**
 * Получить все товары (для банера)
 */
export const getAll = async () => {
  try {
    const response = await api.get('/products?limit=100');
    return response.data;
  } catch (error) {
    console.error('Ошибка получения всех товаров:', error);
    throw error;
  }
};

export default {
  fetchCatalog,
  fetchProducts,
  addProduct,
  initializeData,
  getProduct,
  addProductReview,
  deleteProductReview,
  updateProduct,
  deleteProduct,
  getAll
};
