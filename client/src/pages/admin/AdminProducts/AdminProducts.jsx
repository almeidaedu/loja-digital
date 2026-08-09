import { useEffect, useState } from 'react';
import api from '../../../services/api';
import { formatCurrency } from '../../../utils/formatCurrency';
import { CheckCircleIcon, CancelIcon } from '../../../components/ui/Icons';
import './AdminProducts.css';

const BADGE_OPTIONS = [
  { value: '', label: 'Nenhum' },
  { value: 'best_seller', label: 'Mais Vendido' },
  { value: 'urgency', label: 'Urgência' },
  { value: 'new', label: 'Novo' },
];

const EMPTY_FORM = {
  categoryId: '',
  name: '',
  price: '',
  originalPrice: '',
  stock: '',
  badge: '',
  featured: false,
  active: true,
  description: '',
  imageUrl: '',
};

// Converte o produto vindo da API para os valores do formulário
function toFormValues(p) {
  return {
    categoryId: p.categoryId ?? '',
    name: p.name ?? '',
    price: p.price ?? '',
    originalPrice: p.originalPrice ?? '',
    stock: p.stock ?? '',
    badge: p.badge ?? '',
    featured: !!p.featured,
    active: !!p.active,
    description: p.description ?? '',
    imageUrl: p.imageUrl ?? '',
  };
}

function ProductForm({ initial, categories, onSave, onCancel, saving, saveError }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="product-form" noValidate>
      <div className="product-form-grid">
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Nome do produto *</label>
          <input
            name="name"
            className="form-input"
            placeholder="Ex: Camisa Flamengo 2024"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Categoria *</label>
          <select
            name="categoryId"
            className="form-input"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Preço atual (R$) *</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            placeholder="149.90"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Preço original (R$)</label>
          <input
            name="originalPrice"
            type="number"
            step="0.01"
            min="0"
            className="form-input"
            placeholder="199.90"
            value={form.originalPrice}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Estoque</label>
          <input
            name="stock"
            type="number"
            min="0"
            className="form-input"
            placeholder="50"
            value={form.stock}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Badge</label>
          <select
            name="badge"
            className="form-input"
            value={form.badge}
            onChange={handleChange}
          >
            {BADGE_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">URL da imagem</label>
          <input
            name="imageUrl"
            className="form-input"
            placeholder="https://..."
            value={form.imageUrl}
            onChange={handleChange}
          />
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Descrição</label>
          <textarea
            name="description"
            className="form-input"
            rows={3}
            placeholder="Descrição do produto..."
            value={form.description}
            onChange={handleChange}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group product-form-checks">
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
            />
            Em destaque
          </label>
          <label className="form-checkbox-label">
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={handleChange}
            />
            Ativo
          </label>
        </div>
      </div>

      {saveError && <p className="form-error" style={{ marginBottom: 12 }}>{saveError}</p>}

      <div className="product-form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? <span className="spinner" /> : 'Salvar Produto'}
        </button>
      </div>
    </form>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/products/admin/all?limit=100').then((r) => r.data.products ?? []),
      api.get('/categories').then((r) => r.data),
    ])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch(() => setError('Erro ao carregar dados.'))
      .finally(() => setLoading(false));
  }, []);

  function openNew() {
    setEditingProduct(null);
    setSaveError('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setSaveError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setSaveError('');
  }

  async function handleSave(formData) {
    if (!formData.name || !formData.price || !formData.categoryId) {
      setSaveError('Nome, preço e categoria são obrigatórios.');
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      if (editingProduct) {
        const { data } = await api.put(`/products/${editingProduct.id}`, formData);
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? (data.product ?? data) : p))
        );
      } else {
        const { data } = await api.post('/products', formData);
        setProducts((prev) => [data.product ?? data, ...prev]);
      }
      closeModal();
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Erro ao salvar produto.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeactivate(id) {
    if (!window.confirm('Desativar este produto? Ele some da loja, mas pode ser reativado aqui.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, active: false } : p)));
    } catch {
      alert('Erro ao desativar produto.');
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReactivate(id) {
    setDeletingId(id);
    try {
      const { data } = await api.put(`/products/${id}`, { active: true });
      setProducts((prev) => prev.map((p) => (p.id === id ? (data.product ?? { ...p, active: true }) : p)));
    } catch {
      alert('Erro ao reativar produto.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2 className="admin-page-title">Produtos</h2>
        <button className="btn-primary" onClick={openNew} style={{ padding: '10px 20px' }}>
          + Novo Produto
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : (
        <div className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Badge</th>
                  <th>Destaque</th>
                  <th>Ativo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={p.active ? undefined : { opacity: 0.45 }}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.categoryName ?? '—'}</td>
                    <td>{formatCurrency(parseFloat(p.price ?? 0))}</td>
                    <td>{p.stock ?? '—'}</td>
                    <td>
                      {p.badge ? (
                        <span className="badge badge--yellow">{p.badge}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                      )}
                    </td>
                    <td>{p.featured ? <CheckCircleIcon sx={{ fontSize: '16px', color: 'var(--accent-green)' }} /> : '—'}</td>
                    <td>{p.active ? <CheckCircleIcon sx={{ fontSize: '16px', color: 'var(--accent-green)' }} /> : <CancelIcon sx={{ fontSize: '16px', color: '#ef4444' }} />}</td>
                    <td>
                      <div className="product-actions">
                        <button
                          className="action-btn action-btn--edit"
                          onClick={() => openEdit(p)}
                        >
                          Editar
                        </button>
                        {p.active ? (
                          <button
                            className="action-btn action-btn--delete"
                            onClick={() => handleDeactivate(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? '...' : 'Desativar'}
                          </button>
                        ) : (
                          <button
                            className="action-btn action-btn--edit"
                            onClick={() => handleReactivate(p.id)}
                            disabled={deletingId === p.id}
                          >
                            {deletingId === p.id ? '...' : 'Reativar'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                      Nenhum produto cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box" style={{ maxWidth: 640 }}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 24 }}>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <ProductForm
              initial={editingProduct ? toFormValues(editingProduct) : null}
              categories={categories}
              onSave={handleSave}
              onCancel={closeModal}
              saving={saving}
              saveError={saveError}
            />
          </div>
        </div>
      )}
    </div>
  );
}
