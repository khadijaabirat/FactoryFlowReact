import api from './api';

const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  updateBOM: (id, composition) => api.post(`/products/${id}/bom`, { items: composition }),
};

export default productService;