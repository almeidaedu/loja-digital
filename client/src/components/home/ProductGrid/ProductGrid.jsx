import { useEffect, useState } from 'react';
import { useUiStore } from '../../../store/uiStore';
import { productService } from '../../../services/productService';
import ProductCard from '../ProductCard/ProductCard';
import ProductCardSkeleton from '../ProductCard/ProductCardSkeleton';
import './ProductGrid.css';

const FEATURED_COUNT = 8;

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    let cancelled = false;

    productService
      .getFeatured()
      .then(({ products }) => {
        if (!cancelled) setProducts(products ?? []);
      })
      .catch(() => {
        if (!cancelled) addToast({ type: 'error', message: 'Não foi possível carregar os produtos.' });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [addToast]);

  return (
    <section id="produtos" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Mais Vendidos</h2>
          <p className="section-subtitle">Os produtos favoritos da galera essa semana</p>
        </div>

        <div className="product-grid">
          {loading
            ? Array.from({ length: FEATURED_COUNT }, (_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
