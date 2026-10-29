import { useSettingsStore } from '../../../store/settingsStore';
import Reveal from '../../ui/Reveal/Reveal';
import { StarFilledIcon, StarEmptyIcon } from '../../ui/Icons';
import './Testimonials.css';

// Depoimentos de exemplo do template. Não levam selo de "verificado": ninguém
// verificou compra nenhuma, e o selo era a parte desonesta da seção.
const SEED_TESTIMONIALS = [
  {
    name: 'Gabriel Silva',
    city: 'São Paulo, SP',
    stars: 5,
    text: 'Produto chegou em menos de 24h, qualidade impecável. A camisa é idêntica à original, tecido leve e o bordado do escudo ficou perfeito. Com certeza vou comprar de novo!',
  },
  {
    name: 'Rafael Costa',
    city: 'Rio de Janeiro, RJ',
    stars: 5,
    text: 'Atendimento top, fui bem orientado sobre o tamanho e a camisa ficou perfeita. Recebi em 2 dias, embalagem excelente. Recomendo muito a loja para todos os torcedores!',
  },
  {
    name: 'Lucas Martins',
    city: 'Belo Horizonte, MG',
    stars: 5,
    text: 'Melhor loja para camisas de futebol! Preço justo, produto original com nota fiscal, entrega super rápida. Já comprei 3 camisas e todas chegaram em perfeito estado.',
  },
];

const AVATAR_TONES = ['accent', 'info', 'warning'];

const ratingFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat('pt-BR');

function initials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('');
}

function Stars({ value, size }) {
  const filled = Math.round(value);
  return (
    <span className="testimonial-stars" role="img" aria-label={`${filled} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) =>
        i < filled ? (
          <StarFilledIcon key={i} sx={{ fontSize: size }} />
        ) : (
          <StarEmptyIcon key={i} className="testimonial-star--empty" sx={{ fontSize: size }} />
        )
      )}
    </span>
  );
}

export default function Testimonials() {
  const { stats, seedTestimonials } = useSettingsStore((s) => s.settings.social);

  // Ainda não existe fonte de depoimento real; sem os de exemplo não há o que mostrar.
  if (!seedTestimonials) return null;

  return (
    <section id="prova-social" className="section testimonials-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">O Que Dizem Nossos Clientes</h2>
          <p className="section-subtitle">Quem já comprou conta como foi</p>

          {/* Antes: "98%" e "+5.000 avaliações verificadas" cravados no JSX, e
              "Mais de 5.000 pedidos" no subtítulo da Home. Agora só aparece
              número que o lojista declarou nas configurações. */}
          {stats && (
            <div className="testimonials-rating">
              <span className="testimonials-rating-value">{ratingFormat.format(stats.rating)}</span>
              <Stars value={stats.rating} size="20px" />
              <span className="testimonials-rating-count">
                {countFormat.format(stats.reviews)} avaliações
              </span>
            </div>
          )}
        </div>

        <Reveal className="testimonials-grid">
          {SEED_TESTIMONIALS.map((t, i) => (
            <figure key={t.name} className="testimonial-card">
              <Stars value={t.stars} size="16px" />
              <blockquote className="testimonial-text">{t.text}</blockquote>
              <figcaption className="testimonial-author">
                <span
                  className={`testimonial-avatar testimonial-avatar--${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                  aria-hidden="true"
                >
                  {initials(t.name)}
                </span>
                <span className="testimonial-meta">
                  <span className="testimonial-name">{t.name}</span>
                  <span className="testimonial-city">{t.city}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
