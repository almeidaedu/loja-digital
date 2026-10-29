import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import ProductCard from '../../components/home/ProductCard/ProductCard';
import ProductCardSkeleton from '../../components/home/ProductCard/ProductCardSkeleton';
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/Icons';
import './ProductListing.css';

const PAGE_SIZE = 12;

// Categoria e página moram na URL: dá para compartilhar o link, e o voltar
// devolve a página certa. Antes `page` era state local — sumia no voltar.
function listingHref(category, page = 1) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/produtos?${query}` : '/produtos';
}

// Mesma rota, outra página: o useScrollRestoration só rola em troca de pathname.
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

export default function ProductListing() {
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') ?? '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService
      .getAll()
      .then(({ categories }) => setCategories(categories ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const params = { page, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;

    productService
      .getAll(params)
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar os produtos.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCategory, page]);

  // B1: a API devolve `{ products, total, page, limit }`. A página lia
  // `data.totalPages`, que não existe — a paginação nunca aparecia.
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <div className="listing-page">
      <div className="container">
        <h1 className="listing-title">{activeName ?? 'Todos os produtos'}</h1>

        <div className="listing-layout">
          <nav className="listing-sidebar" aria-label="Categorias">
            <p className="listing-sidebar-title">Categorias</p>
            <Link
              to={listingHref('')}
              className={`listing-filter${!activeCategory ? ' listing-filter--active' : ''}`}
              aria-current={!activeCategory ? 'page' : undefined}
            >
              Todos
            </Link>
            {categories.map((cat) => {
              const active = activeCategory === cat.slug;
              return (
                <Link
                  key={cat.id}
                  to={listingHref(cat.slug)}
                  className={`listing-filter${active ? ' listing-filter--active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  <span>{cat.name}</span>
                  <span className="listing-filter-count">{cat.product_count}</span>
                </Link>
              );
            })}
          </nav>

          <div className="listing-results">
            {loading ? (
              <div className="listing-products">
                {Array.from({ length: 6 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <p className="listing-message form-error" role="alert">
                {error}
              </p>
            ) : products.length === 0 ? (
              <p className="listing-message">Nenhum produto encontrado nesta categoria.</p>
            ) : (
              <div className="listing-products">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {totalPages > 1 && !loading && (
              <nav className="listing-pagination" aria-label="Paginação">
                <PageLink to={page > 1 && listingHref(activeCategory, page - 1)} label="Página anterior">
                  <ChevronLeftIcon sx={{ fontSize: '20px' }} />
                </PageLink>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <PageLink key={p} to={listingHref(activeCategory, p)} current={p === page}>
                    {p}
                  </PageLink>
                ))}
                <PageLink
                  to={page < totalPages && listingHref(activeCategory, page + 1)}
                  label="Próxima página"
                >
                  <ChevronRightIcon sx={{ fontSize: '20px' }} />
                </PageLink>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Sem destino (primeira/última página), vira um span desabilitado: link sem
// href não é link, e um <a> que não vai a lugar nenhum engana o teclado.
function PageLink({ to, label, current = false, children }) {
  if (!to) {
    return (
      <span className="listing-page-btn" aria-disabled="true" aria-label={label} role="link">
        {children}
      </span>
    );
  }
  return (
    <Link
      to={to}
      onClick={scrollToTop}
      className={`listing-page-btn${current ? ' listing-page-btn--current' : ''}`}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}
