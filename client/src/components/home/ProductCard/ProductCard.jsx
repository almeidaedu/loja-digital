import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAddToCart from '../../../hooks/useAddToCart';
import { formatCurrency } from '../../../utils/formatCurrency';
import Rating from '../../ui/Rating/Rating';
import {
  HeartFilledIcon,
  HeartOutlineIcon,
  ImagePlaceholderIcon,
  TrophyIcon,
  FlameIcon,
  SparkleIcon,
} from '../../ui/Icons';
import './ProductCard.css';

const BADGE_MAP = {
  best_seller: { label: 'Mais Vendido', Icon: TrophyIcon, mod: 'best' },
  urgency: { label: 'Últimas unidades!', Icon: FlameIcon, mod: 'urgency' },
  new: { label: 'Novo', Icon: SparkleIcon, mod: 'new' },
};

// Quanto tempo o botão fica em "Adicionado!" antes de voltar.
const ADDED_FEEDBACK_MS = 2000;

export default function ProductCard({ product }) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  // O card busca a própria ação (G-04). Antes dependia de um `onAddToCart`
  // opcional com bail silencioso, e o botão morreu quando uma tela esqueceu de passar.
  const addToCart = useAddToCart();

  const { name, slug, imageUrl, badge, rating, reviewCount, categoryName } = product;
  // Decimal do Prisma chega como string: `'99.00' > '149.00'` é true em
  // comparação de texto, e o preço "de" menor que o atual aparecia riscado.
  const price = Number(product.price);
  const originalPrice = product.originalPrice == null ? null : Number(product.originalPrice);
  const badgeInfo = BADGE_MAP[badge] ?? null;

  useEffect(() => {
    if (!added) return undefined;
    const timer = setTimeout(() => setAdded(false), ADDED_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [added]);

  // "Adicionado!" só quando entrou de verdade. Antes aparecia também para quem
  // não estava logado — o hook devolvia false e o card ignorava.
  const handleAddToCart = async () => {
    if (await addToCart(product)) setAdded(true);
  };

  return (
    <article className="produto-card">
      <div className="produto-image-wrap">
        {imageUrl ? (
          // alt vazio: o nome logo abaixo já nomeia o produto e o link do card
          <img src={imageUrl} alt="" className="produto-image" loading="lazy" />
        ) : (
          <div className="produto-image-placeholder" aria-hidden="true">
            <ImagePlaceholderIcon sx={{ fontSize: '48px' }} />
          </div>
        )}

        {badgeInfo && (
          <span className={`produto-badge produto-badge--${badgeInfo.mod}`}>
            <badgeInfo.Icon sx={{ fontSize: '13px' }} />
            {badgeInfo.label}
          </span>
        )}

        <button
          type="button"
          className={`produto-heart${liked ? ' produto-heart--liked' : ''}`}
          onClick={() => setLiked((v) => !v)}
          aria-label={liked ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          aria-pressed={liked}
        >
          {liked ? <HeartFilledIcon sx={{ fontSize: '16px' }} /> : <HeartOutlineIcon sx={{ fontSize: '16px' }} />}
        </button>
      </div>

      <div className="produto-info">
        {categoryName && <span className="produto-time">{categoryName}</span>}

        {/* B6: o card não levava a lugar nenhum. O link é o nome, esticado sobre o
            card inteiro pelo `::after`; coração e botão ficam por cima dele. Um
            <Link> em volta do card aninharia botões dentro de link, que é HTML
            inválido e confunde leitor de tela. */}
        <h3 className="produto-name">
          <Link to={`/produtos/${slug}`} className="produto-link">
            {name}
          </Link>
        </h3>

        <div className="produto-rating">
          <Rating value={rating} size="14px" />
          {reviewCount != null && <span className="produto-reviews">({reviewCount})</span>}
        </div>

        <div className="produto-preco">
          {originalPrice > price && (
            <span className="produto-preco-original">
              <span className="sr-only">De </span>
              {formatCurrency(originalPrice)}
            </span>
          )}
          <span className="produto-preco-atual">{formatCurrency(price)}</span>
        </div>

        <p className="produto-parcela">12x de {formatCurrency(price / 12)} sem juros</p>

        <button type="button" className="produto-btn" onClick={handleAddToCart} disabled={added}>
          {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
        </button>
      </div>
    </article>
  );
}
