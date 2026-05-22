import api from './api';

export const productService = {
  getFeatured: () => api.get('/products/featured').then((r) => r.data),
  getAll: (params) => api.get('/products', { params }).then((r) => r.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data),
};
