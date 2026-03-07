import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const authAPI = {
  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Токен не найден');
    }
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  updateProfile: async (userData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Токен не найден');
    }
    const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  deleteProfile: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Токен не найден');
    }
    const response = await axios.delete(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  },

  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return { valid: false };
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { valid: false };
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default authAPI;
