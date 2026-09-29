import { useEffect, useState } from 'react';
import { useUiStore } from '../../../store/uiStore';
import useAddToCart from '../../../hooks/useAddToCart';
import ProductCard from '../ProductCard/ProductCard';
import './ProductGrid.css';

function SkeletonCard() {
  return (
    <div className="produto-card skeleton-card" aria-hidden="true">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line price" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const addToast = useUiStore((s) => s.addToast);
  const addToCart = useAddToCart();

  useEffect(() => {
    let cancelled = false;

    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products/featured');
        if (!res.ok) throw new Error('Falha ao carregar produtos');
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? []);
      } catch {
        if (!cancelled) {
          addToast({ type: 'error', message: 'Não foi possível carregar os produtos.' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFeatured();
    return () => { cancelled = true; };
  }, [addToast]);

  return (
    <section className="product-grid-section" id="produtos">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Mais Vendidos</h2>
          <p className="section-subtitle">Os produtos favoritos da galera essa semana</p>
        </div>

        <div className="product-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={addToCart}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
