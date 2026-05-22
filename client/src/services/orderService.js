import api from './api';

export const orderService = {
  createOrder: (data) => api.post('/orders', data).then((r) => r.data),
  getMyOrders: () => api.get('/orders').then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
};
