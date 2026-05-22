import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Interceptor: limpa sessão apenas quando o próprio backend rejeita o token do usuário
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url ?? '';
    const is401 = err.response?.status === 401;
    const isAuthRoute = url.includes('/auth/');

    if (is401 && isAuthRoute) {
      useAuthStore.getState().clearUser();
    }
    return Promise.reject(err);
  }
);

export default api;
