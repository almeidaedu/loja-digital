import { useState } from 'react';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
import { formatCurrency } from '../../../utils/formatCurrency';
import { MinusIcon, PlusIcon, ShirtIcon, TrashIcon } from '../../ui/Icons';
import './CartItem.css';

export default function CartItem({ item }) {
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const addToast = useUiStore((s) => s.addToast);
  const [loading, setLoading] = useState(false);

  const failWith = (err, fallback) =>
    addToast({ type: 'error', message: err.response?.data?.message ?? fallback });

  const handleQuantityChange = async (newQty) => {
    if (newQty < 1 || loading) return;
    setLoading(true);
    try {
      await updateItem(item.id, newQty);
    } catch (err) {
      failWith(err, 'Não foi possível alterar a quantidade.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await removeItem(item.id);
    } catch (err) {
      failWith(err, 'Não foi possível remover o item.');
      setLoading(false);
    }
  };

  return (
    <div className={`cart-item${loading ? ' cart-item--loading' : ''}`}>
      <div className="cart-item-img-wrapper">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="cart-item-img" loading="lazy" />
        ) : (
          <div className="cart-item-img cart-item-img--placeholder" aria-hidden="true">
            <ShirtIcon sx={{ fontSize: '1.5rem' }} />
          </div>
        )}
      </div>

      <div className="cart-item-info">
        <p className="cart-item-name" title={item.name}>
          {item.name}
        </p>

        {item.size && <span className="cart-item-size badge badge--green">{item.size}</span>}

        <div className="cart-item-controls">
          <div className="qty-stepper" role="group" aria-label="Quantidade">
            <button
              type="button"
              className="qty-btn"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={item.quantity <= 1 || loading}
              aria-label="Diminuir quantidade"
            >
              <MinusIcon sx={{ fontSize: '1rem' }} />
            </button>
            <span className="qty-count" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              className="qty-btn"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={loading}
              aria-label="Aumentar quantidade"
            >
              <PlusIcon sx={{ fontSize: '1rem' }} />
            </button>
          </div>

          <button
            type="button"
            className="cart-item-remove"
            onClick={handleRemove}
            disabled={loading}
            aria-label={`Remover ${item.name}`}
          >
            <TrashIcon sx={{ fontSize: '1.125rem' }} />
          </button>
        </div>

        <p className="cart-item-price">
          {formatCurrency((Number.parseFloat(item.price) || 0) * item.quantity)}
        </p>
      </div>
    </div>
  );
}
