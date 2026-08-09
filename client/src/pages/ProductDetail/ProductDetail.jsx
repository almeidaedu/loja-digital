import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/formatCurrency';
import { StarFilledIcon, ShirtIcon } from '../../components/ui/Icons';import './ProductDetail.css';

const SIZES = ['PP', 'P', 'M', 'G', 'GG', 'GGG'];

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productService
      .getBySlug(slug)
      .then((data) => setProduct(data.product ?? data))
      .catch(() => setError('Produto não encontrado.'))
      .finally(() => setLoading(false));
  }, [slug]);

  function changeQuantity(delta) {
    setQuantity((prev) => Math.min(10, Math.max(1, prev + delta)));
  }

  async function handleAddToCart() {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity, selectedSize);
      setAddedMsg('Adicionado ao carrinho!');
      setTimeout(() => setAddedMsg(''), 2000);
    } catch {
      setAddedMsg('Erro ao adicionar.');
      setTimeout(() => setAddedMsg(''), 2000);
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleBuyNow() {
    if (!product) return;
    setAddingToCart(true);
    try {
      await addItem(product.id, quantity, selectedSize);
      navigate('/checkout');
    } catch {
      setAddingToCart(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <div className="container">
          <div className="detail-grid">
            <div className="skeleton" style={{ aspectRatio: '4/5', borderRadius: 8 }} />
            <div>
              <div className="skeleton" style={{ height: 24, width: '40%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 48, marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 24 }} />
              <div className="skeleton" style={{ height: 60, marginBottom: 24 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="detail-page">
        <div className="container">
          <p className="form-error">{error || 'Produto não encontrado.'}</p>
          <Link to="/produtos" className="btn-ghost" style={{ marginTop: 20 }}>
            ← Voltar aos produtos
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount =
    product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);

  const installments = Math.floor(parseFloat(product.price) / 12);

  return (
    <div className="detail-page">
      <div className="container">
        <Link to="/produtos" className="detail-back-link">← Todos os produtos</Link>

        <div className="detail-grid">
          {/* Image */}
          <div className="detail-img-wrap">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="detail-img" />
            ) : (
              <div className="detail-img-placeholder">
                <ShirtIcon sx={{ fontSize: '72px', opacity: 0.2 }} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            {product.categoryName && (
              <span className="detail-category-badge">{product.categoryName}</span>
            )}

            <h1 className="detail-title">{product.name}</h1>

            {/* Stars placeholder */}
            <div className="detail-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarFilledIcon key={i} sx={{ fontSize: '16px', color: '#FFD700' }} />
              ))}
              <span className="detail-review-count">(47 avaliações)</span>
            </div>

            {/* Price */}
            <div className="detail-price-block">
              {hasDiscount && (
                <div className="detail-price-original">
                  {formatCurrency(parseFloat(product.originalPrice))}
                </div>
              )}
              <div className="detail-price-actual">
                {formatCurrency(parseFloat(product.price))}
              </div>
              <div className="detail-price-parcela">
                ou 12× de {formatCurrency(installments)} sem juros
              </div>
            </div>

            {/* Size selector */}
            <div>
              <p className="detail-label">
                Tamanho: <strong>{selectedSize}</strong>
              </p>
              <div className="size-selector">
                {SIZES.map((size) => (
                  <button
                    key={size}
                    className={`size-btn${selectedSize === size ? ' active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity stepper */}
            <div style={{ marginBottom: 24 }}>
              <p className="detail-label">Quantidade</p>
              <div className="detail-qty-stepper">
                <button
                  className="qty-btn"
                  onClick={() => changeQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span className="qty-display">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => changeQuantity(1)}
                  disabled={quantity >= 10}
                >
                  +
                </button>
              </div>
            </div>

            {addedMsg && (
              <p className="detail-added-msg">{addedMsg}</p>
            )}

            <div className="detail-actions">
              <button
                className="btn-ghost"
                onClick={handleAddToCart}
                disabled={addingToCart}
                style={{ flex: 1, padding: '14px' }}
              >
                {addingToCart ? <span className="spinner" /> : 'Adicionar ao Carrinho'}
              </button>
              <button
                className="btn-primary"
                onClick={handleBuyNow}
                disabled={addingToCart}
                style={{ flex: 1, padding: '14px' }}
              >
                Comprar Agora
              </button>
            </div>

            {product.description && (
              <div className="detail-description">
                <h3 className="detail-description-title">Descrição</h3>
                <p>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
