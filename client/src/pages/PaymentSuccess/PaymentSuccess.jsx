import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('external_reference');
  const collectionId = searchParams.get('collection_id');

  const clearLocal = useCartStore((s) => s.clearLocal);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearLocal();
  }, [clearLocal]);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    orderService
      .getOrder(orderId)
      .then(({ order: fetched }) => setOrder(fetched))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="success-page">
      <div className="success-box">
        <div className="success-icon">✓</div>

        <h1 className="success-title">PEDIDO CONFIRMADO!</h1>
        <p className="success-sub">
          {orderId
            ? `Seu pedido #${orderId.slice(0, 8).toUpperCase()} foi aprovado.`
            : 'Seu pagamento foi aprovado com sucesso.'}
          {collectionId && (
            <>
              {' '}Pagamento: <strong>#{collectionId}</strong>
            </>
          )}
        </p>

        {loading && (
          <div style={{ margin: '24px auto' }}>
            <span className="spinner" />
          </div>
        )}

        {order && !loading && (
          <div className="success-order-summary">
            <h3 className="success-summary-title">Itens do pedido</h3>
            {order.items?.map((item) => (
              <div key={item.id} className="success-item-row">
                <span>
                  {item.productName}
                  {item.size && <span className="success-item-size"> [{item.size}]</span>}
                  <span className="success-item-qty"> × {item.quantity}</span>
                </span>
                <span>{formatCurrency(parseFloat(item.unitPrice) * item.quantity)}</span>
              </div>
            ))}
            <div className="success-total-row">
              <span>TOTAL</span>
              <span>{formatCurrency(parseFloat(order.totalAmount))}</span>
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link to="/meus-pedidos" className="btn-ghost">
            Ver Meus Pedidos
          </Link>
          <Link to="/" className="btn-primary">
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
