import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { storeConfig } from '../../config/storeConfig';
import {
  DashboardIcon,
  ShirtIcon,
  OrdersIcon,
  StorefrontIcon,
  LogoutIcon,
} from '../../components/ui/Icons';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', Icon: DashboardIcon, end: true },
  { to: '/admin/produtos', label: 'Produtos', Icon: ShirtIcon },
  { to: '/admin/pedidos', label: 'Pedidos', Icon: OrdersIcon },
];

const [brandPrefix, brandSuffix] = storeConfig.brand.nameParts;
// A sidebar colapsada mostra só as iniciais. Derivadas do storeConfig, não mais
// um `content: 'CC'` cravado no CSS.
const brandInitials = `${brandPrefix[0]}${brandSuffix[0]}`;

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <span className="admin-logo-full">
            {brandPrefix}<span className="admin-logo-accent">{brandSuffix}</span>
          </span>
          <span className="admin-logo-short">{brandInitials}</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? ' admin-nav-item--active' : ''}`
              }
            >
              <span className="admin-nav-icon"><Icon sx={{ fontSize: '18px' }} /></span>
              <span className="admin-nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sair do painel tem duas saídas, e elas não são a mesma coisa: trocar de
            visão mantém a sessão, encerrar a sessão não. Separadas do bloco de
            navegação por isso. O link para a loja espelha o "Admin" do dropdown
            do usuário no Header — a ida e a volta fecham. */}
        <div className="admin-sidebar-footer">
          <Link to="/" title="Ver loja" className="admin-nav-item admin-view-switch">
            <span className="admin-nav-icon"><StorefrontIcon sx={{ fontSize: '18px' }} /></span>
            <span className="admin-nav-label">Ver loja</span>
          </Link>

          <button
            type="button"
            title="Sair"
            className="admin-nav-item admin-logout-btn"
            onClick={logout}
          >
            <span className="admin-nav-icon"><LogoutIcon sx={{ fontSize: '18px' }} /></span>
            <span className="admin-nav-label">Sair</span>
          </button>
        </div>
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
