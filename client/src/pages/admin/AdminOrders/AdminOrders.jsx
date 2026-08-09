import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';
import './AdminOrders.css';

const ALL_STATUSES = [
  'pending',
  'waiting_payment',
  'approved',
  'in_process',
  'rejected',
  'cancelled',
  'shipped',
  'delivered',
];

const STATUS_LABELS = {
  pending: 'Pendente',
  waiting_payment: 'Aguardando Pagamento',
  approved: 'Aprovado',
  in_process: 'Em Processamento',
  rejected: 'Rejeitado',
  cancelled: 'Cancelado',
  shipped: 'Enviado',
  delivered: 'Entregue',
};

function statusClass(status) {
  if (status === 'approved' || status === 'delivered') return 'badge--green';
  if (['pending', 'waiting_payment', 'in_process'].includes(status)) return 'badge--yellow';
  if (['rejected', 'cancelled'].includes(status)) return 'badge--red';
  if (status === 'shipped') return 'badge--blue';
  return 'badge--gray';
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    api
      .get('/orders/admin/all')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data.orders ?? [];
        setOrders(list);
      })
      .catch(() => setError('Erro ao carregar pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert('Erro ao atualizar status.');
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  const displayed = filter ? orders.filter((o) => o.status === filter) : orders;

  return (
    <div className="admin-orders">
      <h2 className="admin-page-title">Pedidos</h2>

      {/* Status filter */}
      <div className="orders-filter-bar">
        <button
          className={`filter-tab${!filter ? ' active' : ''}`}
          onClick={() => setFilter('')}
        >
          Todos ({orders.length})
        </button>
        {ALL_STATUSES.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          if (count === 0) return null;
          return (
            <button
              key={s}
              className={`filter-tab${filter === s ? ' active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <div className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Atualizar Status</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">#{order.id?.slice(0, 8).toUpperCase()}</td>
                    <td>{order.customerName ?? '—'}</td>
                    <td style={{ fontWeight: 700 }}>
                      {formatCurrency(parseFloat(order.totalAmount ?? 0))}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {order.paymentMethod ?? '—'}
                    </td>
                    <td>
                      <span className={`badge ${statusClass(order.status)}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td>
                      <select
                        className="status-select form-input"
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        style={{ padding: '6px 10px', fontSize: '0.8rem', minWidth: 160 }}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span className="spinner" style={{ width: 16, height: 16, marginLeft: 8, verticalAlign: 'middle' }} />
                      )}
                    </td>
                  </tr>
                ))}
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
