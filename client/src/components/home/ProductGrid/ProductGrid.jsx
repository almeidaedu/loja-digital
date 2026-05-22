import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { useUiStore } from '../../../store/uiStore';
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

  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useUiStore((s) => s.addToast);

  useEffect(() => {
    let cancelled = false;

    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products/featured');
        if (!res.ok) throw new Error('Falha ao carregar produtos');
        const data = await res.json();
        if (!cancelled) setProducts(data.products ?? []);
      } catch (err) {
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

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id, 1, 'M');
      addToast({ name: product.name, message: 'adicionado ao carrinho!', avatar: '🛒' });
    } catch {
      addToast({ type: 'error', message: 'Erro ao adicionar ao carrinho.' });
    }
  };

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
                  onAddToCart={handleAddToCart}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
