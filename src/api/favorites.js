import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => {
  return localStorage.getItem('token');
};

const favoritesAPI = {
  addToFavorites: async (productId) => {
    const token = getToken();
    if (!token) {
      throw new Error('Не авторизованы');
    }
    const response = await axios.post(
      `${API_BASE_URL}/favorites/add`,
      { productId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  removeFromFavorites: async (productId) => {
    const token = getToken();
    if (!token) {
      throw new Error('Не авторизованы');
    }
    const response = await axios.post(
      `${API_BASE_URL}/favorites/remove`,
      { productId },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  getFavorites: async () => {
    const token = getToken();
    if (!token) {
      throw new Error('Не авторизованы');
    }
    const response = await axios.get(
      `${API_BASE_URL}/favorites`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
};

export default favoritesAPI;
