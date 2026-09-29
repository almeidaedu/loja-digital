import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { storeConfig } from '../../../config/storeConfig';
import { popIn, spring, tween } from '../../../styles/motion';
import Button from '../../ui/Button/Button';
import { CartIcon } from '../../ui/Icons';
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

const [brandPrefix, brandSuffix] = storeConfig.brand.nameParts;

function getActiveSection() {
  const threshold = window.innerHeight * 0.45;
  for (const { id, nav } of SCROLL_SECTIONS) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= threshold) return nav;
  }
  return null; // null = início, sem hash
}

export default function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const reduced = useReducedMotion();

  // Refs para evitar re-criar o effect de scroll ao mudar navigate/hash
  const navigateRef = useRef(null);
  const locationHashRef = useRef('');

  // Scroll programático (scrollIntoView / scrollTo) emite dezenas de eventos até
  // chegar no alvo. Sem trava, o spy reescreve o hash em cada um e a pill percorre
  // todas as seções do caminho. A trava não pode ser por tempo: evento de scroll
  // suave é indistinguível do da roda do mouse, e renovar a trava a cada evento
  // congela o spy justamente enquanto o usuário rola. Então ela dura até o alvo —
  // e input de scroll do usuário cancela na hora.
  const spyTargetRef = useRef(null);
  const spyTimeoutRef = useRef(null);

  const releaseSpy = () => {
    spyTargetRef.current = null;
    clearTimeout(spyTimeoutRef.current);
  };

  // Rede de segurança: o alvo pode nunca casar — seção curta no fim da página, ou
  // scroll que nem acontece porque o destino já estava visível.
  const lockSpy = (target) => {
    spyTargetRef.current = target;
    clearTimeout(spyTimeoutRef.current);
    spyTimeoutRef.current = setTimeout(releaseSpy, 1200);
  };

  useEffect(() => releaseSpy, []);

  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  navigateRef.current = navigate;
  locationHashRef.current = location.hash;

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const items = useCartStore((s) => s.items);
  const toggleCart = useUiStore((s) => s.toggleCart);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? '?';

  // A pill acompanha a URL. Antes era medida por getBoundingClientRect com
  // dependência [activeKey] — desalinhava em qualquer resize (B5). Agora é
  // layoutId: o motion interpola a posição sozinho, sem medir nada. (B5)
  const activeKey = (() => {
    if (location.pathname.startsWith('/produtos')) return 'produtos';
    if (isHome) return HASH_TO_KEY[location.hash] ?? 'inicio';
    return null;
  })();

  // Scroll tracking: atualiza o hash na URL conforme o usuário scrolla
  useEffect(() => {
    if (!isHome) return undefined;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const key = getActiveSection() ?? 'inicio';

        // Travado: só observa. Chegou no alvo do clique, devolve o controle.
        if (spyTargetRef.current) {
          if (key === spyTargetRef.current) releaseSpy();
          return;
        }

        const newHash = key === 'inicio' ? '' : `#${key}`;
        if (locationHashRef.current !== newHash) {
          navigateRef.current(
            newHash ? { hash: newHash } : { pathname: '/', hash: '' },
            { replace: true }
          );
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('wheel', releaseSpy, { passive: true });
    window.addEventListener('touchstart', releaseSpy, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('wheel', releaseSpy);
      window.removeEventListener('touchstart', releaseSpy);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isHome]);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Escape fecha o que estiver aberto
  useEffect(() => {
    if (!userMenuOpen && !mobileMenuOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setUserMenuOpen(false);
      setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [userMenuOpen, mobileMenuOpen]);

  const handleHashLink = (hash) => {
    setMobileMenuOpen(false);
    lockSpy(hash);
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
    lockSpy('inicio');
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (location.hash) navigate({ pathname: '/', hash: '' }, { replace: true });
    } else {
      navigate('/');
    }
  };

  // Um dono só para o logout, no authStore. Aqui o bug era o mesmo do painel,
  // só que mais silencioso: sair a partir de `/meus-pedidos` ou `/minha-conta`
  // fazia o ProtectedRoute capturar a rota e o login seguinte voltar para ela.
  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

  const renderNavLink = (link, mobile = false) => {
    const active = activeKey === link.key;
    const props = {
      className: `${mobile ? 'mobile-nav-link' : 'nav-link'}${active ? ' active' : ''}`,
      'aria-current': active ? 'page' : undefined,
    };

    const content = (
      <>
        {active && !mobile && (
          <motion.span
            className="nav-pill"
            layoutId="nav-pill"
            transition={reduced ? { duration: 0 } : spring.snappy}
            aria-hidden="true"
          />
        )}
        <span className="nav-link-label">{link.label}</span>
      </>
    );

    if (link.to) {
      return (
        <Link key={link.key} to={link.to} {...props} onClick={() => setMobileMenuOpen(false)}>
          {content}
        </Link>
      );
    }

    return (
      <button
        key={link.key}
        type="button"
        {...props}
        onClick={link.scrollTop ? handleScrollTop : () => handleHashLink(link.hash)}
      >
        {content}
      </button>
    );
  };

  return (
    <header>
      <div className="container">
        <div className="header-inner">
          <button
            type="button"
            className="logo"
            onClick={handleScrollTop}
            aria-label={`${storeConfig.brand.name} — voltar ao início`}
          >
            {brandPrefix} <span>{brandSuffix}</span>
          </button>

          <nav className="header-nav" aria-label="Navegação principal">
            {NAV_LINKS.map((link) => renderNavLink(link))}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="cart-btn"
              onClick={toggleCart}
              aria-label={`Carrinho com ${cartCount} ${cartCount === 1 ? 'item' : 'itens'}`}
            >
              <CartIcon sx={{ fontSize: '1.25rem' }} />
              {cartCount > 0 && (
                <span className="cart-count" aria-hidden="true">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>

            <Button to="/produtos" size="sm" className="header-cta">Ver Coleção</Button>

            {isAuthenticated ? (
              <div className="user-menu-wrapper" ref={userMenuRef}>
                <button
                  type="button"
                  className="user-avatar"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="Menu do usuário"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  {userInitial}
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="user-dropdown"
                      role="menu"
                      variants={popIn}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      transition={reduced ? tween.fast : spring.snappy}
                    >
                      <div className="user-dropdown-name">{user?.name}</div>
                      <Link to="/minha-conta" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Minha Conta</Link>
                      <Link to="/meus-pedidos" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>Meus Pedidos</Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="user-dropdown-item user-dropdown-admin" role="menuitem" onClick={() => setUserMenuOpen(false)}>Admin</Link>
                      )}
                      <button type="button" className="user-dropdown-item user-dropdown-logout" role="menuitem" onClick={handleLogout}>Sair</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="header-login-link">Entrar</Link>
            )}

            <button
              type="button"
              className={`hamburger${mobileMenuOpen ? ' open' : ''}`}
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-controls="mobile-nav"
              aria-expanded={mobileMenuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-nav"
              className="mobile-nav-wrap"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduced ? { duration: 0 } : tween.base}
            >
              <nav className="mobile-nav" aria-label="Navegação mobile">
                {NAV_LINKS.map((link) => renderNavLink(link, true))}
                <Button to="/produtos" fullWidth className="mobile-nav-cta" onClick={() => setMobileMenuOpen(false)}>
                  Ver Coleção
                </Button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
