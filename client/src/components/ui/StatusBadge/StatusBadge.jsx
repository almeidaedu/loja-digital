import { getOrderStatus } from '../../../constants/orderStatus';

// Status de pedido em badge. Label e tom vêm de constants/orderStatus.js —
// ninguém monta o próprio mapa de status.
export default function StatusBadge({ status, className = '' }) {
  const { label, tone } = getOrderStatus(status);

  return (
    <span className={`badge badge--${tone}${className ? ` ${className}` : ''}`}>
      {label}
    </span>
  );
}
