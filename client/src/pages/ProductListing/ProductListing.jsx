import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import useAddToCart from '../../hooks/useAddToCart';
import ProductCard from '../../components/home/ProductCard/ProductCard';
import './ProductListing.css';

export default function ProductListing() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get('category') || '';
  const [page, setPage] = useState(1);

  const addToCart = useAddToCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryService.getAll().then(({ categories }) => setCategories(categories ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingProducts(true);
    setError('');
    const params = { page, limit: 12 };
    if (activeCategory) params.category = activeCategory;

    productService
      .getAll(params)
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products ?? [];
        const pages = data.totalPages ?? 1;
        setProducts(list);
        setTotalPages(pages);
      })
      .catch(() => setError('Erro ao carregar produtos.'))
      .finally(() => setLoadingProducts(false));
  }, [activeCategory, page]);

  function handleCategoryClick(slug) {
    setPage(1);
    if (slug === activeCategory) {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  }

  function handlePageChange(newPage) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="listing-page">
      <div className="container">
        <h1 className="listing-title">TODOS OS PRODUTOS</h1>

        <div className="listing-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <p className="sidebar-title">Categorias</p>

            <button
              className={`category-filter-btn${!activeCategory ? ' active' : ''}`}
              onClick={() => handleCategoryClick('')}
            >
              <span>Todos</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-filter-btn${activeCategory === cat.slug ? ' active' : ''}`}
                onClick={() => handleCategoryClick(cat.slug)}
              >
                <span>{cat.name}</span>
                {cat.product_count !== undefined && (
                  <span className="category-count">{cat.product_count}</span>
                )}
              </button>
            ))}
          </aside>

          {/* Products area */}
          <div className="products-area">
            {loadingProducts ? (
              <div className="products-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 320, borderRadius: 8 }} />
                ))}
              </div>
            ) : error ? (
              <p className="form-error" style={{ textAlign: 'center' }}>{error}</p>
            ) : products.length === 0 ? (
              <div className="listing-empty">
                <p>Nenhum produto encontrado nesta categoria.</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}

            {totalPages > 1 && !loadingProducts && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn${p === page ? ' active' : ''}`}
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="page-btn"
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
