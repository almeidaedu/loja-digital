import { useNavigate } from 'react-router-dom';
import { StadiumIcon } from '../../../components/ui/Icons';
import './Categories.css';

export default function Categories({ categories }) {
  const navigate = useNavigate();

  const handleClick = (slug) => {
    navigate(`/produtos?category=${slug}`);
  };

  if (!categories || categories.length === 0) {
    return (
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Comprar por Time</h2>
            <p className="section-subtitle">Encontre a camisa do seu clube favorito</p>
          </div>
          <div className="categories-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="category-card category-skeleton" aria-hidden="true">
                <div className="skeleton skeleton-flag" />
                <div className="skeleton skeleton-name" />
                <div className="skeleton skeleton-count" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Comprar por Time</h2>
          <p className="section-subtitle">Encontre a camisa do seu clube favorito</p>
        </div>
        <div className="categories-grid">
          {categories.slice(0, 6).map((cat) => (
            <button
              key={cat.slug}
              className="category-card animate-on-scroll"
              onClick={() => handleClick(cat.slug)}
              type="button"
            >
              <span className="category-flag">{cat.flag_emoji || <StadiumIcon sx={{ fontSize: '20px' }} />}</span>
              <span className="category-name">{cat.name}</span>
              <span className="category-count">{cat.product_count} produtos</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
