import api from './api';

const materialService = {
  getAll: () => api.get('/materials'),
  getById: (id) => api.get(`/materials/${id}`),
  create: (data) => api.post('/materials', data),
  update: (id, data) => api.put(`/materials/${id}`, data),
  delete: (id) => api.delete(`/materials/${id}`),
  getLowStockAlerts: () => api.get('/materials/alerts/low-stock'),
};

export default materialService;