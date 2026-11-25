import api from './api';

const userService = {
  getAll: () => api.get('/users'),
  create: (data) => api.post('/users', data),
};

export default userService;
