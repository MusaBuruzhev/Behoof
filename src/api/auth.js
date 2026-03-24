import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const authHeader = () => {
 const token = localStorage.getItem('token');
 return {
 'Authorization': `Bearer ${token}`
 };
};

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
 headers: authHeader()
 });
 return response.data;
 },

 updateProfile: async (userData) => {
 const token = localStorage.getItem('token');
 if (!token) {
 throw new Error('Токен не найден');
 }
 const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData, {
 headers: authHeader()
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
 headers: authHeader()
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
 headers: authHeader()
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
 },

 isAdmin: () => {
 const user = authAPI.getCurrentUser();
 return user?.role === 'admin';
 },

 getAdminUsers: async () => {
 const response = await axios.get(`${API_BASE_URL}/admin/users`, {
 headers: authHeader()
 });
 return response.data;
 },

 updateUserRole: async (userId, role) => {
 const response = await axios.put(
 `${API_BASE_URL}/admin/users/${userId}/role`,
 { role },
 { headers: authHeader() }
 );

 if (response.data.user) {
 const currentUser = authAPI.getCurrentUser();
 if (currentUser && currentUser._id === response.data.user._id) {
 localStorage.setItem('user', JSON.stringify(response.data.user));
 }
 }

 return response.data;
 },

 deleteUserByAdmin: async (userId) => {
 const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
 headers: authHeader()
 });
 return response.data;
 },

 getAdminStats: async () => {
 const response = await axios.get(`${API_BASE_URL}/admin/stats`, {
 headers: authHeader()
 });
 return response.data;
 }
};


export default authAPI;
