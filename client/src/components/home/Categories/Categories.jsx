import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../../services/categoryService';
import Reveal from '../../ui/Reveal/Reveal';
import { StadiumIcon } from '../../ui/Icons';
import './Categories.css';

const MAX_CATEGORIES = 6;

export default function Categories() {
  // null = carregando. Falha e lista vazia dão no mesmo: não há o que mostrar.
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    categoryService
      .getAll()
      .then(({ categories }) => setCategories(categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  // Categoria sem produto ativo leva a uma listagem vazia — não vale o card.
  const visible = categories?.filter((c) => c.product_count > 0).slice(0, MAX_CATEGORIES);
  if (visible?.length === 0) return null;

  return (
    <section id="categorias" className="section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Comprar por Time</h2>
          <p className="section-subtitle">Encontre a camisa do seu clube favorito</p>
        </div>

        {/* B9: o reveal era um IntersectionObserver armado no mount da Home, antes
            dos cards existirem — eles nasciam com `opacity: 0` e ficavam assim. O
            Reveal observa o próprio elemento, e a grade é a mesma do skeleton aos
            dados, então a troca acontece sem animar de novo. */}
        <Reveal className="categories-grid">
          {visible
            ? visible.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/produtos?category=${encodeURIComponent(cat.slug)}`}
                  className="category-card"
                >
                  <span className="category-icon">
                    <StadiumIcon sx={{ fontSize: '28px' }} />
                  </span>
                  <span className="category-name">{cat.name}</span>
                  <span className="category-count">
                    {cat.product_count} {cat.product_count === 1 ? 'produto' : 'produtos'}
                  </span>
                </Link>
              ))
            : Array.from({ length: MAX_CATEGORIES }, (_, i) => (
                <div key={i} className="category-card category-card--skeleton" aria-hidden="true">
                  <div className="skeleton category-skeleton-icon" />
                  <div className="skeleton category-skeleton-name" />
                  <div className="skeleton category-skeleton-count" />
                </div>
              ))}
        </Reveal>
      </div>
    </section>
  );
}
