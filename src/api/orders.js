import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const authHeader = () => {
 const token = localStorage.getItem('token');
 return {
 Authorization: `Bearer ${token}`
 };
};

const ordersAPI = {
 createOrder: async (payload) => {
 const response = await axios.post(`${API_BASE_URL}/orders`, payload, {
 headers: authHeader(),
 });
 return response.data;
 },

 getMyOrders: async () => {
 const response = await axios.get(`${API_BASE_URL}/orders/my`, {
 headers: authHeader(),
 });
 return response.data;
 },

 getAllOrdersAdmin: async () => {
 const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
 headers: authHeader(),
 });
 return response.data;
 },

 updateOrderStatusAdmin: async (orderId, status) => {
 const response = await axios.put(
 `${API_BASE_URL}/admin/orders/${orderId}/status`,
 { status },
 { headers: authHeader() }
 );
 return response.data;
 },
};

export default ordersAPI;
