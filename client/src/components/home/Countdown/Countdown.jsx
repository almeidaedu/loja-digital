import './Countdown.css';

const pad = (n) => String(n).padStart(2, '0');

// Só apresenta. Quem sabe o prazo e decide sumir quando acaba é o banner.
export default function Countdown({ days, hours, minutes, seconds }) {
  const blocks = [
    // Oferta de semanas mostrava "312 horas". Com dia inteiro, o bloco aparece.
    days > 0 && { value: days, label: days === 1 ? 'Dia' : 'Dias' },
    { value: pad(hours), label: 'Horas' },
    { value: pad(minutes), label: 'Minutos' },
    { value: pad(seconds), label: 'Segundos' },
  ].filter(Boolean);

  return (
    <div className="countdown" role="timer" aria-label="Tempo restante da oferta">
      {blocks.map((block) => (
        <div key={block.label} className="countdown-block">
          <span className="countdown-number">{block.value}</span>
          <span className="countdown-label">{block.label}</span>
        </div>
      ))}
    </div>
  );
}
