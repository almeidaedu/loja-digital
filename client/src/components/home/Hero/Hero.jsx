import {
  BoltIcon,
  LocalShippingIcon,
  LockIcon,
  StarFilledIcon,
  FlameIcon,
} from '../../../components/ui/Icons';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="container hero-grid">
        <div className="hero-content">
          <p className="hero-eyebrow">Temporada 2024/25</p>
          <h1 className="hero-headline">
            Vista as cores<br />
            <span className="green">QUE VOCÊ DEFENDE</span>
          </h1>
          <p className="hero-subheadline">
            Camisas oficiais dos maiores clubes do Brasil. Entrega rápida,
            produto original, compra garantida.
          </p>
          <div className="hero-pills">
            <span className="hero-pill">
              <BoltIcon sx={{ fontSize: '14px' }} /> Entrega em 24h
            </span>
            <span className="hero-pill">
              <LocalShippingIcon sx={{ fontSize: '14px' }} /> Frete grátis +R$149
            </span>
            <span className="hero-pill">
              <LockIcon sx={{ fontSize: '14px' }} /> Compra segura
            </span>
          </div>
          <div className="hero-cta-group">
            <a href="#produtos" className="btn-primary">Ver Coleção Agora</a>
          </div>
          <div className="hero-social-proof">
            <div className="hero-avatars">
              <div className="hero-avatar av-a">G</div>
              <div className="hero-avatar av-b">R</div>
              <div className="hero-avatar av-c">L</div>
              <div className="hero-avatar av-d">M</div>
            </div>
            <span className="hero-social-text">+12.000 pedidos entregues</span>
          </div>
          <div className="hero-badges">
            <span className="hero-badge hero-badge--green">
              <StarFilledIcon sx={{ fontSize: '13px' }} /> 4.9 / 5.0 avaliação
            </span>
            <span className="hero-badge hero-badge--red">
              <FlameIcon sx={{ fontSize: '13px' }} /> +500 vendidos essa semana
            </span>
          </div>
        </div>

        <div className="hero-image-wrap">
          <div className="hero-shirt-visual">
            <div className="hero-glow-circle" />
            <div className="shirt-svg-wrap">
              <svg
                viewBox="0 0 200 220"
                xmlns="http://www.w3.org/2000/svg"
                className="shirt-svg"
                aria-label="Camisa de futebol"
              >
                <defs>
                  <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1a6b3c" />
                    <stop offset="100%" stopColor="#0d4a28" />
                  </linearGradient>
                  <linearGradient id="shirtHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </linearGradient>
                </defs>
                <path
                  d="M55 30 L20 60 L35 70 L30 180 L170 180 L165 70 L180 60 L145 30 C145 30 130 45 100 45 C70 45 55 30 55 30Z"
                  fill="url(#shirtGrad)"
                  stroke="#00FF87"
                  strokeWidth="1.5"
                />
                <path
                  d="M55 30 L20 60 L35 70 L30 180 L170 180 L165 70 L180 60 L145 30 C145 30 130 45 100 45 C70 45 55 30 55 30Z"
                  fill="url(#shirtHighlight)"
                />
                <path
                  d="M80 30 Q100 55 120 30"
                  fill="none"
                  stroke="#00FF87"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path d="M55 30 L20 60 L35 70 L55 50Z" fill="#0f5c32" stroke="#00FF87" strokeWidth="1" />
                <path d="M145 30 L180 60 L165 70 L145 50Z" fill="#0f5c32" stroke="#00FF87" strokeWidth="1" />
                <line x1="30" y1="80" x2="35" y2="175" stroke="#00FF87" strokeWidth="1" strokeOpacity="0.4" />
                <line x1="165" y1="80" x2="170" y2="175" stroke="#00FF87" strokeWidth="1" strokeOpacity="0.4" />
                <circle cx="100" cy="105" r="18" fill="none" stroke="#00FF87" strokeWidth="1.5" strokeOpacity="0.7" />
                <text x="100" y="111" textAnchor="middle" fill="#00FF87" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                  CBF
                </text>
              </svg>
            </div>
            <div className="shirt-tag shirt-tag-top">
              <span>NOVA TEMPORADA</span>
            </div>
            <div className="shirt-tag shirt-tag-bottom">
              <FlameIcon sx={{ fontSize: '13px' }} />
              <span>Mais vendida</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
