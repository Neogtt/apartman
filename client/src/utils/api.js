import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Apartment Orders
export const getApartmentOrders = () => api.get('/apartment/orders');
export const getApartmentOrdersByNumber = (apartmentNumber) => api.get(`/apartment/orders/apartment/${apartmentNumber}`);
export const createApartmentOrder = (data) => api.post('/apartment/orders', data);
export const updateApartmentOrderStatus = (id, status) => api.patch(`/apartment/orders/${id}`, { status });
export const deleteApartmentOrder = (id) => api.delete(`/apartment/orders/${id}`);
export const getApartments = () => api.get('/apartment/apartments');
export const getApartmentStats = () => api.get('/apartment/stats');

// Auth
export const loginApartment = (apartmentNumber, password) => api.post('/apartment/auth/login', { apartmentNumber, password });
export const loginStaff = (username, password) => api.post('/apartment/auth/staff-login', { username, password });

// Blocks
export const getBlocks = () => api.get('/apartment/blocks');

export default api;

