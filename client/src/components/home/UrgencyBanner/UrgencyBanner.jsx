import { useSettingsStore } from '../../../store/settingsStore';
import { useCountdown } from '../../../hooks/useCountdown';
import Countdown from '../Countdown/Countdown';
import Button from '../../ui/Button/Button';
import { BoltIcon } from '../../ui/Icons';
import './UrgencyBanner.css';

// Tudo vem da `promo` das configurações da loja. Antes "LEVE 3, PAGUE 2" e "Só
// até domingo à meia-noite" eram texto fixo, com um contador que inventava o
// prazo por visitante: urgência falsa, ligada para todo mundo, para sempre.
export default function UrgencyBanner() {
  const { enabled, tag, title, subtitle, endsAt } = useSettingsStore((s) => s.settings.promo);
  const remaining = useCountdown(endsAt);

  // Desligada, sem título ou já encerrada: não há oferta para anunciar. O
  // `ended` some com o banner no segundo em que o prazo passa.
  if (!enabled || !title || remaining?.ended) return null;

  return (
    <section className="section urgency-section">
      <div className="container urgency-inner">
        {tag && (
          <span className="urgency-tag">
            <BoltIcon sx={{ fontSize: '14px' }} /> {tag}
          </span>
        )}
        <h2 className="urgency-title">{title}</h2>
        {subtitle && <p className="urgency-subtitle">{subtitle}</p>}
        {/* Sem `endsAt` a oferta não tem prazo, e então não tem contador. */}
        {remaining && <Countdown {...remaining} />}
        <Button href="#produtos" size="lg">
          Aproveitar agora
        </Button>
      </div>
    </section>
  );
}
