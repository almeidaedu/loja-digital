import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const location = useLocation();

  // B8: antes era `return null` — dar F5 em /meus-pedidos deixava o miolo em
  // branco até o `getMe` do boot responder, e num 401 lento isso é uma eternidade.
  // Redirecionar sem esperar também não serve: jogaria fora uma sessão válida.
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <span className="spinner" style={{ width: 40, height: 40 }} aria-label="Verificando sessão" role="status" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // `search` junto, e codificado: sem isso `/produtos?category=x` volta truncado
    // no `?`, e o `searchParams.get('redirect')` do Login já decodifica.
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
}
