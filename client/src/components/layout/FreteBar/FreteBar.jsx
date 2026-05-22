import { useCartStore } from '../../../store/cartStore';
import { formatCurrency } from '../../../utils/formatCurrency';
import './FreteBar.css';

const FRETE_THRESHOLD = 149;

export default function FreteBar() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  const remaining = Math.max(0, FRETE_THRESHOLD - total);
  const fillPct = Math.min(100, (total / FRETE_THRESHOLD) * 100);
  const unlocked = total >= FRETE_THRESHOLD;

  return (
    <div className="frete-bar">
      <div className="container">
        <div className="frete-bar-inner">
          {unlocked ? (
            <span className="highlight">🎉 Frete grátis desbloqueado!</span>
          ) : (
            <span>
              Faltam <span className="highlight">{formatCurrency(remaining)}</span> para frete grátis!
            </span>
          )}
          <div className="frete-progress-track" aria-hidden="true">
            <div
              className="frete-progress-fill"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
