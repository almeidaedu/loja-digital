import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { PackageIcon, PaymentsIcon, CheckCircleIcon } from '../../../components/ui/Icons';
import './AdminDashboard.css';

const STATUS_LABELS = {
  approved: 'Aprovado',
  pending: 'Pendente',
  waiting_payment: 'Aguardando',
  in_process: 'Em processo',
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

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/admin/all?limit=5')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : r.data.orders ?? [];
        setOrders(list);
      })
      .catch(() => setError('Erro ao carregar pedidos.'))
      .finally(() => setLoading(false));
  }, []);

  const totalOrders = orders.length;
  const revenue = orders
    .filter((o) => o.status === 'approved' || o.status === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.total ?? 0), 0);
  const pending = orders.filter(
    (o) => o.status === 'pending' || o.status === 'waiting_payment'
  ).length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  const stats = [
    { label: 'Total de Pedidos',   value: totalOrders,          Icon: PackageIcon,    accent: false },
    { label: 'Receita (aprovados)', value: formatCurrency(revenue), Icon: PaymentsIcon, accent: true },
    { label: 'Pendentes',          value: pending,              Icon: PackageIcon,    accent: false },
    { label: 'Entregues',          value: delivered,            Icon: CheckCircleIcon, accent: false },
  ];

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  }

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard</h2>

      {/* Stat cards */}
      <div className="stat-cards">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card${s.accent ? ' stat-card--accent' : ''}`}>
            <span className="stat-icon"><s.Icon sx={{ fontSize: '28px' }} /></span>
            <div className="stat-value">{loading ? <span className="skeleton" style={{ width: 60, height: 28, display: 'block' }} /> : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="admin-section">
        <h3 className="admin-section-title">Últimos Pedidos</h3>

        {error && <p className="form-error">{error}</p>}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <span className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="mono">#{order.id?.slice(0, 8).toUpperCase()}</td>
                    <td>{order.user_name ?? order.customer_name ?? '—'}</td>
                    <td>{formatCurrency(parseFloat(order.total ?? 0))}</td>
                    <td>
                      <span className={`badge ${statusClass(order.status)}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
