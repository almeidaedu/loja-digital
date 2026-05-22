import api from './api';

export const paymentService = {
  createPreference: (orderId) =>
    api.post('/payments/preference', { orderId }).then((r) => r.data),
  createPix: (data) =>
    api.post('/payments/pix', data).then((r) => r.data),
  getStatus: (paymentId) =>
    api.get(`/payments/status/${paymentId}`).then((r) => r.data),
};
