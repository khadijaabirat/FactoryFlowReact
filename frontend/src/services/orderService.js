import api from './api';

const orderService = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  start: (id) => api.post(`/orders/${id}/start`),
  finish: (id) => api.post(`/orders/${id}/finish`),
  getMyOrders: () => api.get('/orders/my-orders'),
};

export default orderService;