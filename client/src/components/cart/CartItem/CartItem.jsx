import { useState } from 'react';
import { useCartStore } from '../../../store/cartStore';
import { formatCurrency } from '../../../utils/formatCurrency';
import './CartItem.css';

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCartStore();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1 || loading) return;
    setLoading(true);
    try {
      await updateItem(item.id, newQty);
    } catch {
      // keep existing quantity on error
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await removeItem(item.id);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className={`cart-item${loading ? ' cart-item--loading' : ''}`}>
      {/* Image */}
      <div className="cart-item-img-wrapper">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="cart-item-img"
            loading="lazy"
          />
        ) : (
          <div className="cart-item-img cart-item-img--placeholder" aria-hidden="true">
            ⚽
          </div>
        )}
      </div>

      {/* Info */}
      <div className="cart-item-info">
        <p className="cart-item-name" title={item.name}>
          {item.name}
        </p>

        {item.size && (
          <span className="cart-item-size badge badge-green">{item.size}</span>
        )}

        {/* Controls row */}
        <div className="cart-item-controls">
          <div className="qty-stepper" role="group" aria-label="Quantidade">
            <button
              className="qty-btn"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || loading}
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="qty-count" aria-live="polite">
              {item.quantity}
            </span>
            <button
              className="qty-btn"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={loading}
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>

          <button
            className="cart-item-remove"
            onClick={handleRemove}
            disabled={loading}
            aria-label={`Remover ${item.name}`}
            title="Remover item"
          >
            ×
          </button>
        </div>

        <p className="cart-item-price">
          {formatCurrency(parseFloat(item.price) * item.quantity)}
        </p>
      </div>
    </div>
  );
}
