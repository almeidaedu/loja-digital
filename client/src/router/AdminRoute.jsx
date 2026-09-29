import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * Restrição adicional sobre o ProtectedRoute, que no AppRouter é o pai desta
 * rota. Boot resolvido e sessão válida já são garantia dele — aqui só sobra o
 * papel. Antes os três checks viviam nos dois arquivos, com o mesmo bug B8
 * duplicado e um `redirect=/admin` cravado à mão.
 */
export default function AdminRoute() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === 'admin') return <Outlet />;

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
