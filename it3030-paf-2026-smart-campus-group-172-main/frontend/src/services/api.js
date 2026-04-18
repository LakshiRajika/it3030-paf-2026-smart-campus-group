import axios from 'axios';
import { message } from 'antd';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.message || error.message || 'Something went wrong';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (token) => api.post('/auth/google', { token }),
};

// User APIs
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),
  delete: (id) => api.delete(`/users/${id}`),
};

// Facility APIs
export const facilityAPI = {
  getAll: () => api.get('/facilities'),
  getAvailable: () => api.get('/facilities/available'),
  getById: (id) => api.get(`/facilities/${id}`),
  search: (name) => api.get(`/facilities/search?name=${name}`),
  create: (data) => api.post('/facilities', data),
  update: (id, data) => api.put(`/facilities/${id}`, data),
  delete: (id) => api.delete(`/facilities/${id}`),
};

// Booking APIs
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMy: () => api.get('/bookings/my'),
  getAll: () => api.get('/bookings'),
  getById: (id) => api.get(`/bookings/${id}`),
  getByStatus: (status) => api.get(`/bookings/status/${status}`),
  approve: (id, remarks) => api.patch(`/bookings/${id}/approve`, { remarks }),
  reject: (id, rejectionReason) => api.patch(`/bookings/${id}/reject`, { rejectionReason, action: 'REJECT' }),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Ticket APIs
export const ticketAPI = {
  create: (data) => api.post('/tickets', data),
  getMy: () => api.get('/tickets/my'),
  getAll: () => api.get('/tickets'),
  getById: (id) => api.get(`/tickets/${id}`),
  getByStatus: (status) => api.get(`/tickets/status/${status}`),
  getAssigned: () => api.get('/tickets/assigned'),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  addComment: (id, content) => api.post(`/tickets/${id}/comments`, { content }),
  delete: (id) => api.delete(`/tickets/${id}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;
