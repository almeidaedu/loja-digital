import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import useFreteProgress from '../../../hooks/useFreteProgress';
import useScrollLock from '../../../hooks/useScrollLock';
import useFocusTrap from '../../../hooks/useFocusTrap';
import { formatCurrency } from '../../../utils/formatCurrency';
import { fade, spring, tween, withReducedMotion } from '../../../styles/motion';
import { CartIcon, CheckCircleIcon, CloseIcon } from '../../ui/Icons';
import Button from '../../ui/Button/Button';
import CartItem from '../CartItem/CartItem';
import './CartDrawer.css';

// Sheet ancorado à direita. Arrastar para a direita fecha; soltar antes do
// limiar volta ao lugar pela mesma mola.
const slideRight = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

const DISMISS_OFFSET = 120;
const DISMISS_VELOCITY = 500;

export default function CartDrawer() {
  const cartOpen = useUiStore((s) => s.cartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { total, count, remaining, fillPct, unlocked } = useFreteProgress();

  const reduced = useReducedMotion();
  const panelRef = useRef(null);

  useScrollLock(cartOpen);
  useFocusTrap(cartOpen, panelRef);

  useEffect(() => {
    if (!cartOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeCart();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [cartOpen, closeCart]);

  const checkoutTo = isAuthenticated ? '/checkout' : '/login';

  return createPortal(
    <AnimatePresence>
      {cartOpen && (
        <motion.div
          className="cart-scrim"
          variants={fade}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={tween.fast}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCart();
          }}
        >
          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Carrinho de compras"
            tabIndex={-1}
            className="cart-drawer"
            variants={withReducedMotion(slideRight, reduced)}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={reduced ? tween.fast : spring.sheet}
            drag={reduced ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0, right: 0.9 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.x > DISMISS_OFFSET || info.velocity.x > DISMISS_VELOCITY) {
                closeCart();
              }
            }}
          >
            <span className="cart-grabber" aria-hidden="true" />

            <header className="cart-header">
              <div className="cart-title-row">
                <h2 className="cart-title">Meu Carrinho</h2>
                {count > 0 && <span className="cart-header-count">{count}</span>}
              </div>
              <button
                type="button"
                className="cart-close"
                onClick={closeCart}
                aria-label="Fechar carrinho"
              >
                <CloseIcon sx={{ fontSize: '1.125rem' }} />
              </button>
            </header>

            <div className="cart-body">
              {items.length === 0 ? (
                <div className="cart-empty">
                  <CartIcon className="cart-empty-icon" sx={{ fontSize: '2.5rem' }} />
                  <p className="cart-empty-text">Seu carrinho está vazio</p>
                  <p className="cart-empty-sub">Adicione produtos para continuar</p>
                  <Button to="/produtos" fullWidth onClick={closeCart}>
                    Ver Produtos
                  </Button>
                </div>
              ) : (
                <ul className="cart-list">
                  {items.map((item) => (
                    <li key={item.id}>
                      <CartItem item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="cart-footer">
                <div className="cart-frete">
                  {unlocked ? (
                    <p className="cart-frete-text cart-frete-text--unlocked">
                      <CheckCircleIcon sx={{ fontSize: '1rem' }} />
                      Frete grátis desbloqueado
                    </p>
                  ) : (
                    <p className="cart-frete-text">
                      Faltam <span className="cart-frete-amount">{formatCurrency(remaining)}</span>{' '}
                      para frete grátis
                    </p>
                  )}
                  <div className="cart-frete-track" aria-hidden="true">
                    <div className="cart-frete-fill" style={{ width: `${fillPct}%` }} />
                  </div>
                </div>

                <div className="cart-total-row">
                  <span className="cart-total-label">Subtotal</span>
                  <span className="cart-total-amount">{formatCurrency(total)}</span>
                </div>

                <Button to={checkoutTo} fullWidth onClick={closeCart}>
                  {isAuthenticated ? 'Finalizar Pedido' : 'Entrar para Finalizar'}
                </Button>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
