import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { authService } from './services/authService';
import ToastContainer from './components/ui/Toast/ToastContainer';
import CartDrawer from './components/cart/CartDrawer/CartDrawer';
import ExitPopup from './components/home/ExitPopup/ExitPopup';
import RouteTransition from './components/ui/RouteTransition/RouteTransition';

export default function App() {
  // Hidrata o authStore a partir do cookie existente no boot. Via `getState()`:
  // assinar a store aqui re-renderizaria a árvore inteira a cada login, logout
  // ou item adicionado ao carrinho.
  useEffect(() => {
    const { setUser, clearUser } = useAuthStore.getState();
    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        useCartStore.getState().fetchCart();
      })
      .catch(() => clearUser());
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteTransition />
      <AppRouter />
      <CartDrawer />
      <ToastContainer />
      <ExitPopup />
    </BrowserRouter>
  );
}
