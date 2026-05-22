import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { DashboardIcon, ShirtIcon, OrdersIcon } from '../../components/ui/Icons';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', Icon: DashboardIcon, end: true },
  { to: '/admin/produtos', label: 'Produtos', Icon: ShirtIcon },
  { to: '/admin/pedidos', label: 'Pedidos', Icon: OrdersIcon },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    clearUser();
    navigate('/login');
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          CAMPO<span>CHEIO</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`
              }
            >
              <span className="admin-nav-icon"><Icon sx={{ fontSize: '18px' }} /></span>
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="admin-logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-topbar-title">Painel Admin</h1>
          <span className="admin-topbar-user">
            {user?.name ?? 'Administrador'}
          </span>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
