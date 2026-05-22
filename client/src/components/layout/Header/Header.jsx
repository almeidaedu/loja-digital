import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../../../services/authService';
import './Header.css';

const SCROLL_SECTIONS = [
  { id: 'faq',          nav: 'faq' },
  { id: 'prova-social', nav: 'prova-social' },
  { id: 'categorias',   nav: 'categorias' },
];

const HASH_TO_KEY = {
  '#faq':          'faq',
  '#prova-social': 'prova-social',
  '#categorias':   'categorias',
};

const NAV_LINKS = [
  { key: 'inicio',       label: 'Início',     scrollTop: true },
  { key: 'categorias',   label: 'Categorias', hash: 'categorias' },
  { key: 'produtos',     label: 'Produtos',   to: '/produtos' },
  { key: 'prova-social', label: 'Avaliações', hash: 'prova-social' },
  { key: 'faq',          label: 'FAQ',        hash: 'faq' },
];

function getActiveSection() {
  const threshold = window.innerHeight * 0.45;
  for (const { id, nav } of SCROLL_SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= threshold) return nav;
  }
  return null; // null = início, sem hash
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });

  const userMenuRef = useRef(null);
  const navRef = useRef(null);
  const linkRefs = useRef({});

  // Refs para evitar re-criar o effect de scroll ao mudar navigate/hash
  const navigateRef = useRef(null);
  const locationHashRef = useRef('');

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  navigateRef.current = navigate;
  locationHashRef.current = location.hash;

  // Pill position driven by URL — atualiza atomicamente com a rota,
  // sem estado intermediário que causava o desvio por 'inicio'
  const activeKey = (() => {
    if (location.pathname.startsWith('/produtos')) return 'produtos';
    if (isHome) return HASH_TO_KEY[location.hash] ?? 'inicio';
    return null;
  })();

  // Move pill to active link
  useLayoutEffect(() => {
    const navEl = navRef.current;
    const linkEl = linkRefs.current[activeKey];
    if (!navEl || !linkEl || !activeKey) {
      setPill((p) => ({ ...p, visible: false }));
      return;
    }
    const navRect = navEl.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    setPill({ left: linkRect.left - navRect.left, width: linkRect.width, visible: true });
  }, [activeKey]);

  // Header scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll tracking: atualiza o hash na URL conforme o usuário scrolla
  useEffect(() => {
    if (!isHome) return;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const section = getActiveSection();
        const newHash = section ? `#${section}` : '';
        if (locationHashRef.current !== newHash) {
          navigateRef.current(
            newHash ? { hash: newHash } : { pathname: '/', hash: '' },
            { replace: true }
          );
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHome]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleHashLink = (hash) => {
    setMobileMenuOpen(false);
    if (isHome) {
      // Mesma página: atualiza hash + scrolla
      navigate({ hash: `#${hash}` }, { replace: true });
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Outra página: navega para /#hash — pathname e hash commitam juntos,
      // então location.hash = '#prova-social' já no primeiro render com isHome=true
      navigate({ pathname: '/', hash: `#${hash}` });
      setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleScrollTop = () => {
    setMobileMenuOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.hash) navigate({ pathname: '/', hash: '' }, { replace: true });
    } else {
      navigate('/');
    }
  };

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ } finally {
      useAuthStore.getState().clearUser();
      useCartStore.getState().clearLocal();
      setUserMenuOpen(false);
    }
  };

  const setLinkRef = (key) => (el) => { linkRefs.current[key] = el; };

  const isLinkActive = (link) => activeKey === link.key;

  const renderNavLink = (link, mobile = false) => {
    const cls = `${mobile ? 'mobile-nav-link' : 'nav-link'}${isLinkActive(link) ? ' active' : ''}`;

    if (link.scrollTop) {
      return (
        <button key={link.key} ref={!mobile ? setLinkRef(link.key) : undefined}
          className={cls} onClick={handleScrollTop} type="button">
          {link.label}
        </button>
      );
    }
    if (link.hash) {
      return (
        <button key={link.key} ref={!mobile ? setLinkRef(link.key) : undefined}
          className={cls} onClick={() => handleHashLink(link.hash)} type="button">
          {link.label}
        </button>
      );
    }
    return (
      <NavLink key={link.key} ref={!mobile ? setLinkRef(link.key) : undefined}
        to={link.to}
        className={({ isActive }) => `${mobile ? 'mobile-nav-link' : 'nav-link'}${isActive ? ' active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        {link.label}
      </NavLink>
    );
  };

  const { user, isAuthenticated } = useAuthStore();
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? '?';
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const toggleCart = useUiStore((s) => s.toggleCart);

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="container">
        <div className="header-inner">
          <button className="logo" onClick={handleScrollTop} aria-label="Campo Cheio - Voltar ao início" type="button">
            CAMPO <span>CHEIO</span>
          </button>

          <nav ref={navRef} className="header-nav" aria-label="Navegação principal">
            {pill.visible && (
              <span
                className="nav-pill"
                style={{ left: pill.left, width: pill.width }}
                aria-hidden="true"
              />
            )}
            {NAV_LINKS.map((link) => renderNavLink(link))}
          </nav>

          <div className="header-actions">
            <button className="cart-btn" onClick={toggleCart}
              aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && (
                <span className="cart-count" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>

            <Link to="/produtos" className="btn-primary header-cta">Ver Coleção</Link>

            {isAuthenticated ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button className="user-avatar" onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="Menu do usuário" aria-expanded={userMenuOpen}>
                  {userInitial}
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-name">{user.name}</div>
                    <Link to="/minha-conta" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Minha Conta</Link>
                    <Link to="/meus-pedidos" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Meus Pedidos</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="user-dropdown-item user-dropdown-admin" role="menuitem" onClick={() => setUserMenuOpen(false)}>Admin</Link>
                    )}
                    <button className="user-dropdown-item user-dropdown-logout" role="menuitem" onClick={handleLogout}>Sair</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="header-login-link">Entrar</Link>
            )}

            <button className={`hamburger${mobileMenuOpen ? ' open' : ''}`}
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label="Abrir menu" aria-expanded={mobileMenuOpen}>
              <span /><span /><span />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="mobile-nav" aria-label="Navegação mobile">
            {NAV_LINKS.map((link) => renderNavLink(link, true))}
            <Link to="/produtos" className="btn-primary mobile-nav-cta" onClick={() => setMobileMenuOpen(false)}>
              Ver Coleção
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
