import { useState } from 'react';
import { formatCurrency } from '../../../utils/formatCurrency';
import {
  StarFilledIcon,
  StarEmptyIcon,
  HeartFilledIcon,
  HeartOutlineIcon,
  ShirtIcon,
  TrophyIcon,
  FlameIcon,
  SparkleIcon,
} from '../../ui/Icons';
import './ProductCard.css';

const BADGE_MAP = {
  best_seller: { label: 'Mais Vendido', Icon: TrophyIcon, mod: 'badge--green' },
  urgency:     { label: 'Últimas unidades!', Icon: FlameIcon, mod: 'badge--red' },
  new:         { label: 'Novo', Icon: SparkleIcon, mod: 'badge--blue' },
};

function Stars({ rating }) {
  const full = Math.round(rating ?? 0);
  return (
    <span className="produto-stars" aria-label={`${rating} estrelas`}>
      {Array.from({ length: 5 }).map((_, i) =>
        i < full
          ? <StarFilledIcon key={i} sx={{ fontSize: '14px', color: '#FFD700' }} />
          : <StarEmptyIcon  key={i} sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)' }} />
      )}
    </span>
  );
}

export default function ProductCard({ product, onAddToCart }) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  const {
    name,
    price,
    originalPrice,
    imageUrl,
    badge,
    rating,
    reviewCount,
    categoryName,
  } = product;

  const installment = price / 12;
  const badgeInfo = BADGE_MAP[badge] ?? null;

  const handleAddToCart = async () => {
    if (!onAddToCart) return;
    try {
      await onAddToCart(product);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // erro tratado pelo pai
    }
  };

  return (
    <article className="produto-card">
      <div className="produto-image-wrap">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="produto-image" loading="lazy" />
        ) : (
          <div className="produto-image-placeholder" aria-hidden="true">
            <ShirtIcon sx={{ fontSize: '52px', opacity: 0.2 }} />
          </div>
        )}

        {badgeInfo && (
          <span className={`produto-badge ${badgeInfo.mod}`}>
            <badgeInfo.Icon sx={{ fontSize: '13px' }} />
            {badgeInfo.label}
          </span>
        )}

        <button
          className={`produto-heart ${liked ? 'liked' : ''}`}
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          type="button"
        >
          {liked
            ? <HeartFilledIcon  sx={{ fontSize: '16px', color: '#ef4444' }} />
            : <HeartOutlineIcon sx={{ fontSize: '16px' }} />
          }
        </button>
      </div>

      <div className="produto-info">
        {categoryName && (
          <span className="produto-time">{categoryName}</span>
        )}
        <h3 className="produto-name">{name}</h3>

        <div className="produto-rating">
          <Stars rating={rating} />
          {reviewCount != null && (
            <span className="produto-reviews">({reviewCount})</span>
          )}
        </div>

        <div className="produto-preco">
          {originalPrice && originalPrice > price && (
            <span className="produto-preco-original">
              {formatCurrency(originalPrice)}
            </span>
          )}
          <span className="produto-preco-atual">{formatCurrency(price)}</span>
        </div>

        <p className="produto-parcela">
          12x de {formatCurrency(installment)} sem juros
        </p>

        <button
          className="produto-btn"
          onClick={handleAddToCart}
          type="button"
          disabled={added}
        >
          {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </article>
  );
}
