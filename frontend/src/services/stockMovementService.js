import api from './api';

const stockMovementService = {
  getAll: () => api.get('/stock-movements'),
  create: (data) => api.post('/stock-movements', data),
};

export default stockMovementService;
