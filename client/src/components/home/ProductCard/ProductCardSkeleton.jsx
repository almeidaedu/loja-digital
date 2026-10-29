import './ProductCard.css';

// A forma do ProductCard enquanto carrega. Vitrine e catálogo usam o mesmo: antes
// a vitrine tinha o seu e o catálogo, retângulos com `style` inline.
export default function ProductCardSkeleton() {
  return (
    <div className="produto-card produto-card--skeleton" aria-hidden="true">
      <div className="skeleton produto-skeleton-image" />
      <div className="produto-info">
        <div className="skeleton produto-skeleton-line produto-skeleton-line--short" />
        <div className="skeleton produto-skeleton-line" />
        <div className="skeleton produto-skeleton-line produto-skeleton-line--medium" />
        <div className="skeleton produto-skeleton-price" />
        <div className="skeleton produto-skeleton-btn" />
      </div>
    </div>
  );
}
