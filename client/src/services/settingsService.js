import api from './api';

export const settingsService = {
  get: () => api.get('/settings').then((r) => r.data),
  update: (settings) => api.put('/admin/settings', settings).then((r) => r.data),
};
