import { Link } from 'react-router-dom';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatCurrency';
import CartItem from '../CartItem/CartItem';
import './CartDrawer.css';

const FRETE_THRESHOLD = 149;

export default function CartDrawer() {
  const cartOpen = useUiStore((s) => s.cartOpen);
  const closeCart = useUiStore((s) => s.closeCart);

  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const { isAuthenticated } = useAuthStore();

  const remaining = Math.max(0, FRETE_THRESHOLD - total);
  const fillPct = Math.min(100, (total / FRETE_THRESHOLD) * 100);
  const freteUnlocked = total >= FRETE_THRESHOLD;

  const checkoutTo = isAuthenticated ? '/checkout' : '/login';

  return (
    <>
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <aside
        className={`cart-drawer${cartOpen ? ' open' : ''}`}
        aria-label="Carrinho de compras"
        aria-hidden={!cartOpen}
      >
        {/* Header */}
        <div className="cart-header">
          <div className="cart-title-row">
            <h2 className="cart-title">Meu Carrinho</h2>
            {count > 0 && (
              <span className="cart-header-count">{count}</span>
            )}
          </div>
          <button
            className="cart-close"
            onClick={closeCart}
            aria-label="Fechar carrinho"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" aria-hidden="true">🛒</div>
              <p className="cart-empty-text">Seu carrinho está vazio</p>
              <p className="cart-empty-sub">Adicione produtos para continuar</p>
              <Link
                to="/produtos"
                className="btn-primary cart-empty-btn"
                onClick={closeCart}
              >
                Ver Produtos
              </Link>
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

        {/* Footer */}
        {items.length > 0 && (
          <div className="cart-footer">
            {/* Frete progress */}
            <div className="cart-frete">
              {freteUnlocked ? (
                <p className="cart-frete-text highlight">
                  🎉 Frete grátis desbloqueado!
                </p>
              ) : (
                <p className="cart-frete-text">
                  Faltam{' '}
                  <span className="highlight">{formatCurrency(remaining)}</span>{' '}
                  para frete grátis
                </p>
              )}
              <div className="cart-frete-track" aria-hidden="true">
                <div
                  className="cart-frete-fill"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>

            {/* Subtotal */}
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal</span>
              <span className="cart-total-amount">{formatCurrency(total)}</span>
            </div>

            <Link
              to={checkoutTo}
              className="btn-primary cart-checkout-btn"
              onClick={closeCart}
            >
              {isAuthenticated ? 'Finalizar Pedido' : 'Entrar para Finalizar'}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
