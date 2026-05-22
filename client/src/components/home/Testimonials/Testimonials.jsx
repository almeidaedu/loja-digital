import { StarFilledIcon, StarEmptyIcon } from '../../ui/Icons';import './Testimonials.css';

const TESTIMONIALS = [
  {
    initials: 'GS',
    avatarMod: 'av-green',
    name: 'Gabriel Silva',
    city: 'São Paulo, SP',
    stars: 5,
    text: 'Produto chegou em menos de 24h, qualidade impecável. A camisa é idêntica à original, tecido leve e o bordado do escudo ficou perfeito. Com certeza vou comprar de novo!',
    productBadge: 'Compra verificada',
  },
  {
    initials: 'RC',
    avatarMod: 'av-blue',
    name: 'Rafael Costa',
    city: 'Rio de Janeiro, RJ',
    stars: 5,
    text: 'Atendimento top, fui bem orientado sobre o tamanho e a camisa ficou perfeita. Recebi em 2 dias, embalagem excelente. Recomendo muito a loja para todos os torcedores!',
    productBadge: 'Compra verificada',
  },
  {
    initials: 'LM',
    avatarMod: 'av-orange',
    name: 'Lucas Martins',
    city: 'Belo Horizonte, MG',
    stars: 5,
    text: 'Melhor loja para camisas de futebol! Preço justo, produto original com nota fiscal, entrega super rápida. Já comprei 3 camisas e todas chegaram em perfeito estado.',
    productBadge: 'Compra verificada',
  },
];

function Stars({ count }) {
  return (
    <div className="depo-stars" aria-label={`${count} estrelas`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < count
          ? <StarFilledIcon key={i} sx={{ fontSize: '16px', color: '#FFD700' }} />
          : <StarEmptyIcon  key={i} sx={{ fontSize: '16px', color: 'rgba(255,255,255,0.15)' }} />
      )}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials-header">
          <div className="testimonials-stat">
            <span className="testimonials-percent">98%</span>
            <div className="testimonials-header-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarFilledIcon key={i} sx={{ fontSize: '20px', color: '#FFD700' }} />
              ))}
            </div>
            <p className="testimonials-label">+5.000 avaliações verificadas</p>
          </div>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="depo-card">
              <div className="depo-header">
                <div className={`depo-avatar ${t.avatarMod}`}>{t.initials}</div>
                <div className="depo-meta">
                  <span className="depo-name">{t.name}</span>
                  <span className="depo-city">{t.city}</span>
                </div>
                <span className="depo-verified">Verificado</span>
              </div>
              <Stars count={t.stars} />
              <p className="depo-text">{t.text}</p>
              <span className="depo-product-badge">{t.productBadge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
