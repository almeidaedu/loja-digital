import useFreteProgress from '../../../hooks/useFreteProgress';
import { formatCurrency } from '../../../utils/formatCurrency';
import { CheckCircleIcon } from '../../ui/Icons';
import './FreteBar.css';

export default function FreteBar() {
  const { remaining, fillPct, unlocked } = useFreteProgress();

  return (
    <div className="frete-bar">
      <div className="container">
        <div className="frete-bar-inner">
          {unlocked ? (
            <span className="highlight">
              <CheckCircleIcon sx={{ fontSize: '1rem', verticalAlign: '-0.2em', mr: '4px' }} />
              Frete grátis desbloqueado
            </span>
          ) : (
            <span>
              Faltam <span className="highlight">{formatCurrency(remaining)}</span> para frete grátis
            </span>
          )}
          <div className="frete-progress-track" aria-hidden="true">
            <div className="frete-progress-fill" style={{ width: `${fillPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
