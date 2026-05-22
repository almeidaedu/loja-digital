import { useEffect, useState } from 'react';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { ShirtIcon, PackageIcon } from '../../components/ui/Icons';
import './Orders.css';

const STATUS_LABELS = {
  approved: 'Aprovado',
  pending: 'Pendente',
  waiting_payment: 'Aguardando Pagamento',
  in_process: 'Em Processamento',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

function statusClass(status) {
  if (status === 'approved' || status === 'delivered') return 'badge--green';
  if (status === 'pending' || status === 'waiting_payment' || status === 'in_process')
    return 'badge--yellow';
  if (status === 'rejected' || status === 'cancelled') return 'badge--red';
  if (status === 'shipped') return 'badge--blue';
  return 'badge--gray';
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : data.orders ?? []))
      .catch(() => setError('Erro ao carregar pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  function toggleExpand(id) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="orders-title">MEUS PEDIDOS</h1>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <span className="spinner" style={{ width: 40, height: 40 }} />
          </div>
        )}

        {error && <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <PackageIcon sx={{ fontSize: '3rem', opacity: 0.4, display: 'block', margin: '0 auto 16px' }} />
            <p>Você ainda não realizou nenhum pedido.</p>
          </div>
        )}

        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div
              className="order-header"
              onClick={() => toggleExpand(order.id)}
              role="button"
              aria-expanded={expanded === order.id}
            >
              <div>
                <div className="order-id">Pedido #{order.id?.slice(0, 8).toUpperCase()}</div>
                <div className="order-date">{formatDate(order.created_at)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span className={`order-status badge ${statusClass(order.status)}`}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <div>
                  <div className="order-items-count">
                    {order.items?.length ?? 0} ite{order.items?.length === 1 ? 'm' : 'ns'}
                  </div>
                  <div className="order-total">{formatCurrency(parseFloat(order.total ?? 0))}</div>
                </div>
                <span className="order-chevron">{expanded === order.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded === order.id && (
              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="order-item-row">
                      <div className="order-item-img">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} />
                        ) : (
                          <ShirtIcon sx={{ fontSize: '28px', opacity: 0.3 }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="order-item-name">{item.name}</div>
                        {item.size && (
                          <div className="order-item-meta">Tamanho: {item.size}</div>
                        )}
                      </div>
                      <div className="order-item-qty">× {item.quantity}</div>
                      <div className="order-item-price">
                        {formatCurrency(parseFloat(item.price) * item.quantity)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-muted)', padding: '12px 0', fontSize: '0.9rem' }}>
                    Detalhes dos itens indisponíveis.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
