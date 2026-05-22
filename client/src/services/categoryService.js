import api from './api';

export const categoryService = {
  getAll: () => api.get('/categories').then((r) => r.data),
};
