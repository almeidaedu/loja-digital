import api from './api';

export const cartService = {
  getCart: () => api.get('/cart').then((r) => r.data),
  addItem: (data) => api.post('/cart/items', data).then((r) => r.data),
  updateItem: (id, quantity) => api.put(`/cart/items/${id}`, { quantity }).then((r) => r.data),
  removeItem: (id) => api.delete(`/cart/items/${id}`),
  clearCart: () => api.delete('/cart'),
};
