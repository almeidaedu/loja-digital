import { useCountdown } from '../../../hooks/useCountdown';
import './Countdown.css';

export default function Countdown() {
  const { h, m, s } = useCountdown();

  return (
    <div className="countdown" role="timer" aria-label="Tempo restante da oferta">
      <div className="countdown-block">
        <span className="countdown-number">{h}</span>
        <span className="countdown-label">Horas</span>
      </div>
      <span className="countdown-sep" aria-hidden="true">:</span>
      <div className="countdown-block">
        <span className="countdown-number">{m}</span>
        <span className="countdown-label">Minutos</span>
      </div>
      <span className="countdown-sep" aria-hidden="true">:</span>
      <div className="countdown-block">
        <span className="countdown-number">{s}</span>
        <span className="countdown-label">Segundos</span>
      </div>
    </div>
  );
}
