import Countdown from '../Countdown/Countdown';
import { BoltIcon } from '../../../components/ui/Icons';
import './UrgencyBanner.css';

export default function UrgencyBanner() {
  return (
    <section className="urgency-section">
      <div className="container urgency-inner">
        <span className="urgency-tag"><BoltIcon sx={{ fontSize: '14px' }} /> Oferta Especial</span>
        <h2 className="urgency-title">
          LEVE 3,<br />
          <span className="urgency-title-accent">PAGUE 2</span>
        </h2>
        <p className="urgency-subtitle">Só até domingo à meia-noite</p>
        <Countdown />
        <a href="#produtos" className="btn-primary urgency-cta">
          Aproveitar Agora
        </a>
      </div>
    </section>
  );
}
