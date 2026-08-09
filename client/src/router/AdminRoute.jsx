import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AdminRoute() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', letterSpacing: '1px' }}>
          ACESSO RESTRITO
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: 440, lineHeight: 1.5 }}>
          A conta <strong>{user?.email}</strong> não tem permissão de administrador.
          Se você deveria ter acesso, peça a um administrador para promover a sua conta
          e faça login novamente.
        </p>
        <Link to="/" className="btn-primary" style={{ marginTop: 8 }}>
          Voltar à loja
        </Link>
      </div>
    );
  }

  return <Outlet />;
}
