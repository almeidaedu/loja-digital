import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProductListing from './ProductListing';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

vi.mock('../../services/productService', () => ({
  productService: { getAll: vi.fn() },
}));
vi.mock('../../services/categoryService', () => ({
  categoryService: { getAll: vi.fn() },
}));

const product = (id) => ({ id, name: `Camisa ${id}`, slug: `camisa-${id}`, price: '100', rating: 5 });

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/produtos" element={<ProductListing />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductListing', () => {
  beforeEach(() => {
    categoryService.getAll.mockResolvedValue({
      categories: [{ id: 1, slug: 'retro', name: 'Coleção Retrô', product_count: 5 }],
    });
    productService.getAll.mockResolvedValue({
      products: [product(1), product(2)],
      total: 30,
      page: 1,
      limit: 12,
    });
  });

  // B1: a página lia `data.totalPages`, que a API não devolve.
  it('pagina a partir do `total` da API', async () => {
    renderAt('/produtos');

    const nav = await screen.findByRole('navigation', { name: 'Paginação' });
    expect(within(nav).getByRole('link', { name: '3' })).toHaveAttribute('href', '/produtos?page=3');
    expect(within(nav).queryByRole('link', { name: '4' })).not.toBeInTheDocument();
  });

  it('a página vem da URL, e o voltar a respeita', async () => {
    renderAt('/produtos?category=retro&page=2');

    const nav = await screen.findByRole('navigation', { name: 'Paginação' });
    expect(productService.getAll).toHaveBeenCalledWith({ page: 2, limit: 12, category: 'retro' });
    expect(within(nav).getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Página anterior' })).toHaveAttribute(
      'href',
      '/produtos?category=retro'
    );
  });

  it('na primeira página, "anterior" fica desabilitado', async () => {
    renderAt('/produtos');

    const nav = await screen.findByRole('navigation', { name: 'Paginação' });
    expect(within(nav).getByRole('link', { name: 'Página anterior' })).toHaveAttribute('aria-disabled', 'true');
    expect(within(nav).getByRole('link', { name: 'Próxima página' })).toHaveAttribute('href', '/produtos?page=2');
  });

  it('uma página só: sem paginação', async () => {
    productService.getAll.mockResolvedValue({ products: [product(1)], total: 1, page: 1, limit: 12 });
    renderAt('/produtos');

    await screen.findByRole('link', { name: 'Camisa 1' });
    expect(screen.queryByRole('navigation', { name: 'Paginação' })).not.toBeInTheDocument();
  });

  it('o filtro de categoria é link, e o título mostra a categoria ativa', async () => {
    renderAt('/produtos?category=retro');

    const filters = screen.getByRole('navigation', { name: 'Categorias' });
    const retro = await within(filters).findByRole('link', { name: /Coleção Retrô/ });
    expect(retro).toHaveAttribute('aria-current', 'page');
    expect(within(filters).getByRole('link', { name: 'Todos' })).toHaveAttribute('href', '/produtos');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Coleção Retrô');
  });

  it('falha da API vira mensagem, não lista vazia', async () => {
    productService.getAll.mockRejectedValue(new Error('500'));
    renderAt('/produtos');

    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar os produtos.');
  });
});
