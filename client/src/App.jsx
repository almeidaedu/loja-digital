import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';
import { useAuthStore } from './store/authStore';
import { useCartStore } from './store/cartStore';
import { useSettingsStore } from './store/settingsStore';
import { authService } from './services/authService';
import ToastContainer from './components/ui/Toast/ToastContainer';
import Button from './components/ui/Button/Button';
import CartDrawer from './components/cart/CartDrawer/CartDrawer';
import ExitPopup from './components/home/ExitPopup/ExitPopup';
import RouteTransition from './components/ui/RouteTransition/RouteTransition';

// A loja só monta com as configurações na mão: marca, frete, promo e popup vêm
// delas. Renderizar com padrões e trocar depois piscaria o banner e o logo — e
// exigiria uma cópia dos padrões aqui, uma segunda fonte.
function BootScreen({ failed, onRetry }) {
  return (
    <div className="route-fallback">
      {failed ? (
        <div role="alert" className="boot-error">
          <p>Não foi possível carregar a loja.</p>
          <Button onClick={onRetry}>Tentar de novo</Button>
        </div>
      ) : (
        <span className="spinner" role="status" aria-label="Carregando a loja" />
      )}
    </div>
  );
}

export default function App() {
  const status = useSettingsStore((s) => s.status);
  const load = useSettingsStore((s) => s.load);
  const brandName = useSettingsStore((s) => s.settings?.brand.name);
  const leadCaptureEnabled = useSettingsStore((s) => s.settings?.leadCapture.enabled);

  // Configurações e sessão em paralelo. A sessão segue via `getState()`: assinar
  // o authStore aqui re-renderizaria a árvore inteira a cada login, logout ou
  // item adicionado ao carrinho.
  useEffect(() => {
    load();

    const { setUser, clearUser } = useAuthStore.getState();
    authService
      .getMe()
      .then(({ user }) => {
        setUser(user);
        useCartStore.getState().fetchCart();
      })
      .catch(() => clearUser());
  }, [load]);

  // O <title> do index.html é o que buscador e prévia de link leem; este é o da
  // aba, e acompanha a marca configurada no painel.
  useEffect(() => {
    if (brandName) document.title = brandName;
  }, [brandName]);

  if (status !== 'ready') return <BootScreen failed={status === 'error'} onRetry={load} />;

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteTransition />
      <AppRouter />
      <CartDrawer />
      <ToastContainer />
      {/* Gate aqui e não dentro do popup: desligado, ele nem monta e o
          exit intent não arma listener nenhum. */}
      {leadCaptureEnabled && <ExitPopup />}
    </BrowserRouter>
  );
}
